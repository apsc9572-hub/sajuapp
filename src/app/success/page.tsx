"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import TraditionalBackground from "@/components/TraditionalBackground";
import { Sparkles, AlertCircle, CheckCircle2, Copy } from "lucide-react";
import { prepareAnalysisData } from "@/lib/premium-saju-utils";
import html2canvas from "html2canvas";
import { 
  SajuPillarTable, 
  StargateElementChart, 
  SipsungDonutChart, 
  StrengthIndexGraph, 
  YongsinDisplay,
  ElementBarChart,
  DaeunTable
} from "@/app/premium-saju/page";
import { useRef } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "completed" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isCopying, setIsCopying] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [sajuDataForCapture, setSajuDataForCapture] = useState<any>(null);
  
  const capturePillarRef = useRef<HTMLDivElement>(null);
  const captureStarBaseRef = useRef<HTMLDivElement>(null);
  const captureStarCorrRef = useRef<HTMLDivElement>(null);
  const captureDonutBaseRef = useRef<HTMLDivElement>(null);
  const captureDonutCorrRef = useRef<HTMLDivElement>(null);
  const captureStrengthBaseRef = useRef<HTMLDivElement>(null);
  const captureStrengthCorrRef = useRef<HTMLDivElement>(null);
  const captureDaeunRef = useRef<HTMLDivElement>(null);

  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  const confirmPayment = async () => {
    const specificKey = orderId ? `premium_saju_data_${orderId}` : null;
    const genericKey = "premium_saju_data";
    
    // Prioritize specific key, then fallback to generic
    const savedData = (specificKey ? localStorage.getItem(specificKey) : null) || localStorage.getItem(genericKey);
    
    if (!savedData) {
      console.error("[Success] No saved data found for order:", orderId);
      window.location.href = "/fail?message=데이터를 찾을 수 없습니다.";
      return;
    }

    try {
      const data = JSON.parse(savedData);
      console.log("[Success] Data retrieved for order:", orderId, "Category:", data.selectedCategory);
      setUserEmail(data.userEmail || "");
      const kakaoToken = sessionStorage.getItem("kakao_access_token");
      const analysisData = await prepareAnalysisData(data);
      setSajuDataForCapture(analysisData);

      // Wait for DOM to render hidden components
      await new Promise(r => setTimeout(r, 1000));

      const capturedImages: Record<string, string> = {};
      const capture = async (ref: React.RefObject<HTMLDivElement | null>, key: string) => {
        if (ref.current) {
          try {
            const canvas = await html2canvas(ref.current, { 
              backgroundColor: "#ffffff",
              scale: 1.5, // 1.5 scale as requested for better mobile readability
              useCORS: true,
              logging: false
            });
            capturedImages[key] = canvas.toDataURL("image/png", 0.7); // 0.7 quality (if browser supports for png)
          } catch (e) {
            console.error(`Capture failed for ${key}`, e);
          }
        }
      };

      console.log("[Success] Capturing UI components as PNGs...");
      await Promise.all([
        capture(capturePillarRef, "pillar"),
        capture(captureStarBaseRef, "star_base"),
        capture(captureStarCorrRef, "star_corrected"),
        capture(captureDonutBaseRef, "donut_base"),
        capture(captureDonutCorrRef, "donut_corrected"),
        capture(captureStrengthBaseRef, "strength_base"),
        capture(captureStrengthCorrRef, "strength_corrected"),
        capture(captureDaeunRef, "daeun")
      ]);

      const payload = { 
        paymentKey, 
        orderId, 
        amount,
        skip: searchParams.get("skip"),
        userEmail: data.userEmail, 
        deliveryMethod: data.deliveryMethod,
        kakaoToken,
        phoneNumber: data.phoneNumber,
        sajuData: analysisData,
        images: capturedImages 
      };

      const payloadSize = JSON.stringify(payload).length;
      console.log(`[Success] Payload size: ${(payloadSize / 1024 / 1024).toFixed(2)} MB`);

      const res = await fetch("/api/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const specificKey = orderId ? `premium_saju_data_${orderId}` : null;
        if (specificKey) localStorage.removeItem(specificKey);
        localStorage.removeItem("premium_saju_data");
        console.log("[Success] Payment confirmed and background tasks triggered.");
        setStatus("completed");
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

  const fetchAnalysisForCopy = async () => {
    const specificKey = orderId ? `premium_saju_data_${orderId}` : null;
    const savedData = (specificKey ? localStorage.getItem(specificKey) : null) || localStorage.getItem("premium_saju_data");
    // Even if no localStorage, we can still show a generic success message if show=true
    if (!savedData) {
      setStatus("completed");
      return;
    }
    
    try {
      setStatus("verifying");
      const data = JSON.parse(savedData);
      const res = await fetch("/api/premium-saju", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        setAnalysisResult(result.analysis);
        setStatus("completed");
      } else {
        setStatus("completed"); // Fallback to normal success state
      }
    } catch (e) {
      console.error(e);
      setStatus("completed");
    }
  };

  const handleCopy = async () => {
    if (!analysisResult) return;
    setIsCopying(true);
    const fullText = `
[청아매당 프리미엄 사주 분석 결과]

1. 인생의 전체적인 형상 분석
${analysisResult.life_shape?.replace(/<[^>]*>?/gm, '')}

2. 고민에 대한 대가의 해답
${analysisResult.solution?.replace(/<[^>]*>?/gm, '')}

3. 성패의 시기 (2026-2028)
${analysisResult.timing?.replace(/<[^>]*>?/gm, '')}

4. 개운의 비책
${analysisResult.luck_advice?.replace(/<[^>]*>?/gm, '')}

© 2026 청아매당. 본 결과지의 무단 전재 및 배포를 금합니다.
    `.trim();

    try {
      await navigator.clipboard.writeText(fullText);
      alert("전체 분석 결과가 클립보드에 복사되었습니다.");
    } catch (err) {
      console.error("Copy failed", err);
      alert("복사에 실패했습니다. 직접 선택하여 복사해 주세요.");
    } finally {
      setIsCopying(false);
    }
  };

  useEffect(() => {
    const specificKey = orderId ? `premium_saju_data_${orderId}` : null;
    const savedData = (specificKey ? localStorage.getItem(specificKey) : null) || localStorage.getItem("premium_saju_data");
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.userEmail) setUserEmail(data.userEmail);
      } catch (e) {}
    }

    if (paymentKey && orderId && amount) {
      setStatus("completed");
      confirmPayment();
    } else if (searchParams.get("result") === "true") {
      fetchAnalysisForCopy();
    } else if (searchParams.get("show") === "true" || searchParams.get("skip") === "true") {
      setStatus("completed");
    } else {
      setStatus("error");
      setErrorMessage("잘못된 접근입니다.");
    }
  }, [paymentKey, orderId, amount, searchParams]);

  const handleEmailReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) return;
    setIsEmailSubmitted(true);
    alert("접수되었습니다. 확인 후 메일로 보내드리겠습니다.");
  };

  return (
    <main style={{ width: "100%", minHeight: "100vh", position: "relative", background: "var(--bg-primary)" }}>
      <TraditionalBackground />
      <div style={{ maxWidth: "520px", margin: "0 auto", minHeight: "100vh", background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(20px)", padding: "20px 15px" }}>
        
        {status === "verifying" && (
          <div style={{ textAlign: "center", paddingTop: "120px" }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
              <Sparkles size={40} color="var(--accent-gold)" />
            </motion.div>
            <h2 style={{ marginTop: "20px", fontSize: "1.2rem", color: "var(--accent-indigo)", fontFamily: "'Nanum Myeongjo', serif" }}>분석 내용을 불러오고 있습니다...</h2>
            <p style={{ color: "#777", marginTop: "10px", fontSize: "0.9rem" }}>잠시만 기다려 주십시오.</p>
          </div>
        )}

        {status === "error" && (
          <div style={{ textAlign: "center", paddingTop: "60px" }}>
            <AlertCircle size={48} color="#ef4444" style={{ margin: "0 auto 20px" }} />
            <h2 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#333", marginBottom: "16px" }}>안내 말씀 드립니다</h2>
            
            <div style={{ background: "#fff5f5", padding: "15px", borderRadius: "12px", border: "1px solid #fed7d7", marginBottom: "24px", textAlign: "left" }}>
              <p style={{ color: "#c53030", fontWeight: "700", marginBottom: "8px", fontSize: "0.95rem" }}>결제 과정 혹은 정보 확인 중 문제가 발생했습니다.</p>
              <p style={{ color: "#4a5568", fontSize: "0.85rem", lineHeight: "1.6" }}>
                {errorMessage}
              </p>
            </div>
          </div>
        )}

        {status === "completed" && (
          <div style={{ padding: "30px 0" }}>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ 
                background: "white", padding: "30px 20px", borderRadius: "24px", 
                boxShadow: "0 15px 35px rgba(0,0,0,0.08)", textAlign: "center",
                border: "1px solid rgba(212, 163, 115, 0.2)"
              }}
            >
              <div style={{ width: "60px", height: "60px", background: "#f0fdf4", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <CheckCircle2 size={36} color="#22c55e" />
              </div>

              {analysisResult ? (
                <>
                  <h2 style={{ fontSize: "1.4rem", fontWeight: "900", color: "var(--accent-indigo)", marginBottom: "12px", fontFamily: "'Nanum Myeongjo', serif" }}>사주 분석 결과가 준비되었습니다</h2>
                  <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "24px", wordBreak: "keep-all" }}>아래 버튼을 눌러 전체 분석 내용을 복사할 수 있습니다.</p>
                  
                  <button 
                    onClick={handleCopy}
                    disabled={isCopying}
                    style={{ 
                      width: "100%", padding: "18px", borderRadius: "16px", background: "var(--accent-indigo)", 
                      color: "white", border: "none", fontWeight: "700", fontSize: "1.1rem",
                      boxShadow: "0 10px 20px rgba(42, 54, 95, 0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "10px"
                    }}
                  >
                    <Copy size={20} />
                    {isCopying ? "복사 중..." : "결과 전체 복사하기"}
                  </button>

                  <div style={{ marginTop: "24px", textAlign: "left" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                      <div style={{ width: "4px", height: "16px", background: "var(--accent-indigo)", borderRadius: "2px" }} />
                      <h4 style={{ fontSize: "1rem", fontWeight: "800", color: "var(--accent-indigo)", margin: 0 }}>귀하의 대운 흐름</h4>
                    </div>
                    {sajuDataForCapture && (
                      <DaeunTable 
                        userName="" 
                        startAge={sajuDataForCapture.daeunNum || 1} 
                        cycles={sajuDataForCapture.daeunCycles || []} 
                        currentIndex={sajuDataForCapture.currentDaeunIdx}
                        direction={sajuDataForCapture.daeunDirection}
                      />
                    )}
                  </div>

                  {/* Bottom Convenience Buttons */}
                  <div style={{ marginTop: "32px", borderTop: "1px solid #eee", paddingTop: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <button 
                      onClick={handleCopy}
                      disabled={isCopying}
                      style={{
                        width: "100%",
                        padding: "16px",
                        background: "var(--accent-indigo)",
                        color: "white",
                        border: "none",
                        borderRadius: "14px",
                        fontSize: "1rem",
                        fontWeight: "800",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        boxShadow: "0 4px 15px rgba(42,54,95,0.2)"
                      }}
                    >
                      <Copy size={20} />
                      {isCopying ? "복사 중..." : "전체 결과 복사하기"}
                    </button>
                    
                    <button 
                      onClick={() => router.push('/premium-saju')}
                      style={{
                        width: "100%",
                        padding: "16px",
                        background: "white",
                        color: "var(--accent-indigo)",
                        border: "1.5px solid var(--accent-indigo)",
                        borderRadius: "14px",
                        fontSize: "0.95rem",
                        fontWeight: "800",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px"
                      }}
                    >
                      <Sparkles size={18} />
                      프리미엄 사주 다시 이용하기
                    </button>
                    <p style={{ textAlign: "center", fontSize: "0.85rem", color: "#666", marginTop: "4px" }}>
                      운명의 문은 언제나 열려 있습니다. 다른 고민이 있다면 다시 찾아주세요.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <h2 style={{ fontSize: "1.4rem", fontWeight: "900", color: "var(--accent-indigo)", marginBottom: "12px", fontFamily: "'Nanum Myeongjo', serif" }}>분석이 시작되었습니다</h2>
                  <p style={{ color: "#555", fontSize: "0.9rem", lineHeight: "1.7", marginBottom: "25px", wordBreak: "keep-all" }}>
                    귀하의 사주 기운을 세밀히 분석하여 명확한 답을 도출 중입니다.<br/><br/>
                    약 <b>1~5분 이내</b>에 귀하의 <b>카카오톡과 이메일</b>로 소중히 전달해 드립니다.<br/><br/>
                    메일 하단의 버튼을 통해 전체 내용을 복사하실 수 있습니다.
                  </p>
                </>
              )}

              <button 
                onClick={() => router.push("/")}
                style={{ width: "100%", padding: "14px", borderRadius: "14px", background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0", fontWeight: "600", fontSize: "0.9rem", marginTop: "12px" }}
              >
                홈으로 이동하기
              </button>
            </motion.div>
          </div>
        )}

        {/* Hidden Capture Area */}
        <div style={{ position: "absolute", left: "-9999px", top: 0, width: "500px" }}>
          {sajuDataForCapture && (
            <>
              {/* 1. Pillar Table */}
              <div ref={capturePillarRef} style={{ padding: "20px", background: "white" }}>
                <h3 style={{ textAlign: "center", color: "#2A365F", marginBottom: "15px" }}>사주 명식표</h3>
                <SajuPillarTable 
                  data={sajuDataForCapture.sajuRes} 
                  tenGods={sajuDataForCapture.correctedSipsungCounts} 
                  stages12={sajuDataForCapture.stages12} 
                  sals={sajuDataForCapture.sinsals} 
                />
              </div>

              {/* 2. Star Chart (Base vs Corrected) */}
              <div ref={captureStarBaseRef} style={{ padding: "20px", background: "white" }}>
                <h3 style={{ textAlign: "center", color: "#666", marginBottom: "15px" }}>오행 에너지 (보정 전)</h3>
                <StargateElementChart percentages={sajuDataForCapture.basePercentages} />
              </div>
              <div ref={captureStarCorrRef} style={{ padding: "20px", background: "white" }}>
                <h3 style={{ textAlign: "center", color: "#2A365F", marginBottom: "15px" }}>오행 에너지 (보정 후)</h3>
                <StargateElementChart percentages={sajuDataForCapture.correctedPercentages} />
              </div>

              {/* 3. Donut Chart (Base vs Corrected) */}
              <div ref={captureDonutBaseRef} style={{ padding: "20px", background: "white" }}>
                <h3 style={{ textAlign: "center", color: "#666", marginBottom: "15px" }}>십성 분포 (보정 전)</h3>
                <SipsungDonutChart data={sajuDataForCapture.baseSipsungCounts} />
              </div>
              <div ref={captureDonutCorrRef} style={{ padding: "20px", background: "white" }}>
                <h3 style={{ textAlign: "center", color: "#2A365F", marginBottom: "15px" }}>십성 분포 (보정 후)</h3>
                <SipsungDonutChart data={sajuDataForCapture.correctedSipsungCounts} />
              </div>

              {/* 4. Strength Index (Base vs Corrected) */}
              <div ref={captureStrengthBaseRef} style={{ padding: "20px", background: "white" }}>
                <h3 style={{ textAlign: "center", color: "#666", marginBottom: "15px" }}>신강/신약 지수 (보정 전)</h3>
                <StrengthIndexGraph score={sajuDataForCapture.baseStrength.score} deuk={sajuDataForCapture.deuk} />
              </div>
              <div ref={captureStrengthCorrRef} style={{ padding: "20px", background: "white" }}>
                <h3 style={{ textAlign: "center", color: "#2A365F", marginBottom: "15px" }}>신강/신약 지수 (보정 후)</h3>
                <StrengthIndexGraph score={sajuDataForCapture.correctedStrength.score} deuk={sajuDataForCapture.deuk} />
                <div style={{ marginTop: "20px" }}>
                  <YongsinDisplay yongsin={sajuDataForCapture.yongsin} />
                </div>
              </div>

              {/* 5. Daeun Table */}
              <div ref={captureDaeunRef} style={{ padding: "20px", background: "white" }}>
                <DaeunTable 
                  userName="" 
                  startAge={sajuDataForCapture.daeunNum || 1} 
                  cycles={sajuDataForCapture.daeunCycles || []} 
                  currentIndex={sajuDataForCapture.currentDaeunIdx}
                  direction={sajuDataForCapture.daeunDirection}
                />
              </div>
            </>
          )}
        </div>
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
