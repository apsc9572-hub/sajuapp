import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

function getApiKey() {
  try {
    const env = fs.readFileSync('.env.local', 'utf8');
    const match = env.match(/GEMINI_API_KEY=([^\s]+)/);
    return match ? match[1].trim() : null;
  } catch (err) {
    return null;
  }
}

async function testModel() {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("❌ API Key not found in .env.local");
    return;
  }

  // Matching the route.ts style
  // Since Gemini API key is usually picked up from env or passed in config
  process.env.GEMINI_API_KEY = apiKey;
  const ai = new GoogleGenAI({ apiKey }); // Pass apiKey directly

  try {
    // Attempting the style used in route.ts
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Hello, are you Gemini 3?"
    });
    console.log("✅ SUCCESS:", response.text);
  } catch (err) {
    console.error("❌ FAILED:", err.message);
  }
}

testModel();
