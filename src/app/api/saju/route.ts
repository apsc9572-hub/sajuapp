import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { systemPrompt, sajuJson, expectedKeys } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API 키가 설정되지 않았습니다.' }, { status: 500 });
    }

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
Do NOT use markdown bolding (**) or hashtags (#) in any text.

For context, here is the raw JSON analysis again:
${JSON.stringify(sajuJson)}

Return ONLY valid JSON. Do not wrap in markdown code blocks (\`\`\`json).
    `;

    // Using requested gemini-2.5-flash
    const modelId = 'gemini-2.5-flash';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

    const apiResponse = await fetch(apiUrl, {
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
      throw new Error(`Gemini API 오류 (${apiResponse.status}): ${errorJson.error?.message || apiResponse.statusText}`);
    }

    const result = await apiResponse.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) throw new Error("AI 응답을 받지 못했습니다.");

    let jsonStr = text.trim();
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
