import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AI 운세 & 사주 (AI Fortune)",
  description: "타로, 사주팔자, 꿈해몽, 점성술을 한 곳에서 만나는 프리미엄 AI 운세 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={outfit.className}>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1 }}>
            {children}
          </div>
          
          <footer style={{ 
            padding: "32px 20px", 
            textAlign: "center", 
            background: "transparent", 
            position: "relative",
            zIndex: 10
          }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center",
              gap: "24px", 
              fontSize: "0.85rem", 
              color: "var(--text-secondary)",
              fontWeight: "500"
            }}>
              <Link href="/terms" style={{ textDecoration: "none", color: "inherit", transition: "color 0.2s" }} className="hover-link">이용약관</Link>
              <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "currentColor", opacity: 0.3 }} />
              <Link href="/privacy" style={{ textDecoration: "none", color: "inherit", transition: "color 0.2s" }} className="hover-link">개인정보처리방침</Link>
            </div>
            <div style={{ marginTop: "16px", fontSize: "0.75rem", color: "var(--text-secondary)", opacity: 0.6 }}>
              © {new Date().getFullYear()} AI Fortune. All rights reserved.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
