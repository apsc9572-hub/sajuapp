import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { processAndDeliverPremiumSaju } from "@/lib/server/premium-delivery";

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || "",
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || "",
});

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("upstash-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing Upstash signature" }, { status: 401 });
    }

    const bodyText = await req.text();
    const isValid = await receiver.verify({
      signature,
      body: bodyText,
    }).catch(err => {
      console.error("[QStash] Verification error:", err);
      return false;
    });

    if (!isValid) {
      return NextResponse.json({ error: "Invalid Upstash signature" }, { status: 401 });
    }

    const body = JSON.parse(bodyText);
    console.log("[QStash Worker] Verified task:", body);

    const { userEmail, sajuData, orderId, kakaoToken, deliveryMethod } = body;

    if (!userEmail || !sajuData || !orderId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Trigger the heavy processing
    await processAndDeliverPremiumSaju({
      userEmail,
      kakaoToken,
      sajuData,
      orderId,
      deliveryMethod
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[QStash Worker] Fatal Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes (for AI processing)
