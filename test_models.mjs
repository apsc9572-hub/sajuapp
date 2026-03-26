
import { fetch } from "undici"; // Next.js environment uses undici or native fetch
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: ".env.local" });

async function checkModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY not found in .env.local");
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.models) {
      console.log("Available Models:");
      data.models.forEach(m => console.log(`- ${m.name}`));
      
      const has25 = data.models.some(m => m.name.includes("2.5"));
      console.log(`\nIs gemini-2.5-flash present? ${has25 ? "YES" : "NO"}`);
    } else {
      console.error("Failed to list models:", data);
    }
  } catch (err) {
    console.error("Error fetching models:", err);
  }
}

checkModels();
