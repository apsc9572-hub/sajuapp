const { Resend } = require('resend');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env.local') });

const resendSecret = process.env.RESEND_API_KEY;
const geminiSecret = process.env.GEMINI_API_KEY;

async function testResend() {
    console.log("--- Testing Resend ---");
    if (!resendSecret) {
        console.error("Error: RESEND_API_KEY is missing in .env.local");
        return;
    }

    const resend = new Resend(resendSecret);
    try {
        // Try sending a test email to the user's configured email
        const userEmail = process.env.EMAIL_USER || "your-test-email@example.com";
        console.log(`Attempting to send test email to: ${userEmail}`);
        
        // Use the custom domain from the code
        const fromAddress = "청아매당 <info@cheongamaedang.com>";
        console.log(`Using 'From' address: ${fromAddress}`);

        const result = await resend.emails.send({
            from: fromAddress,
            to: [userEmail],
            subject: "[Diagnostic] Resend Test Email",
            html: "<h1>Test Successful</h1><p>If you see this, Resend and the 'From' domain are working correctly.</p>"
        });

        console.log("Resend Result:", JSON.stringify(result, null, 2));
        if (result.error) {
            console.error("Resend Error Detected. If it's a domain error, you must verify the domain in Resend dashboard.");
        }
    } catch (e) {
        console.error("Resend Exception:", e.message);
    }
}

async function testGemini() {
    console.log("\n--- Testing Gemini ---");
    if (!geminiSecret) {
        console.error("Error: GEMINI_API_KEY is missing in .env.local");
        return;
    }
    // Just a simple fetch check if possible, or skip if complex
    console.log("Gemini API Key is present. Length:", geminiSecret.length);
}

async function run() {
    await testResend();
    await testGemini();
}

run();
