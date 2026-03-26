
import fs from 'fs';

async function testSend() {
  try {
    const env = fs.readFileSync('.env.local', 'utf8');
    const resendKeyMatch = env.match(/RESEND_API_KEY=(.*)/);
    if (!resendKeyMatch) {
      console.error("RESEND_API_KEY not found in .env.local");
      return;
    }
    const apiKey = resendKeyMatch[1].trim();

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "청아매당 <info@cheongamaedang.com>",
        to: ["apsc9572@gmail.com"],
        subject: "시스템 전송 테스트",
        html: "전송 테스트입니다."
      })
    });
    const result = await res.json();
    console.log("Send Result:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Error sending test:", err);
  }
}

testSend();
