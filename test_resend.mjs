
import fs from 'fs';

async function verifyResend() {
  try {
    const env = fs.readFileSync('.env.local', 'utf8');
    const resendKeyMatch = env.match(/RESEND_API_KEY=(.*)/);
    if (!resendKeyMatch) {
      console.error("RESEND_API_KEY not found in .env.local");
      return;
    }
    const apiKey = resendKeyMatch[1].trim();

    const res = await fetch("https://api.resend.com/domains", {
      headers: { "Authorization": `Bearer ${apiKey}` }
    });
    const domains = await res.json();
    console.log("Verified Domains:", JSON.stringify(domains, null, 2));
  } catch (err) {
    console.error("Error verifying Resend:", err);
  }
}

verifyResend();
