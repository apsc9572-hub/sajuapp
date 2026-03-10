import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <main style={{ width: "100%", minHeight: "100vh", background: "var(--bg-primary)", padding: "40px 20px" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto", background: "white", padding: "48px 32px", borderRadius: "24px", boxShadow: "0 10px 40px rgba(0,0,0,0.03)", border: "1px solid var(--glass-border)" }}>
        <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", marginBottom: "40px", fontSize: "0.95rem", fontWeight: "500", transition: "color 0.2s" }} className="hover-link">
          <ArrowLeft size={18} /> 홈으로 돌아가기
        </Link>
        
        <h1 style={{ fontSize: "2.2rem", fontWeight: "300", color: "var(--text-primary)", marginBottom: "48px", letterSpacing: "-0.03em" }}>이용약관</h1>
        
        <div style={{ fontSize: "1.05rem", lineHeight: "1.85", color: "var(--text-primary)", display: "flex", flexDirection: "column", gap: "32px", wordBreak: "keep-all", opacity: 0.9 }}>
          <section>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "600", color: "var(--accent-gold)", marginBottom: "12px" }}>제1조 (목적)</h2>
            <p>본 약관은 서비스명이 제공하는 명리학 기반 운세 서비스의 이용 조건 및 절차, 회사와 회원 간의 권리와 의무 등을 규정함을 목적으로 합니다.</p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "600", color: "var(--accent-gold)", marginBottom: "12px" }}>제2조 (서비스의 성격 및 면책)</h2>
            <p>회사가 제공하는 사주, 운세, 궁합 등의 분석 결과는 동양의 명리학 데이터를 기반으로 한 통계적 해석이며, 개인의 미래를 확정적으로 예견하거나 보장하지 않습니다.</p>
            <p style={{ marginTop: "12px" }}>본 서비스의 모든 결과는 단순 참조 및 엔터테인먼트 목적으로만 활용되어야 하며, 사용자의 의사결정(투자, 의료, 법률적 판단 등)에 대한 법적 책임을 지지 않습니다.</p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "600", color: "var(--accent-gold)", marginBottom: "12px" }}>제3조 (서비스의 제공 및 변경)</h2>
            <p>회사는 운영상, 기술상의 필요에 따라 제공하고 있는 서비스를 변경할 수 있으며, 이 경우 서비스 내 공지사항을 통해 사전에 안내합니다.</p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "600", color: "var(--accent-gold)", marginBottom: "12px" }}>제4조 (이용자의 의무)</h2>
            <p>이용자는 서비스를 이용할 때 타인의 정보를 도용하거나 범죄 행위를 목적으로 서비스를 이용해서는 안 됩니다.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
