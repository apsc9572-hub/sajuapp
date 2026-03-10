import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <main style={{ width: "100%", minHeight: "100vh", background: "var(--bg-primary)", padding: "40px 20px" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto", background: "white", padding: "48px 32px", borderRadius: "24px", boxShadow: "0 10px 40px rgba(0,0,0,0.03)", border: "1px solid var(--glass-border)" }}>
        <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", marginBottom: "40px", fontSize: "0.95rem", fontWeight: "500", transition: "color 0.2s" }} className="hover-link">
          <ArrowLeft size={18} /> 홈으로 돌아가기
        </Link>
        
        <h1 style={{ fontSize: "2.2rem", fontWeight: "300", color: "var(--text-primary)", marginBottom: "48px", letterSpacing: "-0.03em" }}>개인정보처리방침</h1>
        
        <div style={{ fontSize: "1.05rem", lineHeight: "1.85", color: "var(--text-primary)", display: "flex", flexDirection: "column", gap: "32px", wordBreak: "keep-all", opacity: 0.9 }}>
          <section>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "600", color: "var(--accent-gold)", marginBottom: "12px" }}>제1조 (수집하는 개인정보의 항목 및 수집 방법)</h2>
            <p>회사는 운세 결과 분석을 위해 최소한의 개인정보만을 수집합니다.</p>
            <ul style={{ paddingLeft: "24px", marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px", listStyleType: "disc", color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>수집 항목</strong>: 생년월일, 태어난 시간, 성별</li>
              <li><strong style={{ color: "var(--text-primary)" }}>수집 방법</strong>: 사용자가 웹사이트 내 입력 폼에 직접 입력</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "600", color: "var(--accent-gold)", marginBottom: "12px" }}>제2조 (개인정보의 처리 목적)</h2>
            <p>수집된 정보는 명리학 만세력 로직 계산 및 맞춤형 사주/운세 결과 페이지를 화면에 렌더링(출력)하기 위한 일회성 목적으로만 사용됩니다.</p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "600", color: "var(--accent-gold)", marginBottom: "12px" }}>제3조 (개인정보의 보유 및 파기)</h2>
            <p>본 서비스는 별도의 데이터베이스(DB)에 사용자의 생년월일 정보를 영구 보관하지 않습니다. 계산 및 결과 출력이 완료된 후, 브라우저 세션이 종료되면 해당 데이터는 즉시 파기됩니다.</p>
            <div style={{ marginTop: "16px", fontSize: "0.95rem", color: "var(--text-secondary)", background: "rgba(0,0,0,0.03)", padding: "16px", borderRadius: "12px", borderLeft: "4px solid rgba(0,0,0,0.1)" }}>
              (단, 향후 회원가입 및 프리미엄 서비스 연동 시 보유 기간이 변경될 수 있으며, 이 경우 본 방침을 통해 사전 고지합니다.)
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "600", color: "var(--accent-gold)", marginBottom: "12px" }}>제4조 (이용자의 권리와 행사 방법)</h2>
            <p>이용자는 언제든지 서비스 이용을 중단하고 페이지를 이탈함으로써 개인정보 제공을 철회할 수 있습니다.</p>
          </section>
          
          <section>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "600", color: "var(--accent-gold)", marginBottom: "12px" }}>제5조 (개인정보 보호 책임자)</h2>
            <ul style={{ paddingLeft: "24px", marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px", listStyleType: "disc", color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>책임자 명</strong>: 박성철</li>
              <li><strong style={{ color: "var(--text-primary)" }}>이메일</strong>: psc7516@gmail.com</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
