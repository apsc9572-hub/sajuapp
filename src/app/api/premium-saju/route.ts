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

async function callGemini(apiKey: string, sajuJson: any, userAnswers: any) {
  const modelId = 'gemini-2.5-flash';
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

  const promptText = `
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

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });

  if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);
  const resJson = await response.json();
  const text = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(text);
}

async function callClaude(apiKey: string, systemPrompt: string, sajuJson: any, userAnswers: any) {
  const modelId = 'claude-sonnet-4-5-20250929';
  const apiUrl = 'https://api.anthropic.com/v1/messages';

  const promptText = `
[Data] ${JSON.stringify(sajuJson)}
[Answers] ${JSON.stringify(userAnswers)}

### [Phase 2: 심층 작문 및 대안 제시]
당신은 30년 경력의 명리학 대가로서, 제공된 데이터를 바탕으로 아래 구조의 6000자 이상 압도적 분량의 리포트를 작성하십시오.

### [Phase 3: 출력 포맷 (Strict JSON ONLY)]
{
  "analysis": {
    "title": "운명의 대전환점 분석",
    "life_shape": "사주 전체의 형상을 대서사시처럼 장대하게 서술 (1500자 이상)",
    "solution": "질문에 대한 심층 해답과 영역별 조언 (3000자 이상)",
    "timing": "2026-2028 운의 흐름과 구체적 행동 지침 (1500자 이상)"
  },
  "luck_advice": "일상에서 실천 가능한 개운 비책"
}
`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: 8192,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{ role: 'user', content: promptText }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API Error: ${response.status} - ${errorText}`);
  }
  const resJson = await response.json();
  const text = resJson.content?.[0]?.text;

  // Clean and Parse logic from original route
  let s = text.indexOf('{'), e = text.lastIndexOf('}');
  let clean = text.substring(s, e + 1);
  try {
    return JSON.parse(clean);
  } catch {
    return extractDataRegex(text);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { systemPrompt, sajuJson, userAnswers } = body;
    
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!anthropicKey || !geminiKey) {
      return NextResponse.json({ error: '시스템 설정 오류 (API Key missing)' }, { status: 500 });
    }

    // Run both in parallel for speed
    const [geminiResult, claudeResult] = await Promise.all([
      callGemini(geminiKey, sajuJson, userAnswers),
      callClaude(anthropicKey, systemPrompt, sajuJson, userAnswers)
    ]);

    const stripAIMarkers = (text: string) => {
      if (!text || typeof text !== 'string') return text;
      return text.replace(/\*\*\*|---|###/g, '').trim();
    };

    // Merge results
    const finalResult = {
      ...geminiResult,
      analysis: {
        title: stripAIMarkers(claudeResult.analysis?.title),
        life_shape: stripAIMarkers(claudeResult.analysis?.life_shape),
        solution: stripAIMarkers(claudeResult.analysis?.solution),
        timing: stripAIMarkers(claudeResult.analysis?.timing),
      },
      luck_advice: stripAIMarkers(claudeResult.luck_advice)
    };

    return NextResponse.json(finalResult);

  } catch (err: any) {
    console.error("Split API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
