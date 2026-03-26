const https = require('https');
const fs = require('fs');
const path = require('path');

// Extract API Key from .env.local without dotenv
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const resendKeyMatch = envContent.match(/RESEND_API_KEY=(.*)/);
const resendKey = resendKeyMatch ? resendKeyMatch[1].trim() : null;

if (!resendKey) {
    console.error("Critical: RESEND_API_KEY not found in .env.local");
    process.exit(1);
}

const data = JSON.stringify({
    from: "청아매당 <info@cheongamaedang.com>",
    to: ["apsc9572@gmail.com"], // Hardcoded for diagnostic
    subject: "[Diagnostic] Raw HTTPS Resend Test",
    html: "<h1>Diagnostic Success</h1><p>This was sent using raw HTTPS. If you receive this, the API key and Domain are OK.</p>"
});

const options = {
    hostname: 'api.resend.com',
    port: 443,
    path: '/emails',
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
};

console.log("--- Starting Direct Resend Diagnostic ---");
console.log("From: info@cheongamaedang.com");
console.log("API Key Prefix:", resendKey.substring(0, 10));

const req = https.request(options, (res) => {
    let responseBody = '';
    res.on('data', (d) => { responseBody += d; });
    res.on('end', () => {
        console.log("Status Code:", res.statusCode);
        console.log("Response Body:", responseBody);
        
        if (res.statusCode === 200 || res.statusCode === 201) {
            console.log("\nSUCCESS: Resend is working correctly with this API key and domain.");
        } else {
            console.error("\nFAILURE: Resend returned an error. Check domain verification or API key permissions.");
        }
    });
});

req.on('error', (error) => {
    console.error("HTTPS Request Error:", error);
});

req.write(data);
req.end();
