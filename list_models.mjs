import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function listModels() {
  try {
    const ai = new GoogleGenAI({});
    // The @google/genai SDK usually has a way to list models, but it depends on the exact version.
    // If it's the new Alpha SDK, it might be ai.models.list()
    const models = await ai.models.list();
    console.log("Available Models:");
    models.forEach(m => console.log(m.name));
  } catch (err) {
    console.error("Error listing models:", err);
  }
}

listModels();
