import { ZodiacFortune } from "./zodiac-service";
import { fetchWithRetry } from "./api-utils";

export interface SNSPost {
  platform: string;
  content: string;
}

export async function formatZodiacPost(fortunes: ZodiacFortune[], platform: "blog" | "instagram" | "threads", date: Date = new Date()): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const dateStr = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;

  let platformInstruction = "";
  if (platform === "blog") {
    platformInstruction = `
[네이버 블로그 스타일]
- 제목: 꼭 클릭하고 싶게 만드는 매력적인 제목 (예: "오늘 운세 대박 난 띠는? 2026년 X월 X일 띠별 운세 총정리")
- 도입부: 이웃들에게 인사를 건네는 따뜻하고 자연스러운 시작 (예: 오늘 아침 하늘이 참 예쁘네요, 다들 출근 잘 하셨나요?)
- 본문: 각 띠별 운세를 보기 좋게 정리하고, 적절한 이모지를 풍부하게 사용해.
- 맺음말: 오늘 하루를 응원하는 멘트와 마무리 인사.
- 전체적으로 정보가 풍부하고 친근한 느낌이 나야 함.
`;
  } else if (platform === "instagram") {
    platformInstruction = `
[인스타그램 스타일]
- 첫 문장: 시선을 확 끄는 강렬한 한 마디. (예: "오늘의 행운아는 바로 나? 🍀")
- 본문: 각 띠별 운세를 아주 핵심만 요약해서 짤막하게 작성. 줄바꿈을 적절히 활용해.
- 이미지 가이드: 게시물에 어울리는 이미지 테마나 색감을 추천해줘.
- 해시태그: 인기 있는 관련 해시태그를 10개 내외로 포함해.
- 감성적이고 트렌디한 말투.
`;
  } else if (platform === "threads") {
    platformInstruction = `
[스레드 스타일]
- 말투: 친구에게 톡하는 것처럼 아주 편안하고 위트 있는 말투.
- 본문: 핵심 운세를 짧고 굵게 언급하며, 읽는 사람의 반응을 유도하는 멘트를 섞어줘. (예: "오늘 뱀띠님들 로또 사야 할 듯? (진심) 다들 오늘 계획 어때요?")
- 질문: 마지막에 질문을 던져서 댓글 소통을 유도해.
- 담백하면서도 뼈 있는 농담이 섞인 스타일.
`;
  }

  const promptText = `
너는 SNS 전문 마케터이자 운세 에디터야. 아래의 12개 띠별 운세 데이터를 바탕으로 ${platform}에 올릴 완벽한 게시물을 작성해줘.

[오늘의 날짜]
${dateStr}

[운세 데이터]
${JSON.stringify(fortunes)}

[지침]
${platformInstruction}
- 인공지능 느낌이 나는 상투적인 말은 절대 하지 마. (예: "안녕하세요", "도움이 되셨나요?", "좋은 하루 되세요" 등)
- 진짜 사람이 자기 일상을 이야기하다가 운세를 알려주는 것처럼 자연스러워야 해.
- 맞춤법은 철저히 지키되, 인터넷에서 유행하는 부드러운 말투를 사용해.

[응답 형식]
게시물 본문 내용만 출력해줘. (다른 설명은 필요 없음)
`;

  const modelId = 'gemini-2.0-flash';
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

  const response = await fetchWithRetry(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }]
    })
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(`Gemini API Error: ${errorJson.error?.message || response.statusText}`);
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini response is empty");

  return text.trim();
}
