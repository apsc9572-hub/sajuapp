"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import TraditionalBackground from "@/components/TraditionalBackground";
import SajuResultView from "@/components/SajuResultView";
import { Sparkles, AlertCircle } from "lucide-react";
import { performPremiumAnalysis } from "@/lib/premium-saju-utils";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "analyzing" | "completed" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  
  const [reading, setReading] = useState<any>(null);
  const [detailedData, setDetailedData] = useState<any>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingTextIdx, setLoadingTextIdx] = useState(0);
  const [failedSajuData, setFailedSajuData] = useState<any>(null);

  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  const loadingTexts = [
    "결제가 확인되었습니다. 명식을 구성하는 중입니다...",
    "천간과 지지의 조화를 이루어 운명의 실타래를 풉니다...",
    "30년 내공의 명리 대가가 당신을 위한 비책을 정리 중입니다...",
    "깊은 정성을 담아 당신의 인생 지도를 그려내고 있습니다..."
  ];

  const skip = searchParams.get("skip") === "true";

  useEffect(() => {
    if (skip) {
      setStatus("analyzing");
      startAnalysis();
      return;
    }

    if (!paymentKey || !orderId || !amount) {
      setStatus("error");
      setErrorMessage("결제 정보가 부족합니다.");
      return;
    }

    const confirmPayment = async () => {
      try {
        const res = await fetch("/api/confirm-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentKey, orderId, amount }),
        });

        if (res.ok) {
          setStatus("analyzing");
          await startAnalysis();
        } else {
          const errData = await res.json();
          setStatus("error");
          setErrorMessage(errData.error || "결제 확인 중 오류가 발생했습니다.");
        }
      } catch (error) {
        setStatus("error");
        setErrorMessage("서버 통신 중 오류가 발생했습니다.");
      }
    };

    confirmPayment();
  }, [paymentKey, orderId, amount, skip]);

  const startAnalysis = async () => {
    const savedData = localStorage.getItem("premium_saju_data");
    if (!savedData) {
      setStatus("error");
      setErrorMessage("입력된 사주 정보가 없습니다.");
      return;
    }

    try {
      const data = JSON.parse(savedData);
      setFailedSajuData(data);
      
      const textInt = setInterval(() => setLoadingTextIdx(p => (p + 1) % loadingTexts.length), 2500);
      const progInt = setInterval(() => setLoadingProgress(p => p < 95 ? p + 0.5 : p), 100);

      const result = await performPremiumAnalysis(data);
      
      setReading(result.reading);
      setDetailedData(result.detailedData);
      
      setStatus("completed");
      setLoadingProgress(100);
      clearInterval(textInt);
      clearInterval(progInt);
      
      // Clear data to prevent stale results in next session
      localStorage.removeItem("premium_saju_data");
      
    } catch (e: any) {
      console.error(e);
      setStatus("error");
      setErrorMessage(e.message || "분석 중 오류가 발생했습니다.");
    }
  };

  const handleCopy = () => {
    if (!reading) return;
    const text = `[청아매당 프리미엄 사주 리포트]\n${reading.headline}\n${reading.subheadline}\n\n[분석 결과]\n${reading.yongsin ? `나의 용신: ${reading.yongsin}\n${reading.yongsin_desc}\n` : ""}제목: ${reading.analysis?.title}\n\n인생의 형상:\n${reading.analysis?.life_shape}\n\n영역별 집중 분석 & 해답:\n${reading.analysis?.solution}\n\n실전 개운 비책:\n${reading.luck_advice}\n\n핵심 성패 시기:\n${reading.analysis?.timing}\n\n플레이앤겟(청아매당) © 2026. 모든 권리 보유.`.trim();
    navigator.clipboard.writeText(text).then(() => {
      alert("전체 결과가 클립보드에 복사되었습니다.");
    }).catch(err => {
      console.error("복사 실패:", err);
      alert("복사에 실패했습니다.");
    });
  };

  const [emailForReport, setEmailForReport] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);

  const handleKakaoShare = () => {
    if (!reading || !(window as any).Kakao) {
      alert("카카오톡SDK를 불러오는 중입니다...");
      return;
    }
    const Kakao = (window as any).Kakao;
    if (!Kakao.isInitialized()) {
      Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY || "5370d0fd3be699d7a2f1952f99052601");
    }

    Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: '청아매당 PREMIUM 사주 감명',
        description: '당신만을 위한 고품격 명리 처방전이 도착했습니다.',
        imageUrl: 'https://www.cheongamaedang.com/cheong_a_mae_dang_final_logo.png',
        link: { mobileWebUrl: window.location.href, webUrl: window.location.href },
      },
      buttons: [{ title: '결과 확인하기', link: { mobileWebUrl: window.location.href, webUrl: window.location.href } }],
    });
  };

  const handleSendEmail = async () => {
    if (!emailForReport || !reading) {
      alert("이메일 주소를 입력해주세요.");
      return;
    }
    setIsSendingEmail(true);
    try {
      const res = await fetch("/api/send-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: emailForReport, reading, sajuData: failedSajuData }),
      });
      if (res.ok) {
        setEmailSentSuccess(true);
      } else {
        throw new Error("발송 실패");
      }
    } catch (e) {
      alert("이메일 발송 중 오류가 발생했습니다.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const [userEmail, setUserEmail] = useState("");
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) return;
    
    // 이메일 정규식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      alert("올바른 이메일 형식이 아닙니다.");
      return;
    }

    try {
      const res = await fetch("/api/report-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail,
          sajuData: failedSajuData,
          timestamp: new Date().toLocaleString(),
        }),
      });

      if (res.ok) {
        setIsEmailSubmitted(true);
      } else {
        // 백엔드 설정이 안 되어 있을 경우를 대비한 mailto 폴백
        const dataStr = failedSajuData ? JSON.stringify(failedSajuData, null, 2) : "사주 정보 없음";
        const subject = encodeURIComponent("[청아매당] 프리미엄 사주 분석 실패 리포트 (관리자 확인용)");
        const body = encodeURIComponent(`사용자 연락처: ${userEmail}\n발생 시각: ${new Date().toLocaleString()}\n\n[사주 데이터]\n${dataStr}`);
        window.location.href = `mailto:apsc9572@gmail.com?subject=${subject}&body=${body}`;
        setIsEmailSubmitted(true);
      }
    } catch (error) {
      console.error("Error reporting error:", error);
      setIsEmailSubmitted(true);
    }
  };

  return (
    <main style={{ width: "100%", minHeight: "100vh", position: "relative", background: "var(--bg-primary)" }}>
      <TraditionalBackground />
      <div style={{ maxWidth: "520px", margin: "0 auto", minHeight: "100vh", background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(20px)", padding: "40px 20px" }}>
        
        {status === "verifying" && (
          <div style={{ textAlign: "center", paddingTop: "100px" }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
              <Sparkles size={48} color="var(--accent-gold)" />
            </motion.div>
            <h2 style={{ marginTop: "24px", color: "var(--accent-indigo)" }}>결제를 확인하고 있습니다...</h2>
          </div>
        )}

        {status === "error" && (
          <div style={{ textAlign: "center", paddingTop: "60px" }}>
            <AlertCircle size={64} color="#ef4444" style={{ margin: "0 auto 24px" }} />
            <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#333", marginBottom: "16px" }}>인생총운 도출 오류 안내</h2>
            
            <div style={{ background: "#fff5f5", padding: "20px", borderRadius: "16px", border: "1px solid #fed7d7", marginBottom: "32px", textAlign: "left" }}>
              <p style={{ color: "#c53030", fontWeight: "700", marginBottom: "12px", fontSize: "1rem" }}>결제는 정상적으로 완료되었습니다.</p>
              <p style={{ color: "#4a5568", fontSize: "0.95rem", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                {errorMessage || "현재 많은 사용자의 접속으로 인해 일시적으로 AI 분석 결과 도출이 지체되고 있습니다."}
                <br/><br/>
                아래에 **이메일 주소**를 남겨주시면, 담당자가 확인 후 24시간 이내에 정밀 사주풀이 결과지를 메일로 직접 발송해 드리겠습니다. 이용에 불편을 드려 대단히 죄송합니다.
              </p>
            </div>

            {!isEmailSubmitted ? (
              <form onSubmit={handleEmailSubmit} style={{ width: "100%" }}>
                <input 
                  type="text" 
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="결과를 받으실 이메일 주소 입력"
                  required
                  style={{ 
                    width: "100%", padding: "16px", borderRadius: "14px", border: "2px solid #e2e8f0",
                    marginBottom: "16px", fontSize: "1rem", outline: "none"
                  }}
                />
                <button type="submit" className="btn-primary" style={{ width: "100%", padding: "16px", borderRadius: "14px", background: "var(--accent-indigo)", color: "white", border: "none", fontWeight: "700", fontSize: "1.1rem" }}>
                  이메일 주소 보내기
                </button>
                <button onClick={() => router.push("/")} style={{ background: "none", border: "none", color: "#999", marginTop: "20px", cursor: "pointer", fontSize: "0.9rem", textDecoration: "underline" }}>
                  홈으로 돌아가기
                </button>
              </form>
            ) : (
              <div style={{ padding: "30px", background: "#f0fff4", borderRadius: "16px", border: "1px solid #c6f6d5" }}>
                <p style={{ color: "#2f855a", fontWeight: "800", fontSize: "1.1rem" }}>이메일이 정상적으로 접수되었습니다.</p>
                <p style={{ color: "#48bb78", marginTop: "8px" }}>최대한 빠르게 분석하여 보내드리겠습니다. 감사합니다.</p>
                <button onClick={() => router.push("/")} className="btn-primary" style={{ width: "100%", marginTop: "24px", padding: "14px", borderRadius: "12px", background: "var(--accent-indigo)", color: "white", border: "none" }}>홈으로 가기</button>
              </div>
            )}
          </div>
        )}

        {status === "analyzing" && (
          <div style={{ textAlign: "center", paddingTop: "20px" }}>
            <div style={{ position: "relative", width: "160px", height: "160px", margin: "0 auto 30px" }}>
              {/* Premium Rotating Background Aura */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                style={{
                  position: "absolute", inset: 0, borderRadius: "50%",
                  background: "conic-gradient(from 0deg, transparent, rgba(212, 163, 115, 0.3), transparent)",
                  filter: "blur(15px)"
                }}
              />
              
              <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)", width: "100%", height: "100%", position: "relative", zIndex: 1 }}>
                <defs>
                  <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#D4A373" />
                    <stop offset="100%" stopColor="#FFD700" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="4" />
                <motion.circle 
                  cx="50" cy="50" r="45" fill="none" 
                  stroke="url(#goldGradient)" strokeWidth="5" 
                  strokeDasharray="282.7" 
                  animate={{ strokeDashoffset: 282.7 - (282.7 * loadingProgress) / 100 }} 
                  transition={{ duration: 0.1, ease: "linear" }}
                  strokeLinecap="round" 
                />
              </svg>

              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                <div style={{ fontSize: "1.8rem", fontWeight: "900", color: "var(--accent-indigo)", lineHeight: "1" }}>{Math.round(loadingProgress)}%</div>
                <div style={{ fontSize: "0.6rem", color: "var(--accent-gold)", fontWeight: "700", marginTop: "2px", letterSpacing: "1px" }}>ANALYZING</div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={loadingTextIdx}
              style={{ minHeight: "50px" }}
            >
              <h2 style={{ color: "var(--accent-indigo)", fontSize: "1.1rem", fontWeight: "800", marginBottom: "8px" }}>귀하의 질문을 명리학적 근거로 해석 중입니다.</h2>
              <p style={{ color: "#666", fontSize: "0.85rem", lineHeight: "1.5", fontWeight: "500", padding: "0 20px" }}>{loadingTexts[loadingTextIdx]}</p>
            </motion.div>

            <div style={{ marginTop: "30px", padding: "12px", background: "rgba(212, 163, 115, 0.08)", borderRadius: "14px", border: "1px solid rgba(212, 163, 115, 0.15)" }}>
              <p style={{ color: "#8a6d3b", fontSize: "0.75rem", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", lineHeight: "1.4" }}>
                <Sparkles size={12} /> 프리미엄 감명은 고객님께 딱 맞춰 제작되므로<br/>1~2분 이상 소요될 수 있음을 양해 부탁드립니다.
              </p>
            </div>
          </div>
        )}

        {status === "completed" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Premium Delivery Notice Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              style={{ 
                background: "linear-gradient(135deg, #fdfbf7 0%, #ffffff 100%)", 
                padding: "32px 24px", 
                borderRadius: "28px", 
                border: "1.5px solid rgba(212, 163, 115, 0.3)",
                boxShadow: "0 15px 40px rgba(0,0,0,0.06)",
                textAlign: "center",
                position: "relative",
                overflow: "hidden"
              }}
            >
              <div style={{ position: "absolute", top: 0, right: 0, padding: "12px", opacity: 0.1 }}><Sparkles size={40} color="var(--accent-gold)" /></div>
              <div style={{ background: "rgba(212, 163, 115, 0.1)", color: "#8a6d3b", padding: "6px 16px", borderRadius: "30px", fontSize: "0.75rem", fontWeight: "800", display: "inline-block", marginBottom: "20px", letterSpacing: "0.05em" }}>
                PREMIUM DELIVERY SERVICE
              </div>
              <h3 style={{ fontSize: "1.35rem", fontWeight: "900", color: "var(--accent-indigo)", marginBottom: "16px", lineHeight: "1.45", wordBreak: "keep-all", fontFamily: "'Nanum Myeongjo', serif" }}>
                청아매당의 대가가 귀하의 명식을 고찰 중입니다.
              </h3>
              <p style={{ fontSize: "0.95rem", color: "#666", lineHeight: "1.7", marginBottom: "28px", wordBreak: "keep-all", fontWeight: "500" }}>
                귀하의 질문 내용은 전문 명리 용어가 포함된 심층 분석이 필요하여, **청아매당의 30년 내공 명리 대가**가 직접 세심히 **살피고 있으며**, 분석이 종료되는 즉시 아래 채널로 당신만의 소중한 인생 지도를 전송해 드립니다.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <button 
                  onClick={handleKakaoShare}
                  style={{ width: "100%", padding: "16px", borderRadius: "16px", background: "#FEE500", color: "#3C1E1E", border: "none", fontWeight: "800", fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", boxShadow: "0 4px 12px rgba(254, 229, 0, 0.2)" }}
                >
                  <img src="https://developers.kakao.com/assets/img/about/logos/kakaotalksharing/kakaotalk_sharing_btn_medium.png" alt="kakao" style={{ width: "20px" }} />
                  카카오톡으로 결과 받기
                </button>

                <div style={{ marginTop: "8px" }}>
                  {!emailSentSuccess ? (
                    <div style={{ background: "white", padding: "4px", borderRadius: "18px", border: "1.5px solid #eee", display: "flex", alignItems: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.02)" }}>
                      <input 
                        type="email" 
                        value={emailForReport}
                        onChange={(e) => setEmailForReport(e.target.value)}
                        placeholder="이메일 주소 입력"
                        style={{ flex: 1, border: "none", padding: "12px 16px", fontSize: "0.95rem", outline: "none", background: "transparent" }}
                      />
                      <button 
                        onClick={handleSendEmail}
                        disabled={isSendingEmail}
                        style={{ background: "var(--accent-indigo)", color: "white", border: "none", padding: "12px 20px", borderRadius: "14px", fontWeight: "700", cursor: "pointer", opacity: isSendingEmail ? 0.7 : 1 }}
                      >
                        {isSendingEmail ? "발송 중..." : "이메일 전송"}
                      </button>
                    </div>
                  ) : (
                    <div style={{ background: "rgba(46, 125, 50, 0.05)", color: "#2E7D32", padding: "16px", borderRadius: "16px", fontWeight: "700", fontSize: "0.9rem", border: "1.5px solid rgba(46, 125, 50, 0.1)" }}>
                      ✅ 이메일로 분석 결과가 발송되었습니다.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            <div style={{ marginTop: "20px", borderTop: "2px dashed #eee", paddingTop: "40px" }}>
              <div style={{ textAlign: "center", marginBottom: "30px" }}>
                <span style={{ fontSize: "0.75rem", color: "#999", fontWeight: "800", letterSpacing: "0.1em" }}>PREVIEW</span>
                <h4 style={{ fontSize: "1.1rem", color: "#333", fontWeight: "800" }}>명리 초록 (심층 분석 초안)</h4>
              </div>
              <SajuResultView reading={reading} detailedData={detailedData} onCopy={handleCopy} />
            </div>
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
