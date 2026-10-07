import type { Metadata } from "next";
import { TrailerPlayer } from "../components/TrailerPlayer";

export const metadata: Metadata = {
  title: "Black Magic — Clean Stage Output",
  description: "라이브 코딩 공연 화면을 위한 UI 없는 예고편 출력",
};

export default function TrailerStagePage() {
  return <TrailerPlayer stageMode />;
}
