import type { Metadata } from "next";
import { TrailerLiveConsole } from "../components/TrailerLiveConsole";

export const metadata: Metadata = {
  title: "Black Magic — November Live Visual Score",
  description: "세 번의 코드 붙여넣기로 연주하는 New Music Performance 예고편",
};

export default function LiveTrailerPage() {
  return <TrailerLiveConsole />;
}
