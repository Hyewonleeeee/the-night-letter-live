import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Night Letter — Cinematic Player",
  description: "30분 공연 영상을 위한 브라우저 기반 시네마틱 웹 플레이어",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
