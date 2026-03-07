import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const apiKeyLine = envFile.split('\n').find(line => line.startsWith('GEMINI_API_KEY='));
const apiKey = apiKeyLine ? apiKeyLine.split('=')[1].trim() : '';

const ai = new GoogleGenAI({ apiKey });

const generateSystemPrompt = (json) => {
    // 가장 강한 기운과 약한 기운 (단순화된 해석)
    const sortedByRatio = Object.entries(json.elements_ratio).sort(([,a],[,b]) => b - a);
    const strongestElem = sortedByRatio[0][0]; // Earth, Wood etc
    const weakestElem = sortedByRatio[sortedByRatio.length-1][0];

    const elementNames = { "Wood": "목(Wood)", "Fire": "화(Fire)", "Earth": "토(Earth)", "Metal": "금(Metal)", "Water": "수(Water)" };
    const elemTraits = { 
        "Wood": "성장 욕구가 강하고 뻗어나가려는 성향이", 
        "Fire": "열정적이고 확산되는 에너지가", 
        "Earth": "책임감이 무겁고 포용력이", 
        "Metal": "결단력과 원칙 중심의 성향이", 
        "Water": "지혜롭지만 때로는 생각에 잠기는 성향이" 
    };
    const weakTraits = {
        "Wood": "시작하는 힘이나 의욕이 부족할 수",
        "Fire": "표현력이나 열정이 부족할 수",
        "Earth": "안정감이나 끈기가 부족할 수",
        "Metal": "결단력이나 맺고 끊음이 약할 수",
        "Water": "유연성이나 융통성이 부족할 수"
    };

    const strongStr = `${elementNames[strongestElem]} 기운이 강해 ${elemTraits[strongestElem]} 강하고,`;
    const weakStr = `${elementNames[weakestElem]} 기운이 약해 ${weakTraits[weakestElem]} 있습니다.`;

    return `System: 당신은 명리학에 정통한 20년 경력의 세련되고 다정한 심리 상담가입니다. 말투는 '~해요', '~군요', '~했나요?' 등 부드럽고 따뜻한 경어체를 사용하세요. 내담자의 과거 상처와 답답함을 깊이 공감하고 어루만지되, 앞으로 나아갈 길과 피해야 할 길(길흉)을 아주 명확하게 짚어주는 따뜻한 카리스마를 보여주세요.
절대 금지 사항 (Negative Prompt):
1. "안녕하세요", "상담가로서 말씀드립니다", "당신의 이야기를 듣게 되어 기쁩니다" 등 본인을 소개하거나 기계적으로 인사하는 오프닝 멘트는 절대 금지합니다. 바로 본론(분석)부터 시작하세요.
2. "**과거 공감:**", "**현재 분석:**", "**구체적 처방:**" 같은 마크다운 기호(**)나 소제목 태그는 절대 노출하지 마세요. 기호 없이 자연스럽게 문단 나누기로만 흐름을 이어가세요.
3. "관성", "비견", "원진살", "식상" 같은 명리학 전문 용어 및 한자어를 절대 포함하지 마세요. 반드시 내담자가 이해하기 쉬운 심리적 언어로 번역해서 풀어서 설명하세요.
4. "나와 비슷한 기운", "통제하려는 기운" 같은 기계적인 번역투 대신 "스스로 엄격하게 덧씌운 책임감", "완벽을 기하려는 마음", "주변의 시선을 의식하는 신중함" 등 문맥에 맞게 다채롭고 세련된 어휘로 변주하세요.

각 운세 카테고리(general, wealth, love, business, health, daeun, sinsal)를 각각 최소 400~500자 분량으로 길게 작성하되, 다음 3단 스토리텔링 구조를 자연스러운 문단으로만 구분하여 작성하세요 (기호 절대 금지):
- [1문단 - 과거 공감]: 사주 데이터를 바탕으로 내담자가 그동안 남몰래 겪었을 고충이나 감정을 먼저 읽어주고 깊이 위로하기.
- [2문단 - 현재 분석]: 현재 사주 원국의 길흉과 대운의 기운을 애매하지 않게 '명확히' 구분해서 설명하기. 좋은 점과 나쁜 점을 확실히 짚어주세요.
- [3문단 - 구체적 처방]: "긍정적으로 생각하세요", "명상하세요" 같은 뻔한 말은 절대 금지. 당장 실천할 수 있는 구체적이고 다정한 행동 지침(해결책)을 제안하세요.

User: 이 내담자는 일간이 ${json.user_info.day_master}(${json.user_info.gender === 'female' ? '여성' : '남성'})이며, ${strongStr} ${weakStr}
오행 세부 비율: 목 ${json.elements_ratio.Wood}%, 화 ${json.elements_ratio.Fire}%, 토 ${json.elements_ratio.Earth}%, 금 ${json.elements_ratio.Metal}%, 수 ${json.elements_ratio.Water}%
십성 구조: ${JSON.stringify(json.ten_gods_count)}
주요 신살: 길운(${json.shinsal.lucky.join(', ') || '없음'}), 흉살(${json.shinsal.caution.join(', ') || '없음'})
현재 대운: ${json.current_daewun.ganji} (${json.current_daewun.age_range}세) - ${json.current_daewun.type} 기운

이 데이터를 바탕으로, 내담자의 상처를 부드럽게 감싸 안고 앞으로의 방향을 명확하고 다정한 편지 형식으로 길고 충실하게 작성해 주세요.`;
};

async function testLLM() {
    const sajuAnalysisJson = {
      user_info: { gender: "female", day_master: "辛(금)" },
      elements_ratio: {
          Wood: 0,
          Fire: 37.5,
          Earth: 12.5,
          Metal: 25,
          Water: 25,
      },
      ten_gods_count: {
          "비견/겁재": 1, "식신/상관": 2, "정재/편재": 0, "정관/편관": 3, "정인/편인": 2
      },
      core_格: "상관격",
      shinsal: { lucky: ["천을귀인", "문창귀인"], caution: ["귀문관살"] },
      current_daewun: { age_range: "28", ganji: "甲申", type: "재성/비겁" }
  };

  const sysPrompt = generateSystemPrompt(sajuAnalysisJson);
  const promptText = `
${sysPrompt}

You MUST return a JSON object containing EXACTLY 1 key: "business".
Return ONLY the JSON. Do not wrap in markdown code blocks (\`\`\`json).`;

  try {
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: promptText,
          config: { responseMimeType: "application/json" }
      });
      const parsed = JSON.parse(response.text);
      console.log("\n[직업운 (Business) 예시 텍스트]\n", parsed.business);
  } catch(e) { console.error(e); }
}

testLLM();
