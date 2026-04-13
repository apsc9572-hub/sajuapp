import { getPillarsForDate } from "./unified-saju";
import { fetchWithRetry } from "./api-utils";

export const ZODIAC_SIGNS = [
  { name: "쥐띠", branch: "자", animal: "Rat" },
  { name: "소띠", branch: "축", animal: "Ox" },
  { name: "호랑이띠", branch: "인", animal: "Tiger" },
  { name: "토끼띠", branch: "묘", animal: "Rabbit" },
  { name: "용띠", branch: "진", animal: "Dragon" },
  { name: "뱀띠", branch: "사", animal: "Snake" },
  { name: "말띠", branch: "오", animal: "Horse" },
  { name: "양띠", branch: "미", animal: "Goat" },
  { name: "원숭이띠", branch: "신", animal: "Monkey" },
  { name: "닭띠", branch: "유", animal: "Rooster" },
  { name: "개띠", branch: "술", animal: "Dog" },
  { name: "돼지띠", branch: "해", animal: "Pig" },
];

export interface ZodiacFortune {
  sign: string;
  fortune: string;
  score: number;
  luckyColor: string;
  luckyNumber: number;
}

export async function generateZodiacFortunes(date: Date = new Date()): Promise<ZodiacFortune[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const todayPillars = getPillarsForDate(date);
  const dayPillar = todayPillars.day.stemKo + todayPillars.day.branchKo;
  const monthPillar = todayPillars.month.stemKo + todayPillars.month.branchKo;
  const yearPillar = todayPillars.year.stemKo + todayPillars.year.branchKo;

  const promptText = `
너는 20년 경력의 전문 사주 명리학자야. 오늘(${date.toLocaleDateString()})의 기운을 바탕으로 12개 띠의 운세를 분석해줘.

[오늘의 기운]
- 년주: ${yearPillar}
- 월주: ${monthPillar}
- 일주: ${dayPillar}

[지침]
1. 각 띠별로 오늘의 운세 수치(0-100), 행운의 색상, 행운의 숫자를 포함해줘.
2. 문장은 아주 자연스러운 한국어 구어체로 작성해. AI 느낌이 나는 "안녕하세요", "도움이 되셨나요?", "~에 대해 알아보겠습니다" 같은 표현은 절대 금지야.
3. 마치 옆에서 친근하게 조언해주는 전문가처럼 말해. (예: "오늘은 좀 쉬어가는 게 좋겠어요", "과감하게 밀어붙여도 좋은 날이에요!")
4. 사주 명리학적 근거(합, 충, 형 등)를 마음속으로 계산해서 그 결과만 친절하게 풀어내줘.

[응답 형식]
반드시 아래와 같은 JSON 배열 형식으로만 응답해:
[
  {
    "sign": "쥐띠",
    "fortune": "내용",
    "score": 85,
    "luckyColor": "파란색",
    "luckyNumber": 3
  },
  ... (총 12개)
]
`;

  const modelId = 'gemini-2.0-flash';
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

  const response = await fetchWithRetry(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    })
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(`Gemini API Error: ${errorJson.error?.message || response.statusText}`);
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini response is empty");

  return JSON.parse(text);
}
