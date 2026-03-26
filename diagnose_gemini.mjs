
import fs from 'fs';

async function testGemini() {
  try {
    const env = fs.readFileSync('.env.local', 'utf8');
    const geminiKeyMatch = env.match(/GEMINI_API_KEY=(.*)/);
    if (!geminiKeyMatch) {
      console.error("GEMINI_API_KEY not found");
      return;
    }
    const apiKey = geminiKeyMatch[1].trim();
    const modelId = 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

    console.log(`Testing model: ${modelId}`);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "안녕" }] }]
      })
    });

    const data = await res.json();
    console.log("Response Status:", res.status);
    console.log("Response Body:", JSON.stringify(data, null, 2));

    if (res.status === 404) {
      console.log("\n!!! MODEL NOT FOUND !!!");
      console.log("The model 'gemini-2.5-flash' does not appear to exist in the standard API.");
    }
  } catch (err) {
    console.error("Error testing Gemini:", err);
  }
}

testGemini();
