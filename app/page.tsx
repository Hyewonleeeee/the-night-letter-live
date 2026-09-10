import type { Metadata } from "next";
import { LiveCodingConsole } from "./components/LiveCodingConsole";

export const metadata: Metadata = {
  title: "Live Cinema Desk — The Night Letter",
  description: "왼쪽 시네마틱 영상과 오른쪽 실시간 코드 편집기를 결합한 공연 화면",
};

export default function HomePage() {
  return <LiveCodingConsole />;
}
