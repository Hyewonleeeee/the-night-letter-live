import type { Metadata } from "next";
import { TrailerPlayer } from "../components/TrailerPlayer";

export const metadata: Metadata = {
  title: "Black Magic — November Preview",
  description: "New Music Performance를 위한 4분 50초 시네마틱 예고편",
};

export default function TrailerPage() {
  return <TrailerPlayer />;
}
