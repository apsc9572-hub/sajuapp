
import { NextResponse } from "next/server";
import { processAndDeliverPremiumSaju } from "@/lib/server/premium-delivery";

export async function GET() {
  try {
    const testData = {
      userEmail: "onboarding@resend.dev", // Resend default for testing
      orderId: "DEBUG-" + Date.now(),
      deliveryMethod: "email",
      sajuData: {
        sajuJson: { year: "경오", month: "경진", day: "신유", hour: "무술" },
        systemPrompt: "당신은 최고의 명리학 전문가입니다.",
        userAnswers: ["미래의 재물운이 궁금합니다."],
        sajuRes: { pillarDetails: {} },
        userInput: { birthDate: "1990-04-26", birthTime: "19:40", gender: "남성" },
        correctedPercentages: { wood: 20, fire: 20, earth: 20, metal: 20, water: 20 },
        basePercentages: { wood: 20, fire: 20, earth: 20, metal: 20, water: 20 },
        sinsals: {},
        correctedStrength: { score: 60, label: "신강" },
        stages12: {}
      }
    };

    console.log("[Debug] Starting test delivery...");
    
    // We wrap this to catch error details
    let errorDetails = null;
    try {
      await (processAndDeliverPremiumSaju as any)(testData);
    } catch (e: any) {
      errorDetails = {
        message: e.message,
        stack: e.stack
      };
    }

    return NextResponse.json({
      success: !errorDetails,
      error: errorDetails,
      message: errorDetails ? "Delivery failed during debug" : "Delivery attempt completed (check logs for success)"
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
