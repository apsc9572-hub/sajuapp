import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

function getApiKey() {
  try {
    const env = fs.readFileSync('.env.local', 'utf8');
    const match = env.match(/GEMINI_API_KEY=([^\s]+)/);
    return match ? match[1].trim() : null;
  } catch (err) { return null; }
}

async function testModel() {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: "Respond with JSON: { \"test\": \"ok\" }",
      config: { responseMimeType: "application/json" }
    });
    console.log("✅ 2.0-FLASH SUCCESS:", response.text);
  } catch (err) {
    console.error("❌ 2.0-FLASH FAILED:", err.message);
  }
}

testModel();
