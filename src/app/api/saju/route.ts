import { NextResponse } from 'next/server';
import { fetchWithRetry, callGPTLatest } from '@/lib/api-utils';

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
Ensure each analysis is detailed and natural. While you should explain the astrological reasoning (the "why"), do so in a way that is easy for laypeople to understand.

For context, here is the raw JSON analysis again:
${JSON.stringify(sajuJson)}

Return ONLY valid JSON. Do not wrap in markdown code blocks (\`\`\`json).
    `;

    let jsonStr = "";
    
    // Primary: GPT-4.1-Mini (via callGPTLatest)
    try {
      console.log("[AI] Primary Analysis: GPT-4.1-Mini");
      jsonStr = await callGPTLatest(promptText, "You are a professional Saju (Korean Astrology) expert. Return ONLY valid JSON.", "json_object");
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
