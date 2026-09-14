import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CinematicPlayer } from "../app/components/CinematicPlayer";
import "../app/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CinematicPlayer />
  </StrictMode>,
);
