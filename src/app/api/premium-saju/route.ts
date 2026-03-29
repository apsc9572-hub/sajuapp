import { NextResponse } from 'next/server';
import { fetchWithRetry, callGPTLatest, callClaudeLatest } from '@/lib/api-utils';

function extractDataRegex(raw: string): any {
    if (!raw || typeof raw !== 'string') raw = "";
    const result: any = {
        headline: "귀하의 질문을 명리학적으로 풀어낸 답변입니다.",
        subheadline: "내담자의 운명을 관통하는 통찰입니다.",
        yongsin: "분석중",
        yongsin_desc: "데이터를 정밀 분석 중입니다.",
        basic_elements: { wood: 10, fire: 10, earth: 40, metal: 10, water: 30 },
        corrected_elements: { wood: 10, fire: 10, earth: 20, metal: 10, water: 50 },
        correction_reason: "기운 보정 풀이 중입니다.",
        analysis: { life_shape: "", solution: "", timing: "", detailed_fortune: "", turning_points: "" },
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
            let content = match[1].trim().replace(/["']\s*,?\s*$/, '').replace(/^["']/, '').replace(/\\n/g, '\n').replace(/\\"/g, '"');
            if (s.key === 'luck_advice') result.luck_advice = content;
            else result.analysis[s.key] = content;
        }
    });

    const rootKeys = ['headline', 'subheadline', 'yongsin', 'yongsin_desc'];
    rootKeys.forEach(k => {
        const regex = new RegExp(`['"]?\${k}['"]?\\s*:\\s*["']?([\\s\\S]*?)(?=["']?\\s*(?:analysis|luck_advice|basic_elements|corrected_elements|${rootKeys.filter(rk => rk !== k).join('|')})['"]?\\s*:|$)`, 'i');
        const match = raw.match(regex);
        if (match) {
            result[k] = match[1].trim().replace(/["']\s*,?\s*$/, '').replace(/^["']/, '').replace(/\\n/g, '\n').replace(/\\"/g, '"');
        }
    });
    return result;
}

async function callAIAnalysis(apiKey: string, sajuJson: any, userAnswers: any, phase: number, category: string, systemPrompt?: string) {
  const geminiModelId = 'gemini-1.5-pro'; // Use Pro for higher quality and longer outputs
  const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/\${geminiModelId}:generateContent?key=\${apiKey}`;
  const isTotalFortune = category === "인생총운";

  let promptText = "";
  if (phase === 1) {
    promptText = `[Data] \${JSON.stringify(sajuJson)}\n[Answers] \${JSON.stringify(userAnswers)}\n### [Phase 1: 오행 산출]\nJSON 포맷으로 headline, subheadline, yongsin, yongsin_desc, basic_elements, corrected_elements, correction_reason을 출력하십시오.`;
  } else if (phase === 1.5) {
    promptText = `### [Phase 1.5: 핵심 분석 전략]\nJSON 포맷으로 best_period, yongsin_strategy, core_advice를 출력하십시오.`;
  } else {
    const strategyText = systemPrompt ? `\n[핵심 일관성 가이드라인]\n\${systemPrompt}\n` : "";
    const sections: any = {
      2: isTotalFortune ? `### [섹션 1: 인생의 전체적인 형상 분석 - 운명의 풍경]
- 반드시 공백 포함 **1,800자 ~ 2,500자** 범위로 작성하십시오.
- **강제 구성**: 최소 **6개 이상의 긴 문단**으로 구성하십시오.
- \${strategyText}
- **분석 도메인**: 원국이 그리는 상징적 풍경과 가호에 집중하십시오. (날짜/시기 엄금)
- **프리미엄 골드 강조**: [major]내용[/major]`
      : `### [섹션 1: 인생의 전체적인 형상 분석 - 운명의 풍경]
- 반드시 공백 포함 **1,800자 ~ 2,500자** 범위로 작성하십시오.
- **강제 구성**: 최소 **6개 이상의 긴 문단**으로 구성하십시오.
- \${strategyText}
- **분석 도메인**: 비유와 형상에만 집중하십시오.
- **프리미엄 골드 강조**: [major]내용[/major]`,

      3: isTotalFortune ? `### [섹션 2: 성격 및 사회적 성향 - 명리학적 해법]
- 반드시 공백 포함 **1,800자 ~ 2,500자** 범위로 작성하십시오.
- **강제 구성**: 최소 **6개 이상의 긴 문단**으로 구성하십시오.
- \${strategyText}
- **분석 도메인**: 십성과 오행의 상생상극을 통한 기질 분석.
- **프리미엄 골드 강조**: [major]내용[/major]`
      : `### [섹션 2: 고민에 대한 대가의 해답 - 명리학적 해법]
- 반드시 공백 포함 **1,800자 ~ 2,500자** 범위로 작성하십시오.
- **강제 구성**: 최소 **6개 이상의 긴 문단**으로 구성하십시오.
- \${strategyText}
- **분석 도메인**: 고민("\${userAnswers[0]}")에 대한 십성 기반의 직설적 해답.
- **프리미엄 골드 강조**: [major]내용[/major]`,

      4: isTotalFortune ? `### [섹션 3: 분야별 상세 인생 운세 및 전환점]
- 반드시 공백 포함 **1,800자 ~ 2,500자** 범위로 작성하십시오. (매우 상세히)
- **강제 구성**: 최소 **6개 이상의 긴 문단**으로 구성하십시오.
- \${strategyText}
- **분석 도메인**: 재물, 사업, 연애, 건강, 자녀 및 인생의 주요 전환점 나이 명시.
- **프리미엄 골드 강조**: [major]내용[/major]`
      : `### [섹션 3: 3개년 상세 운세 및 개운 비책]
- 반드시 공백 포함 **1,800자 ~ 2,500자** 범위로 작성하십시오. (2026년 집중)
- **강제 구성**: 최소 **6개 이상의 긴 문단**으로 구성하십시오.
- \${strategyText}
- **분석 도메인**: 2026-2028 타이밍 및 실전 행동 강령.
- **프리미엄 골드 강조**: [major]내용[/major]`,
    };

    promptText = `
### [전문가 정체성: 정통 명리학의 거장]
당신은 수만 명을 감명한 거장입니다. 내담자의 질문에 대해 풍성하고 깊이 있는 통찰을 제공하십시오.

[분석의 핵심 데이터]
[Data] \${JSON.stringify(sajuJson)}
[Answers] \${JSON.stringify(userAnswers)}

\${sections[phase]}

[작성 지침]
1. **분량 엄수 (최우선)**: 공백 포함 **1,800자 ~ 2,500자**를 반드시 채우십시오.
2. **문단 강제**: 최소 **6개 이상의 긴 문단**으로 내용을 전개하십시오.
3. **오행 편중 금지**: 반드시 **십성, 12운성, 신살, 대운** 지표를 매 섹션마다 명시적으로 인용하십시오.
4. **중복 금지**: 섹션 간의 표현 중복을 엄격히 금지합니다.
5. **100% 한글**: 영어 사용 금지.
6. **프리미엄 골드**: 핵심 통찰에 [major]태그[/major]를 사용하십시오.
7. **포맷**: JSON 포맷으로 적절한 키에 내용을 담아 출력하십시오.
`;
  }

  let text = "";
  try {
    text = await callGPTLatest(promptText, "You are a master of Korean Saju. Output informative, long-form content.", phase === 1 || phase === 1.5 ? "json_object" : "text");
  } catch (err) {
    text = await callClaudeLatest(promptText, "You are a master of Korean Saju.");
  }
  
  if (!text) throw new Error(`AI 응답 실패 (Phase \${phase})`);
  if (phase === 1 || phase === 1.5) return JSON.parse(text);
  
  try {
    let s = text.indexOf('{'), e = text.lastIndexOf('}');
    if (s !== -1 && e !== -1) return JSON.parse(text.substring(s, e + 1));
  } catch { }

  if (phase === 4) return isTotalFortune ? { detailed_fortune: text } : { timing: text };
  return { [phase === 2 ? 'life_shape' : 'solution']: text };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sajuRes, userAnswers, phase, selectedCategory, systemPrompt } = body;
    const category = selectedCategory || (userAnswers[0]?.includes(': ') ? userAnswers[0].split(': ')[1] : "");
    const geminiKey = process.env.GEMINI_API_KEY!;

    if (phase === 1) return NextResponse.json(await callAIAnalysis(geminiKey, sajuRes, userAnswers, 1, category));
    if (phase === 1.5) return NextResponse.json(await callAIAnalysis(geminiKey, sajuRes, userAnswers, 1.5, category));

    const result = await callAIAnalysis(geminiKey, sajuRes, userAnswers, phase, category, systemPrompt);
    const strip = (t: string) => (t || "").replace(/\*{1,3}/g, '').replace(/---|###|```json|```/g, '').replace(/\bWood\b/gi, '목(木)').replace(/\bFire\b/gi, '화(火)').replace(/\bEarth\b/gi, '토(土)').replace(/\bMetal\b/gi, '금(金)').replace(/\bWater\b/gi, '수(수)').replace(/\bYin\b/gi, '음(陰)').replace(/\bYang\b/gi, '양(陽)').replace(/올해/g, '2026년').replace(/\[?(\/?)maj[oa]r\]?/gi, '[$1major]').replace(/★/g, '').trim();

    ['life_shape', 'solution', 'timing', 'detailed_fortune', 'turning_points', 'luck_advice'].forEach(k => {
      if (result[k]) result[k] = strip(result[k]);
    });
    result.isTotalFortune = category === "인생총운";
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
