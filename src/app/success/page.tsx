"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import TraditionalBackground from "@/components/TraditionalBackground";
import { Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { prepareAnalysisData } from "@/lib/premium-saju-utils";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "completed" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  const confirmPayment = async () => {
    const savedData = localStorage.getItem("premium_saju_data");
    const kakaoToken = sessionStorage.getItem("kakao_access_token");

    if (!savedData) {
      // If no data in localStorage, maybe it's already a completed order and user is just revisiting
      // But for a fresh payment redirect, this is an error.
      setStatus("error");
      setErrorMessage("입력된 사주 정보가 없습니다. 세션이 만료되었을 수 있습니다.");
      return;
    }

    try {
      const data = JSON.parse(savedData);
      setUserEmail(data.userEmail || "");
      
      // 1. Prepare data for server (Bazi calculation) - FAST
      const analysisData = await prepareAnalysisData(data);

      const skip = searchParams.get("skip");

      // 2. Trigger Payment Confirmation & Background Delivery
      console.log("[CLIENT] Sending confirm-payment request...");
      alert("분석 요청을 서버로 보냅니다...");
      const res = await fetch("/api/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          paymentKey, 
          orderId, 
          amount,
          skip, // Added
          userEmail: data.userEmail, 
          deliveryMethod: data.deliveryMethod,
          kakaoToken,
          sajuData: analysisData
        }),
      });

      if (res.ok) {
        alert("분석 요청 접수 성공! 이제 약 1~2분 뒤 메일이 도착합니다.");
        // Already shown as completed, but we can do final cleanup here
        localStorage.removeItem("premium_saju_data");
        console.log("[Success] Payment confirmed and background tasks triggered.");
      } else {
        const errData = await res.json();
        setStatus("error");
        setErrorMessage(errData.error || "결제 확인 중 오류가 발생했습니다.");
      }
    } catch (error: any) {
      console.error(error);
      setStatus("error");
      setErrorMessage("서버 통신 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    // Read email immediately for UI
    const savedData = localStorage.getItem("premium_saju_data");
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.userEmail) setUserEmail(data.userEmail);
      } catch (e) {}
    }

    if (paymentKey && orderId && amount) {
      // For immediate satisfaction, show completed UI right away
      setStatus("completed");
      confirmPayment();
    } else {
      if (searchParams.get("show") !== "true") {
        setStatus("error");
        setErrorMessage("잘못된 접근입니다.");
      } else {
        setStatus("completed");
      }
    }
  }, [paymentKey, orderId, amount, searchParams]);

  const handleEmailReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) return;
    setIsEmailSubmitted(true);
    // Logic to report error to admin could go here
    alert("접수되었습니다. 확인 후 메일로 보내드리겠습니다.");
  };

  return (
    <main style={{ width: "100%", minHeight: "100vh", position: "relative", background: "var(--bg-primary)" }}>
      <TraditionalBackground />
      <div style={{ maxWidth: "520px", margin: "0 auto", minHeight: "100vh", background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(20px)", padding: "40px 20px" }}>
        
        {status === "verifying" && (
          <div style={{ textAlign: "center", paddingTop: "120px" }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
              <Sparkles size={48} color="var(--accent-gold)" />
            </motion.div>
            <h2 style={{ marginTop: "24px", color: "var(--accent-indigo)", fontFamily: "'Nanum Myeongjo', serif" }}>결제를 확인하고 있습니다...</h2>
            <p style={{ color: "#777", marginTop: "12px" }}>잠시만 기다려 주십시오.</p>
          </div>
        )}

        {status === "error" && (
          <div style={{ textAlign: "center", paddingTop: "60px" }}>
            <AlertCircle size={64} color="#ef4444" style={{ margin: "0 auto 24px" }} />
            <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#333", marginBottom: "16px" }}>안내 말씀 드립니다</h2>
            
            <div style={{ background: "#fff5f5", padding: "20px", borderRadius: "16px", border: "1px solid #fed7d7", marginBottom: "32px", textAlign: "left" }}>
              <p style={{ color: "#c53030", fontWeight: "700", marginBottom: "12px" }}>결제 과정 혹은 정보 확인 중 문제가 발생했습니다.</p>
              <p style={{ color: "#4a5568", fontSize: "0.95rem", lineHeight: "1.6" }}>
                {errorMessage}
                <br/><br/>
                이미 결제가 완료되었다면, 아래 이메일 주소를 확인해 주세요. 담당자가 확인 후 24시간 이내에 직접 결과를 발송해 드립니다.
              </p>
            </div>

            {!isEmailSubmitted ? (
              <form onSubmit={handleEmailReportSubmit} style={{ width: "100%" }}>
                <input 
                  type="email" 
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="결과를 받으실 이메일 주소"
                  required
                  style={{ width: "100%", padding: "16px", borderRadius: "14px", border: "2px solid #e2e8f0", marginBottom: "16px", fontSize: "1rem" }}
                />
                <button type="submit" style={{ width: "100%", padding: "16px", borderRadius: "14px", background: "var(--accent-indigo)", color: "white", border: "none", fontWeight: "700" }}>
                  정보 재전송 및 문의 접수
                </button>
              </form>
            ) : (
              <div style={{ padding: "30px", background: "#f0fff4", borderRadius: "16px", border: "1px solid #c6f6d5" }}>
                <p style={{ color: "#2f855a", fontWeight: "800" }}>접수가 완료되었습니다.</p>
                <button onClick={() => router.push("/")} style={{ width: "100%", marginTop: "20px", padding: "14px", borderRadius: "12px", background: "var(--accent-indigo)", color: "white", border: "none" }}>홈으로 가기</button>
              </div>
            )}
          </div>
        )}

        {status === "completed" && (
          <div style={{ padding: "60px 0" }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ 
                background: "white", padding: "40px 24px", borderRadius: "32px", 
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)", textAlign: "center",
                border: "1px solid rgba(212, 163, 115, 0.3)"
              }}
            >
              <div style={{ width: "80px", height: "80px", background: "#f0fdf4", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                <CheckCircle2 size={48} color="#22c55e" />
              </div>

               <h2 style={{ fontSize: "1.6rem", fontWeight: "900", color: "var(--accent-indigo)", marginBottom: "16px", fontFamily: "'Nanum Myeongjo', serif" }}>
                정성이 담긴 분석이 시작되었습니다
              </h2>
              
              <div style={{ background: "rgba(212, 163, 115, 0.1)", color: "#8a6d3b", padding: "12px", borderRadius: "12px", fontSize: "0.9rem", fontWeight: "700", marginBottom: "24px" }}>
                대가의 지혜를 담은 정밀 명리 처방전 작성 중
              </div>

              <p style={{ color: "#555", lineHeight: "1.8", marginBottom: "32px", wordBreak: "keep-all" }}>
                귀하의 타고난 운명과 흐름기운을 면밀히 분석하여 가장 명확한 답을 도출하고 있습니다.<br/><br/>
                정밀한 분석 과정을 거쳐 <b>약 1~5분 이내</b>에 귀하의 <b>카카오톡과 이메일</b>로 소중히 전달해 드립니다.<br/><br/>
                <b>지금 브라우저를 닫거나 앱을 종료하셔도 결과지는 안전하게 발송되오니 안심하고 기다려 주십시오.</b>
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "16px", border: "1px solid #f1f5f9", fontSize: "0.9rem", color: "#64748b", textAlign: "left" }}>
                  <div style={{ fontWeight: "700", marginBottom: "4px", color: "var(--accent-indigo)" }}>보내드리는 곳:</div>
                  • 카카오톡: 나에게 보내기 (기본)<br/>
                  • 이메일: {userEmail || "결제 시 입력하신 주소"}
                </div>
                
                <button 
                  onClick={() => router.push("/")}
                  style={{ width: "100%", padding: "16px", borderRadius: "16px", background: "var(--accent-indigo)", color: "white", border: "none", fontWeight: "700", fontSize: "1rem", marginTop: "12px" }}
                >
                  홈으로 이동하기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
