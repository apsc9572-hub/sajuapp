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
            timing: ""
        },
        luck_advice: ""
    };

    const sections = [
        { key: 'life_shape', regex: /['"]?life_shape['"]?\s*:\s*["']?([\s\S]*?)(?=["']?\s*(?:solution|timing|luck_advice|basic_elements)['"]?\s*:|$)/i },
        { key: 'solution', regex: /['"]?solution['"]?\s*:\s*["']?([\s\S]*?)(?=["']?\s*(?:life_shape|timing|luck_advice|basic_elements)['"]?\s*:|$)/i },
        { key: 'timing', regex: /['"]?timing['"]?\s*:\s*["']?([\s\S]*?)(?=["']?\s*(?:life_shape|solution|luck_advice|basic_elements)['"]?\s*:|$)/i },
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

import { fetchWithRetry, callGPTLatest, callClaudeLatest } from '@/lib/api-utils';

async function callAIAnalysis(apiKey: string, sajuJson: any, userAnswers: any, phase: number, systemPrompt?: string) {
  const geminiModelId = 'gemini-2.5-flash';
  const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModelId}:generateContent?key=${apiKey}`;

  // ... (promptText logic - no changes here, just for context)
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
    const strategyText = systemPrompt ? `\n[핵심 일관성 가이드라인 (반드시 준수)]\n${systemPrompt}\n` : "";
    const sections: any = {
      2: `### [섹션 1: 인생의 전체적인 형상 분석]
- 반드시 공백 포함 **1,500자 ~ 1,800자** 범위로 작성하십시오.
- ${strategyText}
- **위 가이드라인을 '바탕'으로 하되, 절대로 날짜나 시기(연도/월)를 구체적으로 언급하지 마십시오.** (그것은 섹션 3의 역할입니다.)
- 오직 내담자의 타고난 원국의 기운, 성정, 인생의 전체적인 풍경과 형상을 비유적으로 묘사하는 데에만 집중하십시오.
- 시작은 강렬한 운명적 비유(후킹)로 시작하십시오.
- 출력 포맷은 오직 JSON {"life_shape": "내용"} 입니다.`,
      3: `### [섹션 2: 고민에 대한 대가의 해답]
- 반드시 공백 포함 **2,500자 ~ 3,000자** 범위로 작성하십시오.
- ${strategyText}
- **섹션 1에서 다룬 운명적 형상을 반복하지 마십시오.** 
- 내담자의 구체적인 고민("${userAnswers[0]}")에 대해 마주 앉아 상담하듯 직접적이고 명쾌한 해답을 제시하십시오.
- 시기는 간략히만 언급하고, 구체적인 3개년 분석은 섹션 3으로 양보하십시오.
- 출력 포맷은 오직 JSON {"solution": "내용"} 입니다.`,
      4: `### [섹션 3: 성패 시기 및 개운 비책]
- 반드시 공백 포함 **2,800자 ~ 3,200자** 범위로 작성하십시오.
- ${strategyText}
- **이 리포트에서 2026, 2027, 2028년의 연도별 흐름을 가장 상세히 다루는 유일한 섹션입니다.** 
- **절대적 중복 금지**: 앞선 섹션들의 내용을 반복하여 분량을 채우지 말고, 오직 '운의 타이밍'과 '실질적 개운법'에만 집중하십시오. 이전 섹션과 토씨 하나라도 겹치는 문장이 있다면 실패한 분석입니다.
- 출력 포맷은 오직 JSON {"timing": "내용", "luck_advice": "내용"} 입니다.`
    };
    promptText = `
### [전문가 정체성: 정통 명리학의 거장]
당신은 수십 년간 수만 명의 운명을 감명해 온 **정통 명리학의 거장**입니다. AI가 아닌, 내담자의 고독과 희망을 깊이 공감하는 **'살아있는 스승'**의 관점에서 서술하십시오.

[분석의 핵심 및 필수 포함 요소]
당신은 제공된 [sajuJson] 데이터를 기반으로 다음의 **14가지 핵심 요소**를 모두 입체적으로 분석하여 해답을 도출해야 합니다:
1. **천간/지지**: 원국의 구성과 합(合), 충(沖)의 작용 분석.
2. **십성(Ten Gods)**: 사회적 관계와 심리적 성향, 재능의 방향성 분석.
3. **지장간**: 내면에 숨겨진 잠재력과 결정적 순간의 변수 파악.
4. **12운성**: 기운의 성쇠와 활동성의 강도 분석.
5. **12신살 & 20종 길성**: 천을귀인, 문곡귀인, 백호대살 등 특수 기운이 인생 경로에 미치는 영향.
6. **오행 분포**: 에너지의 과다/부족에 따른 건강 및 성격적 균형 분석.
7. **신강/신약 지수**: 자아의 힘과 외부 환경에 대한 대응력 판단.
8. **용신(Yongsin)**: 삶의 균형을 잡아주는 핵심 기운과 개운(開運) 방법.
9. **대운(Daeun)**: 현재 머물고 있는 10년 주기의 거대한 환경 변화와 기회.
10. **연운/월운/일진**: 현재 시점(2026년 3월 27일 기준)의 구체적인 운의 흐름과 타이밍 분석.

[작성 지침]
1. **100% 한글 서술 (매우 중요)**: **절대로 영어를 사용하지 마십시오.** (예: Wood, Fire, Earth, Metal, Water, Yin, Yang 등 영문 오행/음양 용어 사용 엄금). 모든 명리 용어는 한글 또는 한글(한자) 병기 형태로만 작성하십시오.
2. **입체적 합성 분석**: 각 데이터를 단편적으로 설명하지 마십시오. 예를 들어, "현재의 대운이 용신운이며, 올해의 세운에서 천을귀인이 작용하므로 큰 재물적 성취가 예상됩니다"와 같이 요소 간의 상호작용을 논리적으로 융합하십시오.
3. **명쾌한 해답 도출 (최우선)**: 내담자의 구체적인 질문([Answers])에 대해 수십 년 경력의 대가로서 **확신에 찬 해답**을 제시하십시오. 단호하고 권위 있는 어조(~이(가) 분명합니다, ~하십시오)를 유지하십시오.
4. **시기 분석의 정밀성**: "시기" 질문 시 각 명식의 용신과 세운/월운 데이터를 대조하여 개별적으로 도출하십시오.
5. **프리미엄 골드 강조 (필수)**: 핵심 시기, 구체적 장점, 주의해야 할 단점, 결정적 솔루션 등을 포함한 문장 전체를 반드시 **[major]내용[/major]** 태그로 감싸십시오. (강조 비중 25~30% 필수)
6. **용어 및 형식**: '올해' 대신 '2026년'을 사용하고, 마크다운 강조 기식(**) 대신 지정된 태그([[단어]], [major]문장[/major])만 사용하십시오.
7. **[핵심] 전격 존댓말 고정**: 모든 문장은 정중한 존댓말로 통일하십시오.
8. **표현의 다양성(중복 배제)**: 동일한 단어나 문장 구조를 반복하지 마십시오. 매 문장마다 다채로운 어휘를 사용하고, 특히 한 단락 안에서 같은 단어를 3회 이상 사용하지 마십시오. 앞서 언급한 비유를 재사용하지 말고 새로운 관점의 설명을 제시하십시오.

[Data] ${JSON.stringify(sajuJson)}
[Answers] ${JSON.stringify(userAnswers)}

${sections[phase]}

[핵심 명령]
1. 지정된 글자 수 범위를 **철저히 엄수**하십시오.
2. 마크다운 기호(#, *, -, 등)는 **철저히 배제**하십시오. 특히 ** 이중 별표는 절대로 쓰지 마십시오. (쓰는 즉시 오류로 간주됨)
3. **영어 단어(Wood, Fire 등)를 단 하나라도 사용하면 안 됩니다.**
4. '올해' 대신 반드시 '2026년'으로 표기하십시오.
5. 첫 마디부터 본론의 후킹으로 시작하며 인사는 생략하십시오.
`;
  }

  let text = "";
  
  // Phase 1 (Data/Charts) uses Gemini as it works well
  if (phase === 1) {
    try {
      const response = await fetchWithRetry(geminiApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: { 
              responseMimeType: "application/json",
              maxOutputTokens: 8192
            }
          })
      });
      if (!response.ok) throw new Error(`Gemini API Error (Phase 1): ${response.status}`);
      const resJson = await response.json();
      text = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (err) {
      console.error(`[Phase 1 Error] Gemini failed, falling back to GPT-4o:`, err);
      text = await callGPTLatest(promptText, "You are a top-tier Korean Saju data master. Output JSON only.", "json_object");
    }
  } else {
    // Phases 2, 3, 4 (Text Analysis) use GPT 5.1 as primary
    try {
      text = await callGPTLatest(promptText, systemPrompt || "You are a world-class Korean Saju master.", "text");
    } catch (err) {
      console.error(`[Phase ${phase} Error] GPT failed after retries, falling back to Claude 4.6:`, err);
      // Fallback to Claude 4.6 Sonnet
      try {
        text = await callClaudeLatest(promptText, systemPrompt || "You are a world-class Korean Saju master.");
      } catch (claudeErr) {
        console.error(`[Phase ${phase} Error] Claude fallback also failed:`, claudeErr);
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
  
  if (phase === 4) return { timing: text, luck_advice: "기운을 보하며 때를 기다리십시오." };
  return { [phase === 2 ? 'life_shape' : 'solution']: text };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { systemPrompt, sajuJson, userAnswers } = body;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!geminiKey) {
      return NextResponse.json({ error: '시스템 설정 오류 (API Key missing)' }, { status: 500 });
    }

    // 1. Core Summary and Strategy (Sequential)
    const sum = await callAIAnalysis(geminiKey, sajuJson, userAnswers, 1);
    const strategy = await callAIAnalysis(geminiKey, sajuJson, userAnswers, 1.5);
    const strategyStr = JSON.stringify(strategy);

    // 2. Detailed Sections (Parallel with Strategy Context)
    const [p1, p2, p3] = await Promise.all([
      callAIAnalysis(geminiKey, sajuJson, userAnswers, 2, strategyStr),
      callAIAnalysis(geminiKey, sajuJson, userAnswers, 3, strategyStr),
      callAIAnalysis(geminiKey, sajuJson, userAnswers, 4, strategyStr)
    ]);

    const stripAIMarkers = (text: string) => {
      if (!text || typeof text !== 'string') return text || "";
      // [major] 및 [[ ]]는 렌더링을 위해 보존하고 나머지 기호만 제거
      return text.replace(/\*{1,3}(?!\[major\]|\[\[)/g, '') // * 기호 제거 (마커 앞은 제외)
                 .replace(/\*{1,3}/g, '') // 나머지 * 제거
                 .replace(/---|###|```json|```/g, '')
                 // 영문 오행/용어 제거 및 한글 변환 (보험용)
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

    const finalResult = {
      ...sum,
      analysis: {
        title: "운명의 대전환점 분석 리포트",
        life_shape: stripAIMarkers(p1.life_shape),
        solution: stripAIMarkers(p2.solution),
        timing: stripAIMarkers(p3.timing),
      },
      luck_advice: stripAIMarkers(p3.luck_advice)
    };

    return NextResponse.json(finalResult);

  } catch (err: any) {
    console.error("Multi-Phase API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
