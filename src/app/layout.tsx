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
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
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
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/1.43.0/kakao.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={outfit.className}>
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
            {children}
          </div>
          
          <footer style={{ 
            padding: "8px 16px 12px 16px", 
            textAlign: "center", 
            background: "rgba(255, 255, 255, 0.4)", 
            backdropFilter: "blur(8px)",
            position: "relative",
            zIndex: 10,
            borderTop: "1px solid var(--glass-border)",
            lineHeight: "1.2"
          }}>
            <div style={{ width: "100%" }}>
              <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center",
                gap: "8px", 
                fontSize: "0.55rem", 
                color: "var(--accent-indigo)",
                fontWeight: "600",
                marginBottom: "4px",
                opacity: 0.5
              }}>
                <Link href="/terms" style={{ textDecoration: "none", color: "inherit" }} className="footer-link">이용약관</Link>
                <span style={{ fontSize: "0.4rem", opacity: 0.3 }}>|</span>
                <Link href="/privacy" style={{ textDecoration: "none", color: "inherit" }} className="footer-link">개인정보처리방침</Link>
              </div>
              
              <div style={{ 
                maxWidth: "600px", 
                margin: "0 auto", 
                fontSize: "0.38rem", 
                color: "var(--accent-indigo)", 
                opacity: 0.3, 
                lineHeight: "1.3",
                fontWeight: "400",
                letterSpacing: "-0.01em"
              }}>
                <p style={{ marginBottom: "1px" }}>상호명: 플레이앤겟 | 대표: 박성철 | 주소: 인천시 계양구 용종로 124 134-1402</p>
                <p style={{ marginBottom: "1px" }}>사업자번호: 170-53-00867 | 전화: 010-8243-7516</p>
                <p style={{ marginBottom: "0px" }}>© {new Date().getFullYear()} 청아매당. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
