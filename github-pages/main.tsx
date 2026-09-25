import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { TrailerPlayer } from "../app/components/TrailerPlayer";
import "../app/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TrailerPlayer />
  </StrictMode>,
);
