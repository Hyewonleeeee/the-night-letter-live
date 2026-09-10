"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  LIVE_VISUAL_CHANNEL,
  LIVE_VISUAL_DEFAULT_DURATIONS,
  LIVE_VISUAL_DEFAULTS,
  applyLiveVisualOperations,
  isLiveVisualHelloMessage,
  isLiveVisualRunMessage,
  type LiveVisualAckMessage,
  type LiveVisualStateMessage,
} from "../lib/liveCoding";

type LiveVisualStageProps = {
  children: ReactNode;
};

type LiveVisualState = ReturnType<typeof applyLiveVisualOperations>;

const INITIAL_STATE: LiveVisualState = {
  values: { ...LIVE_VISUAL_DEFAULTS },
  durations: { ...LIVE_VISUAL_DEFAULT_DURATIONS },
};

export function LiveVisualStage({ children }: LiveVisualStageProps) {
  const [liveState, setLiveState] = useState<LiveVisualState>(INITIAL_STATE);
  const stateRef = useRef(liveState);

  useEffect(() => {
    if (!("BroadcastChannel" in window)) return;

    const channel = new BroadcastChannel(LIVE_VISUAL_CHANNEL);
    const postState = (reason: LiveVisualStateMessage["reason"]) => {
      const message: LiveVisualStateMessage = {
        kind: "live-visual:state",
        version: 1,
        at: Date.now(),
        reason,
        values: stateRef.current.values,
      };
      channel.postMessage(message);
    };

    channel.onmessage = (event: MessageEvent<unknown>) => {
      const message = event.data;
      if (isLiveVisualHelloMessage(message)) {
        postState("hello");
        return;
      }
      if (!isLiveVisualRunMessage(message)) return;

      setLiveState((current) => {
        const next = applyLiveVisualOperations(
          current.values,
          current.durations,
          message.operations,
        );
        stateRef.current = next;
        const acknowledgement: LiveVisualAckMessage = {
          kind: "live-visual:ack",
          version: 1,
          at: Date.now(),
          runId: message.id,
          values: next.values,
        };
        channel.postMessage(acknowledgement);
        return next;
      });
    };

    postState("ready");
    const heartbeat = window.setInterval(() => postState("heartbeat"), 1_000);
    return () => {
      window.clearInterval(heartbeat);
      channel.close();
    };
  }, []);

  const { values, durations } = liveState;
  const pictureStyle = {
    "--live-camera-scale": 1 + values.cameraPush,
    "--live-camera-duration": `${durations.cameraPush}s`,
  } as CSSProperties;
  const fogStyle = {
    "--live-fog-opacity": values.fogOpacity,
    "--live-fog-duration": `${durations.fogOpacity}s`,
  } as CSSProperties;
  const windStyle = {
    "--live-wind-shift": `${values.windAmount * 7.5}%`,
    "--live-wind-duration": `${durations.windAmount}s`,
    "--live-wind-cycle": `${Math.max(18, 38 - values.windAmount * 16)}s`,
  } as CSSProperties;
  const coolStyle = {
    opacity: values.coolAmount,
    transitionDuration: `${durations.coolAmount}s`,
  } as CSSProperties;
  const grainStyle = {
    opacity: values.grainAmount,
    transitionDuration: `${durations.grainAmount}s`,
  } as CSSProperties;

  return (
    <>
      <div className="live-picture-layer" style={pictureStyle} data-live-visual-stage>
        {children}
      </div>
      <div className="live-fog-layer" style={fogStyle} aria-hidden="true">
        <div className="live-fog-drift" style={windStyle}>
          <i className="live-fog-bank is-low" />
          <i className="live-fog-bank is-mid" />
          <i className="live-fog-bank is-far" />
        </div>
      </div>
      <div className="live-cool-layer" style={coolStyle} aria-hidden="true" />
      <div className="live-grain-layer" style={grainStyle} aria-hidden="true" />
    </>
  );
}
