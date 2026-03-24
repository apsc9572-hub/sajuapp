import { NextResponse } from "next/server";
import { processAndDeliverPremiumSaju } from "@/lib/server/premium-delivery";

export async function GET() {
  // Dummy data for testing
  const testData = {
    userEmail: "apsc9572@gmail.com", // Replace with your test email
    orderId: "TEST_ORDER_" + Date.now(),
    sajuData: {
      sajuJson: {
        pillars: {
          year: { stem: "乙", branch: "亥" },
          month: { stem: "庚", branch: "辰" },
          day: { stem: "丁", branch: "丑" },
          time: { stem: "庚", branch: "戌" }
        }
      },
      systemPrompt: "당신은 한국 최고의 명리학자 '청아매당'입니다.",
      userAnswers: "올해 건강과 재물운이 궁금합니다."
    }
  };

  try {
    // DO NOT await here, let it run in the background
    // to simulate real QStash/Background behavior.
    processAndDeliverPremiumSaju(testData).catch(err => {
      console.error("[Test Background Error]:", err);
    });

    return NextResponse.json({ 
      success: true, 
      message: "분석 프로세스가 백그라운드에서 시작되었습니다. 약 1~2분 후 이메일(apsc9572@gmail.com)을 확인해 주세요.",
      status: "Processing"
    });
  } catch (error: any) {
    console.error("[Test] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
