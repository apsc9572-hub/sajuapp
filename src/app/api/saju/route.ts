import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

// Initialize the SDK. It will automatically pick up GEMINI_API_KEY from environment variables.
const ai = new GoogleGenAI({});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { systemPrompt, sajuJson, expectedKeys } = body;

    if (!systemPrompt || !sajuJson) {
      return NextResponse.json({ error: 'Missing prompt or saju json data' }, { status: 400 });
    }

    const keysStr = expectedKeys && Array.isArray(expectedKeys) && expectedKeys.length > 0
        ? `"${expectedKeys.join('", "')}"`
        : `"general", "wealth", "love", "business", "health", "daeun", "sinsal"`;

    const promptText = `
${systemPrompt}

You MUST return a JSON object containing EXACTLY these keys: ${keysStr}.
Each value must be a string formatted in Markdown.

For context, here is the raw JSON analysis again:
${JSON.stringify(sajuJson)}

Return ONLY valid JSON. Do not wrap in markdown code blocks (\`\`\`json).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");

    const parsed = JSON.parse(text);
    return NextResponse.json(parsed);

  } catch (error: any) {
    console.error('LLM API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Error generating Saju reading' },
      { status: 500 }
    );
  }
}
