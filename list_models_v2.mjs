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

async function listModels() {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  try {
    const list = await ai.models.list();
    console.log("Model List Result Keys:", Object.keys(list));
    
    // Newer SDKs use a list() method that returns an iterable or an object with models
    if (list.models) {
        console.log("Found Models Array:");
        list.models.forEach(m => console.log(m.name));
    } else {
        console.log("Result is:", JSON.stringify(list).substring(0, 1000));
    }
  } catch (err) {
    console.error("❌ FAILED:", err.message);
  }
}

listModels();
