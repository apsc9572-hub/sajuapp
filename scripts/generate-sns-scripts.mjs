import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import logic directly (since we can't easily import from src/lib without setup)
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      if (i === maxRetries) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      if (i === maxRetries) throw err;
    }
    await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
  }
}

async function generateZodiacFortunes() {
  const apiKey = process.env.GEMINI_API_KEY;
  const date = new Date();
  
  // Minimal pillar logic for the script
  const promptText = `
너는 20년 경력의 전문 사주 명리학자야. 오늘(${date.toLocaleDateString()})의 기운을 바탕으로 12개 띠의 운세를 분석해줘.
12개 띠(쥐, 소, 호랑이, 토끼, 용, 뱀, 말, 양, 원숭이, 닭, 개, 돼지) 각각에 대해 상세한 운세와 점수(0-100), 행운의 색, 숫자를 알려줘.
아주 자연스러운 한국어 구어체로 작성해. AI 느낌이 나는 말투는 절대 금지야.

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
      generationConfig: { responseMimeType: "application/json" }
    })
  });

  const result = await response.json();
  return JSON.parse(result.candidates[0].content.parts[0].text);
}

async function formatPost(fortunes, platform) {
  const apiKey = process.env.GEMINI_API_KEY;
  const dateStr = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  let platformInstruction = "";
  if (platform === "blog") {
    platformInstruction = "네이버 블로그 스타일: 제목 포함, 풍부한 이모지, 상세하고 친절한 설명, 도입부와 맺음말 포함.";
  } else if (platform === "instagram") {
    platformInstruction = "인스타그램 스타일: 핵심 요약, 감성적이고 트렌디한 말투, 이미지 추천, 해시태그 포함.";
  } else if (platform === "threads") {
    platformInstruction = "스레드 스타일: 친구와 대화하듯 편안하고 위트 있는 말투, 반응을 유도하는 질문 포함.";
  }

  const promptText = `
12개 띠별 운세 데이터를 바탕으로 ${platform}에 올릴 완벽한 게시물을 작성해줘.
날짜: ${dateStr}
데이터: ${JSON.stringify(fortunes)}
지침: ${platformInstruction} AI 느낌 빼고 사람처럼 써줘.

응답은 게시물 본문 내용만 출력해.
`;

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const response = await fetchWithRetry(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
  });
  const result = await response.json();
  return result.candidates[0].content.parts[0].text.trim();
}

async function main() {
  console.log("🚀 띠별 운세 생성 시작...");
  try {
    const fortunes = await generateZodiacFortunes();
    console.log("✅ 운세 데이터 생성 완료.");

    const platforms = ["blog", "instagram", "threads"];
    const outputDir = path.join(process.cwd(), 'output_horoscope');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const today = new Date().toISOString().split('T')[0];

    for (const platform of platforms) {
      console.log(`📝 ${platform} 대본 생성 중...`);
      const content = await formatPost(fortunes, platform);
      const filePath = path.join(outputDir, `${today}_${platform}.txt`);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${platform} 저장 완료: ${filePath}`);
    }

    console.log("\n🎉 모든 대본 생성이 완료되었습니다! output_horoscope 폴더를 확인하세요.");
  } catch (err) {
    console.error("❌ 오류 발생:", err);
  }
}

main();
