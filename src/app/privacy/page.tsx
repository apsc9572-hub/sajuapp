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
        maxWidth: "360px", 
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
            <h1 style={{ fontSize: "1.8rem", fontWeight: "700", color: "var(--accent-indigo)", letterSpacing: "0.05em", fontFamily: "'Nanum Myeongjo', serif" }}>
              개인정보처리방침
            </h1>
            <div style={{ width: "32px", height: "1px", background: "var(--accent-gold)", margin: "16px auto" }}></div>
          </div>

          <div style={{ fontSize: "0.85rem", lineHeight: "1.8", color: "var(--text-primary)", display: "flex", flexDirection: "column", gap: "28px", wordBreak: "keep-all" }}>
            <section>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--accent-indigo)", marginBottom: "12px", borderLeft: "3px solid var(--accent-gold)", paddingLeft: "10px" }}>1. 개인정보의 수집 항목 및 방법</h2>
              <p style={{ opacity: 0.8, marginBottom: "8px" }}>회사는 원활한 사주 분석 서비스를 제공하기 위해 아래와 같은 최소한의 개인정보를 수집합니다.</p>
              <ul style={{ opacity: 0.8, fontSize: "0.8rem", paddingLeft: "20px", margin: 0 }}>
                <li>필수항목: 이름, 생년월일(양력/음력), 출생시간, 성별, 출생지(도시)</li>
                <li>선택항목(서비스 전송): 이메일 주소, 휴대폰 번호</li>
                <li>수집방법: 이용자가 서비스 내 입력 폼에 직접 입력</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--accent-indigo)", marginBottom: "12px", borderLeft: "3px solid var(--accent-gold)", paddingLeft: "10px" }}>2. 개인정보의 수집 및 이용 목적</h2>
              <p style={{ opacity: 0.8, marginBottom: "8px" }}>회사는 수집한 개인정보를 아래 목적을 위해서만 이용합니다.</p>
              <ul style={{ opacity: 0.8, fontSize: "0.8rem", paddingLeft: "20px", margin: 0 }}>
                <li>사용자 맞춤형 사주 분석 결과 생성 및 서비스 제공</li>
                <li>프리미엄 사주 결과지 전송 (이메일 및 카카오 알림톡)</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--accent-indigo)", marginBottom: "12px", borderLeft: "3px solid var(--accent-gold)", paddingLeft: "10px" }}>3. 개인정보의 보유 및 파기</h2>
              <p style={{ opacity: 0.8, marginBottom: "8px" }}>1. 사용자가 입력한 개인정보는 일회성 분석 서비스의 경우 분석 완료 후 즉시 파기하거나, 관련 법령에 따라 최장 1년 이내에 파기합니다.</p>
              <p style={{ opacity: 0.8 }}>2. 개인정보의 파기는 복구 및 재생이 불가능한 기술적 방법을 사용하여 안전하게 삭제합니다.</p>
            </section>

            <section>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--accent-indigo)", marginBottom: "12px", borderLeft: "3px solid var(--accent-gold)", paddingLeft: "10px" }}>4. 개인정보의 제3자 제공</h2>
              <p style={{ opacity: 0.8, marginBottom: "8px" }}>회사는 원활한 서비스 제공을 위해 아래와 같이 개인정보를 위탁/제공하고 있습니다.</p>
              <table style={{ width: "100%", fontSize: "0.75rem", borderCollapse: "collapse", marginBottom: "8px", border: "1px solid rgba(0,0,0,0.05)" }}>
                <thead>
                  <tr style={{ background: "rgba(0,0,0,0.02)" }}>
                    <th style={{ padding: "8px", border: "1px solid rgba(0,0,0,0.05)" }}>제공받는 자</th>
                    <th style={{ padding: "8px", border: "1px solid rgba(0,0,0,0.05)" }}>이용 목적</th>
                    <th style={{ padding: "8px", border: "1px solid rgba(0,0,0,0.05)" }}>제공 항목</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: "8px", border: "1px solid rgba(0,0,0,0.05)" }}>알리고 (Aligo)</td>
                    <td style={{ padding: "8px", border: "1px solid rgba(0,0,0,0.05)" }}>카카오 알림톡 발송</td>
                    <td style={{ padding: "8px", border: "1px solid rgba(0,0,0,0.05)" }}>휴대폰 번호</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px", border: "1px solid rgba(0,0,0,0.05)" }}>토스페이먼츠</td>
                    <td style={{ padding: "8px", border: "1px solid rgba(0,0,0,0.05)" }}>결제 서비스 제공 및 본인인증</td>
                    <td style={{ padding: "8px", border: "1px solid rgba(0,0,0,0.05)" }}>결제정보 (카드사, 계좌정보 등)</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px", border: "1px solid rgba(0,0,0,0.05)" }}>Resend</td>
                    <td style={{ padding: "8px", border: "1px solid rgba(0,0,0,0.05)" }}>이메일 결과지 발송</td>
                    <td style={{ padding: "8px", border: "1px solid rgba(0,0,0,0.05)" }}>이메일 주소</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--accent-indigo)", marginBottom: "12px", borderLeft: "3px solid var(--accent-gold)", paddingLeft: "10px" }}>5. 이용자의 권리 및 문의처</h2>
              <div style={{ opacity: 0.8, background: "rgba(0,0,0,0.02)", padding: "16px", borderRadius: "12px", fontSize: "0.8rem", marginBottom: "8px" }}>
                상호: 플레이앤겟<br />
                사업자등록번호: 170-53-00867<br />
                통신판매업 번호: 2026-인천계양-0283<br />
                대표자: 박성철<br />
                주소: 인천시 계양구 용종로 124 134-1402<br />
                유선전화번호: 010-8243-7516
              </div>
              <p style={{ opacity: 0.8, marginBottom: "8px" }}>이용자는 언제든지 자신의 개인정보에 대해 열람, 정정 및 삭제를 요청할 수 있습니다.</p>
              <p style={{ opacity: 0.8 }}>문의사항은 대표 이메일 <span style={{ fontWeight: "600", color: "var(--accent-indigo)" }}>psc7516@gmail.com</span>으로 연락 주시기 바랍니다.</p>
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
