import { NextResponse } from "next/server";
import { processAndDeliverPremiumSaju } from "@/lib/server/premium-delivery";

export async function GET() {
    console.log("[Diag API] Triggering diagnostic delivery...");
    
    try {
        const mockSajuData = {
            userEmail: "apsc9572@gmail.com",
            sajuJson: { user_info: { gender: "남성", day_master: "계유" }, elements_ratio: { water: 59.1 } },
            systemPrompt: "Diagnostic prompt",
            userAnswers: ["Test Question"],
            pillarDetails: { year: {}, month: {}, day: {}, hour: {} }
        };

        // Call the REAL delivery function
        await processAndDeliverPremiumSaju({
            userEmail: "apsc9572@gmail.com",
            orderId: "DIAG-" + Date.now(),
            sajuData: mockSajuData,
            deliveryMethod: "email",
            images: {} // No images for fast test
        });

        return NextResponse.json({ 
            success: true, 
            message: "Diagnostic delivery initiated. Check terminal logs for Gemini/Resend results.",
            info: "If you don't receive the email, the log will show exactly where it failed."
        });
    } catch (e: any) {
        console.error("[Diag API] Error:", e);
        return NextResponse.json({ 
            success: false, 
            error: e.message,
            stack: e.stack
        }, { status: 500 });
    }
}
