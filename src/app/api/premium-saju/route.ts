import { NextResponse } from 'next/server';

/**
 * Ultimate regex-based parser that extracts data from even the most malformed/incomplete responses.
 */
function extractDataRegex(raw: string): any {
    if (!raw || typeof raw !== 'string') {
        raw = "";
    }
    const result: any = {
        headline: "귀하의 질문을 명리학적으로 풀어낸 답변입니다.",
        subheadline: "내담자의 운명을 관통하는 통찰입니다.",
        yongsin: "분석중",
        yongsin_desc: "데이터를 정밀 분석 중입니다.",
        basic_elements: { wood: 10, fire: 10, earth: 40, metal: 10, water: 30 },
        corrected_elements: { wood: 10, fire: 10, earth: 20, metal: 10, water: 50 },
        correction_reason: "기운 보정 풀이 중입니다.",
        analysis: {
            title: "운명의 기록",
            life_shape: "",
            solution: "",
            timing: "",
            detailed_fortune: "",
            turning_points: ""
        },
        luck_advice: ""
    };

    const sections = [
        { key: 'life_shape', regex: /['"]?life_shape['"]?\s*:\s*["']?([\s\S]*?)(?=["']?\s*(?:solution|timing|detailed_fortune|turning_points|luck_advice|basic_elements)['"]?\s*:|$)/i },
        { key: 'solution', regex: /['"]?solution['"]?\s*:\s*["']?([\s\S]*?)(?=["']?\s*(?:life_shape|timing|detailed_fortune|turning_points|luck_advice|basic_elements)['"]?\s*:|$)/i },
        { key: 'timing', regex: /['"]?timing['"]?\s*:\s*["']?([\s\S]*?)(?=["']?\s*(?:life_shape|solution|detailed_fortune|turning_points|luck_advice|basic_elements)['"]?\s*:|$)/i },
        { key: 'detailed_fortune', regex: /['"]?detailed_fortune['"]?\s*:\s*["']?([\s\S]*?)(?=["']?\s*(?:life_shape|solution|timing|turning_points|luck_advice|basic_elements)['"]?\s*:|$)/i },
        { key: 'turning_points', regex: /['"]?turning_points['"]?\s*:\s*["']?([\s\S]*?)(?=["']?\s*(?:life_shape|solution|timing|detailed_fortune|luck_advice|basic_elements)['"]?\s*:|$)/i },
        { key: 'luck_advice', regex: /['"]?luck_advice['"]?\s*:\s*["']?([\s\S]*?)(?=["']?\s*(?:analysis|basic_elements)['"]?\s*:|$)/i }
    ];

    sections.forEach(s => {
        const match = raw.match(s.regex);
        if (match) {
            let content = match[1].trim()
                .replace(/["']\s*,?\s*$/, '').replace(/^["']/, '')
                .replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\r/g, '');
            if (s.key === 'luck_advice') result.luck_advice = content;
            else result.analysis[s.key] = content;
        }
    });

    const rootKeys = ['headline', 'subheadline', 'yongsin', 'yongsin_desc'];
    rootKeys.forEach(k => {
        const regex = new RegExp(`['"]?${k}['"]?\\s*:\\s*["']?([\\s\\S]*?)(?=["']?\\s*(?:analysis|luck_advice|basic_elements|corrected_elements|${rootKeys.filter(rk => rk !== k).join('|')})['"]?\\s*:|$)`, 'i');
        const match = raw.match(regex);
        if (match) {
            result[k] = match[1].trim()
                .replace(/["']\s*,?\s*$/, '').replace(/^["']/, '')
                .replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\r/g, '');
        }
    });

    return result;
}

import { fetchWithRetry, callGPTPremium, callClaudeProfessional } from '@/lib/api-utils';

async function callAIAnalysis(apiKey: string, sajuJson: any, userAnswers: any, phase: number, category: string, systemPrompt?: string) {
  const geminiModelId = 'gemini-2.0-flash';
  const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModelId}:generateContent?key=${apiKey}`;
  const isTotalFortune = category === "인생총운";

  let promptText = "";
  if (phase === 1) {
    promptText = `
[Data] ${JSON.stringify(sajuJson)}
[Answers] ${JSON.stringify(userAnswers)}

### [Phase 1: 11분법 오행 산출 및 요약]
당신은 명리 데이터 전문가로서 아래 정보를 바탕으로 정확한 오행 비율과 용신을 판별해야 합니다.

1. **가중치 (총 11점)**: 
   - 천간(Stems): 연(1.0점), 월(1.5점), 일(1.5점), 시(1.0점)
   - 지지(Branches): 연(1.0점), 월(3.0점), 일(1.0점), 시(1.0점)
2. **조후 보정(겨울/습토)**: 
   - 사주 내 모든 '축토(丑)'와 '진토(辰)'의 가중치 점수를 100% 수(水) 기운으로 전환하십시오.

### [Phase 3: 출력 포맷 (Strict JSON ONLY)]
{
  "headline": "귀하의 질문을 명리학적으로 풀어낸 답변입니다.",
  "subheadline": "내담자의 현재 상황을 관통하는 통찰 (한 문장)",
  "yongsin": "청아매당 대가가 판별한 용신 (예: 목(木), 화(火))",
  "yongsin_desc": "용신에 대한 매우 간결한 설명",
  "basic_elements": {"wood": 0, "fire": 0, "earth": 0, "metal": 0, "water": 0},
  "corrected_elements": {"wood": 0, "fire": 0, "earth": 0, "metal": 0, "water": 0},
  "correction_reason": "보정의 의미 (우아한 표현)"
}
`;
  } else if (phase === 1.5) {
    promptText = `
### [Phase 1.5: 핵심 분석 전략 수립 (Core Strategy)]
당신은 명리 대가로서 본격적인 서술에 앞서, 내담자의 고민([Answers])과 사주 데이터([Data])를 바탕으로 흔들리지 않는 **'최종 분석 전략'**을 수립해야 합니다.
이 전략은 이후 모든 상세 분석 섹션의 유일한 '가이드라인'이 됩니다.

[분석 요구사항]
1. **시기 확정**: 고민을 해결하거나 신규 사업 등을 시작하기에 가장 적절한 '최상의 시기'(예: 2026년 5월-7월)를 단 하나로 확정하십시오.
2. **용신 활용**: 이 시기가 왜 좋은지 용신(Yongsin)과 운의 흐름(Seun/Daeun) 관점에서 1문장으로 요약하십시오.
3. **핵심 조언**: 내담자가 가장 주의해야 할 점이나 개운의 핵심 방침을 정하십시오.

[출력 포맷 (Strict JSON)]
{
  "best_period": "구체적인 시기(예: 2026년 가을, 9-11월)",
  "yongsin_strategy": "용신을 활용한 성공 전략 (1문장)",
  "core_advice": "전체 분석을 관통하는 핵심 조언"
}
`;
  } else {
    let strategyObj: any = {};
    if (systemPrompt) {
      try {
        strategyObj = typeof systemPrompt === 'string' ? JSON.parse(systemPrompt) : systemPrompt;
      } catch(e) { /* fallback */ }
    }
    const volumeRule = `- **필수 작성 분량 (절대 엄수)**: 반드시 **최소 5개의 긴 단락(Paragraph)**으로 구성된 장문을 작성하십시오. 내용 부족과 반복은 최악의 오류입니다. 각 단락은 새로운 관점과 분석을 담아야 합니다.`;

    const sections: any = {
      2: isTotalFortune ? `### [섹션 1: 인생 총론 - 타고난 운명의 형상]
${volumeRule}
- **데이터 분석 필수**: 단순히 오행만 풀이하지 마십시오. 십성, 12운성, 신살의 유기적 관계를 깊이 있게 분석하십시오.
- **배타적 영역**: 인생의 전체적인 풍경과 타고난 원국의 기운, 성정을 깊이 있는 비유(후킹)로 묘사하는 데 집중하십시오.
- 날짜나 시기(연도/월)나 전략은 절대 언급하지 마십시오.
- **프리미엄 골드 강조**: 핵심 문장을 **[major]내용[/major]** 태그로 감싸십시오.
- 출력 포맷: JSON {"life_shape": "내용"}` 
      : `### [섹션 1: 인생의 전체적인 형상 분석]
${volumeRule}
- **데이터 분석 필수**: 원국의 오행 분포뿐만 아니라 십성과 지장간에 숨겨진 기운을 종합하여 비유적으로 묘사하십시오.
- **배타적 영역**: 오직 내담자의 타고난 원국의 기운, 성정, 인생의 전체적인 형상을 비유적으로 묘사하는 데에만 집중하십시오. (미래 시기 예측 금지)
- **프리미엄 골드 강조**: 핵심 문장을 반드시 **[major]내용[/major]** 태그로 감싸십시오.
- 출력 포맷: JSON {"life_shape": "내용"}`,

      3: isTotalFortune ? `### [섹션 2: 성격 및 사회적 성향]
${volumeRule}
- **데이터 분석 필수**: 내담자의 사주에 나타난 사회적 재능(십성)과 활동성(12운성)을 근거로 입체적인 분석을 제공하십시오.
- **배타적 영역**: 십성과 오행의 분포를 기반으로 내담자의 본모습과 사회적 재능을 입체적으로 분석하는 데 집중하십시오.
- **프리미엄 골드 강조**: 핵심 재능을 **[major]내용[/major]** 태그로 감싸십시오.
- 출력 포맷: JSON {"solution": "내용"}`
      : `### [섹션 2: 고민에 대한 대가의 해답]
${volumeRule}
${strategyObj.core_advice ? `- **핵심 조언**: "${strategyObj.core_advice}" 이 지침을 자연스럽게 녹여내십시오.` : ""}
- **데이터 분석 필수**: 고민 해결을 위해 명리학적 대가의 관점에서 십성의 상호작용과 현재 운의 흐름을 분석하여 답을 제시하십시오.
- **배타적 영역**: 내담자의 구체적인 고민("${userAnswers[0]}")에 대해 직접적이고 [major]명쾌한 해답[/major]을 제시하는 데 완전히 집중하십시오. 다른 섹션의 내용을 반복하지 마십시오.
- 첫 문장은 반드시 사용자의 질문을 직접 언급하며 공감을 표하며 시작하십시오.
- 출력 포맷: JSON {"solution": "내용"}`,

      4: isTotalFortune ? `### [섹션 3: 분야별 상세 인생 운세]
${volumeRule}
- **데이터 분석 필수**: 분야별로 관련된 십성과 길성/흉살의 작용을 평생의 흐름 속에서 정밀하게 분석하십시오.
- **배타적 영역**: 특정 날짜나 연도를 언급하지 말고, 내담자의 평생 운세를 각 분야별로 깊이 있게 분석하는 데만 집중하십시오.
- **절대 금지**: 이모지 사용 금지, 구체적 연도(2026년 등) 언급 금지.
- **필수 포함 5대 테마**: 
  1. 재물운 / 2. 사업·직업운 / 3. 연애·결혼운 / 4. 건강운 / 5. 인간관계·자녀운
- **프리미엄 골드 강조**: 핵심 통찰 문장을 **[major]내용[/major]** 태그로 감싸십시오.
- 출력 포맷: JSON {"detailed_fortune": "내용", "turning_points": "내용"}` // 분야별 상세와 전환점
      : `### [섹션 3: 3개년 상세 운세 (2026-2028)]
${volumeRule}
${strategyObj.best_period ? `- **마스터 타임라인**: 가장 최적의 시기는 [${strategyObj.best_period}] 입니다.` : ""}
${strategyObj.yongsin_strategy ? `- **용신 전략**: "${strategyObj.yongsin_strategy}"` : ""}
- **연도별 분석 필수**: 각 연도의 세운과 원국 간의 합/충, 12운성, 신살 변화를 바탕으로 성패의 타이밍을 명시하십시오.
- **배타적 영역**: 내담자가 선택한 메뉴("${category || '선택 영역'}")를 중심으로 3년간의 운의 흐름과 타이밍 분석에만 집중하십시오.
- **분량 배정**: **2026년의 운세를 전체 섹션의 60% 이상**으로 매우 상세히 작성하십시오.
- **프리미엄 골드 강조**: 각 연도별 핵심 시점을 **[major]내용[/major]** 태그로 감싸하십시오.
- 출력 포맷: JSON {"timing": "내용", "luck_advice": "내용"}`,
    };

    promptText = `
### [전문가 정체성: 정통 명리학의 거장]
당신은 수십 년간 수만 명의 운명을 감명해 온 **정통 명리학의 거장**입니다. AI가 아닌, 내담자의 고독과 희망을 깊이 공감하는 **'살아있는 스승'**의 관점에서 서술하십시오.

[분석의 핵심 데이터]
[Data] ${JSON.stringify(sajuJson)}
[Answers] ${JSON.stringify(userAnswers)}

${sections[phase]}

[작성 지침]
1. **100% 한글 서술 (매우 중요)**: **절대로 영어를 사용하지 마십시오.** (예: Wood, Fire, Earth, Metal, Water, Yin, Yang 등 영문 오행/음양 용어 사용 엄금). 모든 명리 용어는 한글 또는 한글(한자) 병기 형태로만 작성하십시오.
2. **입체적 합성 분석**: 각 데이터를 단편적으로 설명하지 마십시오. 요소 간의 상호작용을 논리적으로 융합하십시오.
3. **명쾌한 해답 도출 (최우선)**: 대가로서 **확신에 찬 해답**을 제시하십시오. 단호하고 권위 있는 어조를 유지하십시오.
4. **프리미엄 골드 강조 (필수)**: 핵심 시기, 구체적 장점, 주의해야 할 단점, 결정적 솔루션 등을 포함한 문장 전체를 반드시 **[major]내용[/major]** 태그로 감싸십시오. (강조 비중 25~30% 필수)
5. **용어 및 형식**: '올해' 대신 '2026년'을 사용하고, 지정된 태그([major]문장[/major])만 사용하십시오. (주의: 태그 스펠링을 절대 틀리지 마십시오)
6. **[핵심] 전격 존댓말 고정**: 모든 문장은 정중한 존댓말로 통일하십시오.
7. **표현의 다양성 및 내부 중복 원천 차단 (매우 중요)**: 한 섹션 안에서 동일한 단어나 비유, 이미 설명한 특정 시기를 2회 이상 반복하여 분량을 채우는 것을 엄격히 금지합니다. 매 문장마다 새로운 통찰을 전진시키십시오.
8. **60:40 길흉 밸런스 (필수)**: 무조건 좋은 말만 하지 마십시오. 긍정적이고 희망적인 내용 60%와 함께, 반드시 주의해야 할 흉살, 건강 악화, 재물 손실 등의 '현실적인 경고' 40%를 조합하여 신뢰감을 주십시오.
9. **섹션 간 설정(날짜) 통일 및 배타적 영역 준수**: 섹션이 달라도 길일/흉일의 날짜가 엇갈려서는 안 됩니다. 하나의 일관된 '마스터 타임라인'을 유지하십시오. 각 섹션 고유의 주제(예: 섹션1=성격, 섹션3=시기)를 엄격히 한정하고 다른 섹션 내용을 침범하거나 중복 서술하지 마십시오.
10. **핵심 명령**: 지정된 글자 수 범위(2,000~2,500자)를 철저히 엄수하고 마크다운 기호를 전면 금지하십시오. 기계적인 서론 없이 본론으로 직행하십시오.
`;
  }

  let text = "";
  if (phase === 1) {
    try {
      const response = await fetchWithRetry(geminiApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: { responseMimeType: "application/json", maxOutputTokens: 8192 }
          })
      });
      if (!response.ok) throw new Error(`Gemini Error (Phase 1): ${response.status}`);
      const resJson = await response.json();
      text = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (err) {
      console.error(`[Phase 1 Error] Gemini failed, falling back to GPT 5.1 Mini:`, err);
      text = await callGPTPremium(promptText, "You are a top-tier Korean Saju data master. Output JSON only.", "json_object");
    }
  } else {
    try {
      text = await callGPTPremium(promptText, "You are a world-class Korean Saju master.", "text");
    } catch (err) {
      console.error(`[Phase ${phase} Error] GPT failed, falling back to Claude:`, err);
      try {
        text = await callClaudeProfessional(promptText, "You are a world-class Korean Saju master.");
      } catch (claudeErr) {
        throw claudeErr;
      }
    }
  }
  
  if (!text) throw new Error(`AI 응답을 받지 못했습니다. (Phase ${phase})`);
  if (phase === 1 || phase === 1.5) return JSON.parse(text);
  
  try {
    let s = text.indexOf('{'), e = text.lastIndexOf('}');
    if (s !== -1 && e !== -1) return JSON.parse(text.substring(s, e + 1));
  } catch { /* fallback */ }
  
  if (phase === 4) {
      if (isTotalFortune) return { detailed_fortune: text, turning_points: text }; // fallback parsing
      return { timing: text, luck_advice: "기운을 보하며 때를 기다리십시오." };
  }
  return { [phase === 2 ? 'life_shape' : 'solution']: text };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sajuRes, userAnswers, phase, selectedCategory } = body;
    const category = selectedCategory || (userAnswers[0]?.includes(': ') ? userAnswers[0].split(': ')[1] : "");
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!geminiKey) {
      return NextResponse.json({ error: '시스템 설정 오류 (API Key missing)' }, { status: 500 });
    }

    if (phase === 1) {
      const sum = await callAIAnalysis(geminiKey, sajuRes, userAnswers, 1, category);
      return NextResponse.json(sum);
    }

    if (phase === 1.5) {
      const strategy = await callAIAnalysis(geminiKey, sajuRes, userAnswers, 1.5, category);
      return NextResponse.json(strategy);
    }

    const { systemPrompt } = body;
    // Sequential fallback for phases
    const result = await callAIAnalysis(geminiKey, sajuRes, userAnswers, phase, category, systemPrompt);

    const stripAIMarkers = (text: string) => {
      if (!text || typeof text !== 'string') return text || "";
      return text.replace(/\*{1,3}(?!\[major\]|\[\[)/g, '')
                 .replace(/\*{1,3}/g, '')
                 .replace(/---|###|```json|```/g, '')
                 .replace(/\bWood\b/gi, '목(木)')
                 .replace(/\bFire\b/gi, '화(火)')
                 .replace(/\bEarth\b/gi, '토(土)')
                 .replace(/\bMetal\b/gi, '금(金)')
                 .replace(/\bWater\b/gi, '수(水)')
                 .replace(/\bYin\b/gi, '음(陰)')
                 .replace(/\bYang\b/gi, '양(陽)')
                 .replace(/\(올해\)/g, '(2026년)')
                 .replace(/\s올해\s/g, ' 2026년 ')
                 .trim();
    };

    if (result.life_shape) result.life_shape = stripAIMarkers(result.life_shape);
    if (result.solution) result.solution = stripAIMarkers(result.solution);
    if (result.timing) result.timing = stripAIMarkers(result.timing);
    if (result.detailed_fortune) result.detailed_fortune = stripAIMarkers(result.detailed_fortune);
    if (result.turning_points) result.turning_points = stripAIMarkers(result.turning_points);
    if (result.luck_advice) result.luck_advice = stripAIMarkers(result.luck_advice);

    // Explicitly pass isTotalFortune to the frontend
    result.isTotalFortune = category === "인생총운";

    return NextResponse.json(result);

  } catch (err: any) {
    console.error("Multi-Phase API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
