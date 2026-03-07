import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
