"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import TraditionalBackground from "@/components/TraditionalBackground";
import { Suspense } from "react";

function FailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const code = searchParams.get("code");
  const message = searchParams.get("message");

  return (
    <main style={{ width: "100%", minHeight: "100vh", position: "relative", background: "var(--bg-primary)" }}>
      <TraditionalBackground />
      <div style={{ maxWidth: "520px", margin: "0 auto", minHeight: "100vh", background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(20px)", padding: "80px 20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}>
          <AlertCircle size={80} color="#ef4444" style={{ marginBottom: "24px" }} />
        </motion.div>

        <h2 style={{ fontSize: "1.5rem", fontWeight: "900", color: "#333", marginBottom: "12px", fontFamily: "'Nanum Myeongjo', serif" }}>결제에 실패했습니다</h2>
        <p style={{ fontSize: "1rem", color: "#666", marginBottom: "40px", lineHeight: "1.6" }}>
          {message || "잠시 후 다시 시도해 주세요."}
          {code && <span style={{ display: "block", fontSize: "0.8rem", color: "#999", marginTop: "8px" }}>에러 코드: {code}</span>}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
          <button 
            onClick={() => router.push("/premium-saju")} 
            style={{ 
              width: "100%", padding: "16px", borderRadius: "16px", 
              background: "var(--accent-indigo)", color: "white", 
              fontWeight: "700", fontSize: "1.1rem", border: "none",
              display: "flex", justifyContent: "center", alignItems: "center", gap: "8px",
              cursor: "pointer"
            }}
          >
            <ArrowLeft size={20} /> 다시 시도하기
          </button>
          <button 
            onClick={() => router.push("/")} 
            style={{ 
              width: "100%", padding: "16px", borderRadius: "16px", 
              background: "white", color: "#666", 
              fontWeight: "600", fontSize: "1rem", border: "1px solid #eee",
              display: "flex", justifyContent: "center", alignItems: "center", gap: "8px",
              cursor: "pointer"
            }}
          >
            <Home size={18} /> 홈으로 이동
          </button>
        </div>

        <div style={{ marginTop: "60px", padding: "20px", background: "#fcfcfc", borderRadius: "12px", border: "1px solid #f0f0f0", textAlign: "left", width: "100%" }}>
          <h4 style={{ fontSize: "0.9rem", color: "#333", marginBottom: "8px", fontWeight: "700" }}>안내 사항</h4>
          <ul style={{ paddingLeft: "20px", margin: 0, fontSize: "0.8rem", color: "#888", lineHeight: "1.6" }}>
            <li>결제 도중 창을 닫거나 통신 환경이 불안정할 경우 실패할 수 있습니다.</li>
            <li>지속적으로 결제가 실패할 경우 고객센터로 문의해 주세요.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

export default function FailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FailContent />
    </Suspense>
  );
}
