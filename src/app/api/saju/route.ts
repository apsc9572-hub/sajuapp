import { NextResponse } from 'next/server';
import { fetchWithRetry, callGPTFree } from '@/lib/api-utils';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { systemPrompt, sajuJson, expectedKeys } = body;

    if (!systemPrompt || !sajuJson) {
      return NextResponse.json({ error: '데이터가 부족합니다.' }, { status: 400 });
    }

    const keysStr = expectedKeys && Array.isArray(expectedKeys) && expectedKeys.length > 0
        ? `"${expectedKeys.join('", "')}"`
        : `"general", "early", "youth", "middle", "late", "daeun", "sinsal"`;

    const promptText = `
${systemPrompt}

You MUST return a JSON object containing EXACTLY these keys: ${keysStr}.
Ensure each analysis is detailed and natural. **Strictly use polite language (하십시오체/해요체).**

[최우선 지침: Zero Filler & Deep Reasoning]
1. "좋을 수도 있고 나쁠 수도 있습니다", "노력하면 됩니다" 같은 누구나 아는 뻔한 잡설(Filler)을 절대 쓰지 마세요.
2. 짧더라도 내용의 밀도를 극대화하세요. 단순한 '결과' 통보가 아니라, **'왜(Why)'** 그런 흐름이 나오는지 사주의 기운(오행의 균형, 합충 등)을 근거로 분석하세요.
3. 명리적 근거를 바탕으로 구체성을 띄되, 내담자가 이해하기 쉽게 풀어서 설명하세요.

For context, here is the raw JSON analysis again:
${JSON.stringify(sajuJson)}

Return ONLY valid JSON. Do not wrap in markdown code blocks (\`\`\`json).
    `;

    let jsonStr = "";
    
    // Primary: GPT-4o-Mini (via callGPTFree)
    try {
      console.log("[AI] Primary Analysis: GPT-4o-Mini (Free Tier)");
      jsonStr = await callGPTFree(promptText, "You are a professional Saju (Korean Astrology) expert. Return ONLY valid JSON.", "json_object");
    } catch (gptErr) {
      console.error("[GPT Error] Falling back to Gemini for saju analysis:", gptErr);
      
      // Fallback: Gemini 2.5 Flash
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GPT 실패 및 Gemini API 키 미설정으로 분석 불가");
      }

      const modelId = 'gemini-2.5-flash';
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

      const apiResponse = await fetchWithRetry(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            responseMimeType: "application/json",
          }
        })
      });

      if (!apiResponse.ok) {
        const errorJson = await apiResponse.json().catch(() => ({}));
        throw new Error(`Gemini Fallback 오류 (${apiResponse.status}): ${errorJson.error?.message || apiResponse.statusText}`);
      }

      const result = await apiResponse.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Gemini 폴백 응답을 받지 못했습니다.");
      jsonStr = text.trim();
    }
    
    if (jsonStr.startsWith("```json")) jsonStr = jsonStr.replace(/^```json/, "");
    if (jsonStr.endsWith("```")) jsonStr = jsonStr.replace(/```$/, "");
    
    const parsed = JSON.parse(jsonStr.trim());
    return NextResponse.json(parsed);

  } catch (err: any) {
    console.error('LLM API Error:', err);
    return NextResponse.json({ 
      error: 'API 요청 실패', 
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }, { status: 500 });
  }
}
