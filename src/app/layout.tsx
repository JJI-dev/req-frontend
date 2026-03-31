import type { Metadata } from "next";
import "./globals.css";
import CursorAnimation from "@/components/CursorAnimation"; // 추가

export const metadata: Metadata = {
  title: "Project Request | JJI",
  description: "JJI, NE, MO 프로젝트 의뢰하기",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" as="style" crossOrigin="anonymous" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
      </head>
      <body className="font-['Pretendard'] bg-white text-black antialiased">
        <CursorAnimation /> {/* 커서 적용 */}
        {children}
      </body>
    </html>
  );
}