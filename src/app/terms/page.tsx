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
              서비스 이용약관
            </h1>
            <div style={{ width: "32px", height: "1px", background: "var(--accent-gold)", margin: "16px auto" }}></div>
          </div>

          <div style={{ fontSize: "0.85rem", lineHeight: "1.8", color: "var(--text-primary)", display: "flex", flexDirection: "column", gap: "28px", wordBreak: "keep-all" }}>
            <section>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--accent-indigo)", marginBottom: "12px", borderLeft: "3px solid var(--accent-gold)", paddingLeft: "10px" }}>제1조 (목적)</h2>
              <p style={{ opacity: 0.8 }}>본 약관은 플레이앤겟(이하 "회사")이 운영하는 '청아매당'(이하 "서비스")에서 제공하는 사주 분석 및 운세 서비스의 이용 조건 및 절차를 규정함을 목적으로 합니다.</p>
            </section>

            <section>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--accent-indigo)", marginBottom: "12px", borderLeft: "3px solid var(--accent-gold)", paddingLeft: "10px" }}>제2조 (사업자 정보)</h2>
              <div style={{ opacity: 0.8, background: "rgba(0,0,0,0.02)", padding: "16px", borderRadius: "12px", fontSize: "0.8rem" }}>
                상호: 플레이앤겟<br />
                사업자등록번호: 170-53-00867<br />
                통신판매업 번호: 2026-인천계양-0283<br />
                대표자: 박성철<br />
                주소: 인천시 계양구 용종로 124 134-1402<br />
                유선전화번호: 010-8243-7516
              </div>
            </section>

            <section>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--accent-indigo)", marginBottom: "12px", borderLeft: "3px solid var(--accent-gold)", paddingLeft: "10px" }}>제3조 (서비스의 성격 및 제공 방식)</h2>
              <p style={{ opacity: 0.8, marginBottom: "8px" }}>1. 본 서비스가 제공하는 모든 분석 결과는 명리학적 알고리즘에 기반한 추정치이며, 이는 과학적 사실이나 확정적 미래를 보장하지 않는 엔터테인먼트 및 참고용 정보입니다.</p>
              <p style={{ opacity: 0.8, marginBottom: "8px" }}>2. 프리미엄 사주 서비스는 분석 완료 후 이용자가 입력한 <strong>이메일 전송 또는 카카오 알림톡</strong>을 통해 결과지에 접근할 수 있는 링크를 제공하는 방식으로 전달됩니다.</p>
              <p style={{ opacity: 0.8, background: "rgba(212, 175, 55, 0.05)", padding: "16px", borderRadius: "12px", border: "1px dashed var(--accent-gold)", fontWeight: "600" }}>
                본 사주 결과는 단순 참고용이며, 어떠한 경우에도 법적·의학적 효력이 없습니다. 사용자가 본 서비스의 결과를 바탕으로 내린 결정에 대한 모든 책임은 사용자 본인에게 있습니다.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--accent-indigo)", marginBottom: "12px", borderLeft: "3px solid var(--accent-gold)", paddingLeft: "10px" }}>제4조 (결제 및 보안)</h2>
              <p style={{ opacity: 0.8, marginBottom: "8px" }}>1. 본 서비스의 모든 유료 결제는 <strong>토스페이먼츠(Toss Payments)</strong>의 전자결제 시스템을 통해 안전하게 처리됩니다.</p>
              <p style={{ opacity: 0.8 }}>2. 회사는 이용자의 신용카드 번호, 계좌번호 등 민감한 결제 정보를 직접 수집하거나 저장하지 않으며, 토스페이먼츠의 보안 가이드를 준수합니다.</p>
            </section>

            <section>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--accent-indigo)", marginBottom: "12px", borderLeft: "3px solid var(--accent-gold)", paddingLeft: "10px" }}>제5조 (환불 정책)</h2>
              <p style={{ opacity: 0.8, marginBottom: "8px" }}>1. 본 서비스의 프리미엄 사주 및 운세 결과는 결제와 동시에 생성이 시작되어 즉시 제공되는 <strong>디지털 맞춤형 콘텐츠</strong>입니다.</p>
              <p style={{ opacity: 0.8, marginBottom: "8px" }}>2. 전자상거래법 제17조 제2항 제5호에 의거하여, 디지털 콘텐츠의 제공이 개시된 이후에는 단순 변심으로 인한 환불이 불가능합니다.</p>
              <p style={{ opacity: 0.8, marginBottom: "8px" }}>3. 단, 아래와 같은 사유에 해당할 경우 회사는 환불 조치를 진행할 수 있습니다.</p>
              <ul style={{ opacity: 0.8, fontSize: "0.8rem", paddingLeft: "20px", margin: 0 }}>
                <li>회사의 귀책사유로 결제 오류가 발생하여 최종 분석 결과를 제공받지 못한 경우</li>
                <li>회사의 귀책사유로 서비스가 장기 중단되어 구매한 콘텐츠를 이용할 수 없는 경우</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--accent-indigo)", marginBottom: "12px", borderLeft: "3px solid var(--accent-gold)", paddingLeft: "10px" }}>제6조 (이용자의 의무)</h2>
              <p style={{ opacity: 0.8, marginBottom: "8px" }}>1. 이용자는 서비스 이용 시 정확한 생년월일, 태어난 시간, 성별 및 전송받을 연락처(이메일, 휴대폰 번호)를 입력해야 합니다.</p>
              <p style={{ opacity: 0.8 }}>2. 오기입으로 인한 분석 오류나 발송 실패에 대한 책임은 이용자 본인에게 있으며, 이로 인한 재발급 및 환불은 불가능합니다.</p>
            </section>

            <section>
              <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--accent-indigo)", marginBottom: "12px", borderLeft: "3px solid var(--accent-gold)", paddingLeft: "10px" }}>제7조 (저작권 및 이용 제한)</h2>
              <p style={{ opacity: 0.8 }}>본 서비스에서 제공하는 모든 텍스트, 이미지, 분석 알고리즘의 저작권은 회사에 있으며, 무단 복제 및 상업적 이용을 엄격히 금합니다.</p>
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
