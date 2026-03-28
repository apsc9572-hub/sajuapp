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
    const { paymentKey, orderId, amount, skip, userEmail, kakaoToken, sajuData, deliveryMethod, images, phoneNumber } = body;
    
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
      const hasDeliveryTarget = deliveryMethod === "kakao" ? !!phoneNumber : !!userEmail;
      
      if (sajuData && hasDeliveryTarget) {
        const actualOrigin = new URL(request.url).origin;
        const isDevelopment = process.env.NODE_ENV === 'development';
        const isLocalHost = actualOrigin.includes("localhost") || actualOrigin.includes("127.0.0.1") || actualOrigin.includes("::1");
        // Also check for private IP ranges (192.168.x.x, 10.x.x.x, 172.16.x.x)
        const isPrivateIp = /^(http|https):\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(actualOrigin);
        
        const isLocal = isDevelopment || isLocalHost || isPrivateIp;
        const webhookBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || actualOrigin;

        console.log("[Confirm API] Origin:", actualOrigin, "Is it Local?", isLocal);

        const payload = {
          userEmail: userEmail || "",
          kakaoToken,
          sajuData,
          orderId,
          deliveryMethod,
          images,
          phoneNumber
        };

        // LOCAL BYPASS: QStash cannot hit localhost. 
        if (isLocal) {
          console.log("[Confirm API] Local mode: Bypassing QStash and running delivery directly (Background).");
          // Non-blocking call to avoid browser timeout
          processAndDeliverPremiumSaju(payload).catch(err => {
            console.error("[Confirm API] Background Delivery Error:", err.message);
          });
        } else {
          console.log("[Confirm API] Production mode: Triggering QStash for Order:", orderId);
          try {
            await qstash.publishJSON({
              url: `${webhookBaseUrl}/api/process-saju`,
              body: payload,
            });
            console.log(`[QStash] Published task for Order: ${orderId}`);
          } catch (qstashError: any) {
            console.error("[QStash] Publish Failed:", qstashError.message);
            throw new Error(`QStash Publish Failed: ${qstashError.message}`);
          }
        }
      } else {
        console.warn("[Confirm API] Missing sajuData or delivery target (Email/Phone), background processing skipped.");
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

export const dynamic = 'force-dynamic';
export const maxDuration = 300;
