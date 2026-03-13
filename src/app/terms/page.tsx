"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TraditionalBackground from "@/components/TraditionalBackground";
import { motion } from "framer-motion";

export default function TermsPage() {
  return (
    <main style={{ width: "100%", minHeight: "100vh", position: "relative", background: "var(--bg-primary)" }}>
      <TraditionalBackground />
      
      <div style={{ 
        maxWidth: "480px", 
        margin: "0 auto", 
        minHeight: "100vh", 
        position: "relative", 
        zIndex: 1, 
        background: "rgba(255, 255, 255, 0.95)", 
        backdropFilter: "blur(20px)",
        boxShadow: "0 0 60px rgba(26, 28, 44, 0.12)",
        display: "flex",
        flexDirection: "column"
      }}>
        <div style={{ padding: "32px 24px" }}>
          <Link href="/" style={{ textDecoration: "none", marginBottom: "40px", display: "inline-block" }}>
            <button style={{ background: "rgba(42, 54, 95, 0.05)", border: "none", color: "var(--accent-indigo)", cursor: "pointer", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><ArrowLeft size={20} /></button>
          </Link>

          <div className="text-center" style={{ marginBottom: "52px" }}>
            <motion.div 
               initial={{ opacity: 0, y: -10 }} 
               animate={{ opacity: 1, y: 0 }}
               style={{ display: "inline-block", background: "var(--accent-cherry)", color: "var(--accent-indigo)", padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700", marginBottom: "16px", letterSpacing: "0.1em" }}
            >
              CHEONG-A MAE-DANG
            </motion.div>
            <h1 style={{ fontSize: "2.2rem", fontWeight: "700", color: "var(--accent-indigo)", letterSpacing: "0.05em", fontFamily: "'Nanum Myeongjo', serif" }}>
              서비스 이용약관
            </h1>
            <div style={{ width: "32px", height: "1px", background: "var(--accent-gold)", margin: "16px auto" }}></div>
          </div>

          <div style={{ fontSize: "0.95rem", lineHeight: "1.8", color: "var(--text-primary)", display: "flex", flexDirection: "column", gap: "32px", wordBreak: "keep-all" }}>
            <section>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--accent-indigo)", marginBottom: "12px", borderLeft: "3px solid var(--accent-gold)", paddingLeft: "10px" }}>제1조 (목적)</h2>
              <p style={{ opacity: 0.8 }}>본 약관은 '청아매당'이 제공하는 사주 분석 및 운세 서비스의 이용 조건과 절차를 규정함을 목적으로 합니다.</p>
            </section>

            <section>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--accent-indigo)", marginBottom: "12px", borderLeft: "3px solid var(--accent-gold)", paddingLeft: "10px" }}>제2조 (서비스의 성격)</h2>
              <p style={{ opacity: 0.8 }}>'청아매당'이 제공하는 모든 분석 결과는 알고리즘에 기반한 추정치이며, 이는 과학적 사실이 아닌 엔터테인먼트 및 참고용 정보입니다.</p>
            </section>

            <section>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--accent-indigo)", marginBottom: "12px", borderLeft: "3px solid var(--accent-gold)", paddingLeft: "10px" }}>제3조 (책임의 제한)</h2>
              <p style={{ opacity: 0.8, marginBottom: "12px" }}>사용자가 본 서비스의 결과를 바탕으로 내린 유료 결제, 투자, 사업적 결정 등 모든 행동에 대한 책임은 사용자 본인에게 있습니다.</p>
              <p style={{ opacity: 0.8, background: "rgba(212, 175, 55, 0.05)", padding: "16px", borderRadius: "12px", border: "1px dashed var(--accent-gold)" }}>'청아매당'은 결과의 정확성을 보장하지 않으며, 결과로 인해 발생한 유무형의 손해에 대해 법적 책임을 지지 않습니다.</p>
            </section>

            <section>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--accent-indigo)", marginBottom: "12px", borderLeft: "3px solid var(--accent-gold)", paddingLeft: "10px" }}>제4조 (저작권)</h2>
              <p style={{ opacity: 0.8 }}>본 서비스에서 제공하는 모든 텍스트 및 이미지 콘텐츠의 저작권은 '청아매당'에 있으며, 무단 복제 및 상업적 이용을 금합니다.</p>
            </section>
          </div>

          <div style={{ marginTop: "60px", textAlign: "center", paddingBottom: "40px" }}>
            <Link href="/">
              <button style={{ background: "transparent", border: "1px solid var(--glass-border)", color: "var(--text-secondary)", padding: "12px 24px", borderRadius: "30px", fontSize: "0.9rem", fontWeight: "500", cursor: "pointer" }}>
                홈으로 돌아가기
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
