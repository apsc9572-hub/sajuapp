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
      model: 'gemini-1.5-flash',
      contents: "Hello",
    });
    console.log("✅ 1.5-FLASH SUCCESS:", response.text);
  } catch (err) {
    console.error("❌ 1.5-FLASH FAILED:", err.message);
  }
}

testModel();
