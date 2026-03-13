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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1046890617917852"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className={outfit.className}>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1 }}>
            {children}
          </div>
          
          <footer style={{ 
            padding: "48px 20px 32px", 
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
              color: "var(--accent-indigo)", // 더 진한 색상으로 변경
              fontWeight: "700", // 더 굵게
              textShadow: "0 1px 10px rgba(255, 255, 255, 0.8)" // 텍스트 쉐도우 추가
            }}>
              <Link href="/terms" style={{ textDecoration: "none", color: "inherit", transition: "color 0.2s" }} className="hover-link">이용약관</Link>
              <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--accent-gold)", opacity: 0.6 }} />
              <Link href="/privacy" style={{ textDecoration: "none", color: "inherit", transition: "color 0.2s" }} className="hover-link">개인정보처리방침</Link>
            </div>
            <div style={{ marginTop: "16px", fontSize: "0.75rem", color: "var(--accent-indigo)", opacity: 0.8, fontWeight: "600" }}>
              © {new Date().getFullYear()} 청아매당 (Cheong-A Mae-Dang). All rights reserved.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
