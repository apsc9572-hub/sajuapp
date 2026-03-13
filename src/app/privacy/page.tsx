"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TraditionalBackground from "@/components/TraditionalBackground";
import { motion } from "framer-motion";

export default function PrivacyPage() {
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
              개인정보처리방침
            </h1>
            <div style={{ width: "32px", height: "1px", background: "var(--accent-gold)", margin: "16px auto" }}></div>
          </div>

          <div style={{ fontSize: "0.95rem", lineHeight: "1.8", color: "var(--text-primary)", display: "flex", flexDirection: "column", gap: "32px", wordBreak: "keep-all" }}>
            <section>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--accent-indigo)", marginBottom: "12px", borderLeft: "3px solid var(--accent-gold)", paddingLeft: "10px" }}>1. 개인정보의 수집 및 이용 목적</h2>
              <p style={{ opacity: 0.8 }}>'청아매당'은 사용자의 사주 분석 및 운세 결과 제공을 위해 최소한의 정보(생년월일, 태어난 시간, 성별)를 수집합니다. 수집된 정보는 오직 분석 목적으로만 사용되며 다른 용도로 활용되지 않습니다.</p>
            </section>

            <section>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--accent-indigo)", marginBottom: "12px", borderLeft: "3px solid var(--accent-gold)", paddingLeft: "10px" }}>2. 개인정보의 보유 및 이용 기간</h2>
              <p style={{ opacity: 0.8 }}>사용자가 입력한 데이터는 분석 결과 제공 즉시 파기되거나, 브라우저의 세션 동안에만 임시로 보관됩니다. 별도의 서버에 개인 정보를 영구 저장하지 않습니다.</p>
            </section>

            <section>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--accent-indigo)", marginBottom: "12px", borderLeft: "3px solid var(--accent-gold)", paddingLeft: "10px" }}>3. 제3자 제공 및 쿠키 사용</h2>
              <p style={{ opacity: 0.8 }}>본 서비스는 구글 애드센스(Google AdSense) 등 외부 광고 플랫폼을 사용하며, 광고 최적화를 위해 쿠키(Cookie)를 사용할 수 있습니다. 사용자는 브라우저 설정을 통해 쿠키 수집을 거부할 수 있습니다.</p>
            </section>

            <section>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--accent-indigo)", marginBottom: "12px", borderLeft: "3px solid var(--accent-gold)", paddingLeft: "10px" }}>4. 문의처</h2>
              <p style={{ opacity: 0.8 }}>서비스 이용 중 개인정보 관련 문의는 <span style={{ fontWeight: "600", color: "var(--accent-indigo)" }}>psc7516@gmail.com</span>으로 연락 주시기 바랍니다.</p>
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
