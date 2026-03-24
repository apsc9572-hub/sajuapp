import { NextResponse } from "next/server";
import { Client } from "@upstash/qstash";
import { processAndDeliverPremiumSaju } from "@/lib/server/premium-delivery";

const qstash = new Client({ token: process.env.QSTASH_TOKEN! });

export async function POST(request: Request) {
  console.log("[Confirm API] Request received at:", new Date().toISOString());
  try {
    const body = await request.json().catch(e => {
        console.error("[Confirm API] JSON Parse Error:", e);
        return null;
    });
    
    if (!body) {
        return NextResponse.json({ error: "Empty or invalid body" }, { status: 400 });
    }

    console.log("[Confirm API] Full Body Keys:", Object.keys(body));
    const { paymentKey, orderId, amount, skip, userEmail, kakaoToken, sajuData, deliveryMethod } = body;
    
    console.log("[Confirm API] Parameters check:", { 
      hasEmail: !!userEmail, 
      hasSaju: !!sajuData, 
      isSkip: skip === "true",
      method: deliveryMethod 
    });

    let result: any = { status: "DONE" };
    let responseOk = true;

    // Only hit Toss API if not skipping
    if (skip !== "true") {
      console.log("[Confirm API] Proceeding with Toss Payment Confirmation...");
      const secretKey = process.env.TOSS_SECRET_KEY;
      if (!secretKey) {
        throw new Error("TOSS_SECRET_KEY is missing");
      }

      const basicAuth = Buffer.from(`${secretKey}:`).toString("base64");
      const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentKey, orderId, amount }),
      });

      result = await response.json();
      responseOk = response.ok;
      console.log("[Confirm API] Toss Response OK:", responseOk, result);
    } else {
      console.log("[Confirm API] Skipping Toss Payment (Test Mode)");
    }

    if (responseOk) {
      // Trigger background analysis
      if (sajuData && userEmail) {
        const actualOrigin = new URL(request.url).origin;
        const isLocal = actualOrigin.includes("localhost") || actualOrigin.includes("127.0.0.1") || actualOrigin.includes("::1");
        const webhookBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || actualOrigin;

        console.log("[Confirm API] Origin:", actualOrigin, "Is it Local?", isLocal);

        // LOCAL BYPASS: QStash cannot hit localhost. 
        if (isLocal) {
          console.log("[Confirm API] Local mode: Bypassing QStash and running delivery directly.");
          // No await required if we want it to be "pseudo-background", 
          // but since it's local, awaiting is safer for logs.
          await processAndDeliverPremiumSaju({
            userEmail,
            kakaoToken,
            sajuData,
            orderId,
            deliveryMethod
          });
        } else {
          console.log("[Confirm API] Production mode: Triggering QStash for Order:", orderId);
          try {
            await qstash.publishJSON({
              url: `${webhookBaseUrl}/api/process-saju`,
              body: {
                userEmail,
                kakaoToken,
                sajuData,
                orderId,
                deliveryMethod
              },
            });
            console.log(`[QStash] Published task for Order: ${orderId}`);
          } catch (qstashError: any) {
            console.error("[QStash] Publish Failed:", qstashError.message);
            throw new Error(`QStash Publish Failed: ${qstashError.message}`);
          }
        }
      } else {
        console.warn("[Confirm API] Missing sajuData or userEmail, background processing skipped.");
      }

      return NextResponse.json(result);
    }
 else {
      return NextResponse.json(
        { error: result.message || "Payment confirmation failed", details: result },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("[Confirm API] Error:", error.message, error.stack);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
