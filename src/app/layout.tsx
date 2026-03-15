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
  title: "청아매당 운세 & 사주",
  description: "전통의 혜안으로 풀어내는 프리미엄 사주 및 운세 서비스, 청아매당",
};

import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1046890617917852"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={outfit.className}>
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
            {children}
          </div>
          
          <footer style={{ 
            padding: "12px 20px 16px 20px", 
            textAlign: "center", 
            background: "rgba(255, 255, 255, 0.3)", 
            backdropFilter: "blur(5px)",
            position: "relative",
            zIndex: 10,
            borderTop: "1px solid rgba(42, 54, 95, 0.03)"
          }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center",
              gap: "10px", 
              fontSize: "0.65rem", 
              color: "var(--accent-indigo)",
              fontWeight: "600",
              marginBottom: "4px",
              opacity: 0.6
            }}>
              <Link href="/terms" style={{ textDecoration: "none", color: "inherit" }} className="footer-link">이용약관</Link>
              <span style={{ fontSize: "0.5rem", opacity: 0.2 }}>|</span>
              <Link href="/privacy" style={{ textDecoration: "none", color: "inherit" }} className="footer-link">개인정보처리방침</Link>
            </div>
            
            <div style={{ 
              maxWidth: "600px", 
              margin: "0 auto", 
              fontSize: "0.6rem", 
              color: "var(--accent-indigo)", 
              opacity: 0.4, 
              lineHeight: "1.3",
              fontWeight: "400"
            }}>
              <p style={{ marginBottom: "2px" }}>분석 결과에 대한 최종 책임은 사용자에게 있습니다.</p>
              <p>© {new Date().getFullYear()} 청아매당. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
