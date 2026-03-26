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
- 앞선 섹션들의 내용을 반복하여 분량을 채우지 말고, 오직 '운의 타이밍'과 '실질적 개운법'에만 집중하십시오.
- 출력 포맷은 오직 JSON {"timing": "내용", "luck_advice": "내용"} 입니다.`
    };
    promptText = `
### [전문가 정체성: 정통 명리학의 거장]
당신은 수십 년간 수만 명의 운명을 감명해 온 **정통 명리학의 거장**입니다. AI가 아닌, 내담자의 고독과 희망을 깊이 공감하는 **'살아있는 스승'**의 관점에서 서술하십시오.

[작성 지침]
1. **명쾌한 해답 도출 (최우선)**: 내담자의 구체적인 질문([Answers])에 대해 모호한 태도를 버리고, 수십 년 경력의 대가로서 **확신에 찬 해답**을 제시하십시오. "관찰됩니다", "가능성이 있습니다"와 같은 표현보다는 "~이(가) 분명합니다", "~해야만 합니다"와 같은 단호한 어조를 사용하십시오.
2. **시기 분석의 정밀성**: 질문에 "언제", "어느 때", "시기" 등의 단어가 포함된 경우, 제공된 사주 데이터(대운/세운 등)를 기반으로 **"2026년 늦가을", "2026년 9월에서 11월 사이"**와 같이 구체적인 시점을 명확히 짚어주십시오. 근거 없는 희망 고문이 아닌, 기운의 흐름에 근거한 실질적 타이밍을 제시하십시오. 이때 '올해'라는 단어 대신 반드시 '2026년'이라고 쓰십시오.
3. **용어 통일 (올해 -> 2026년)**: '올해', '금년'이라는 모호한 표현은 절대 사용하지 마십시오. 모든 시점 언급은 반드시 **'2026년'** 또는 **'2026'**으로 명시하십시오.
4. **특수 기호 절대 사용 금지**: ** 기호(bold)를 포함한 모든 마크다운 강조 기호나 특수 기호를 절대 사용하지 마십시오. 강조는 지정된 커스텀 태그([[단어]], [major]문장[/major])로만 수행하십시오.
5. **[핵심] 프리미엄 하이라이팅**: 핵심 단어는 [[단어]]로, 중요한 통찰 문장은 [major]문장[/major] 태그로 감싸십시오. (전체 분량의 약 15~20% 강조)
6. **부드럽고 품격 있는 말투**: 대가의 무게감이 느껴지도록 격식 있고 통찰력 있는 표현을 사용하십시오.

[Data] ${JSON.stringify(sajuJson)}
[Answers] ${JSON.stringify(userAnswers)}

${sections[phase]}

[핵심 명령]
1. 지정된 글자 수 범위를 **철저히 엄수**하십시오.
2. 마크다운 기호(#, *, -, 등)는 **철저히 배제**하십시오. 특히 ** 이중 별표는 절대로 쓰지 마십시오. (쓰는 즉시 오류로 간주됨)
3. '올해' 대신 반드시 '2026년'으로 표기하십시오.
4. 첫 마디부터 본론의 후킹으로 시작하며 인사는 생략하십시오.
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
      return text.replace(/\*{1,3}/g, '') // Remove all types of asterisk formatting (*, **, ***)
                 .replace(/---|###|```json|```/g, '')
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
