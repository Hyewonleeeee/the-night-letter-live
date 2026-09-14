import { writeFileSync } from "node:fs";

const endpoint = "http://127.0.0.1:9222/json";
const pages = await fetch(endpoint).then((response) => response.json());
const page = pages.find((entry) => entry.type === "page" && entry.url.includes("localhost:3000/player"));
if (!page) throw new Error("Open http://localhost:3000/player in the debug Chrome session first.");

const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let messageId = 0;
const pending = new Map();
const browserErrors = [];

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  }
  if (message.method === "Runtime.exceptionThrown") {
    browserErrors.push({
      type: "runtime",
      text: message.params.exceptionDetails.text,
      url: message.params.exceptionDetails.url ?? null,
    });
  }
  if (message.method === "Log.entryAdded" && message.params.entry.level === "error") {
    browserErrors.push({
      type: "log",
      text: message.params.entry.text,
      url: message.params.entry.url ?? null,
    });
  }
});

function send(method, params = {}) {
  const id = ++messageId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const evaluate = async (expression) => {
  const result = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
};

await send("Runtime.enable");
await send("Log.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});
await send("Page.reload", { ignoreCache: true });
await delay(1800);

async function seek(timeSeconds) {
  return evaluate(`(() => {
    const slider = document.querySelector('input[aria-label="재생 위치"]');
    if (!slider) return { error: "timeline slider missing" };
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(slider, "${timeSeconds}");
    slider.dispatchEvent(new Event("input", { bubbles: true }));
    slider.dispatchEvent(new Event("change", { bubbles: true }));
    return { value: slider.value };
  })()`);
}

async function state() {
  return evaluate(`(() => {
    const video = document.querySelector(".chapter-motion-video");
    const clock = document.querySelector(".time-display strong")?.textContent ?? "";
    return {
      clock,
      videoPresent: Boolean(video),
      videoTime: video ? video.currentTime : null,
      videoPaused: video ? video.paused : null,
      videoReadyState: video ? video.readyState : null,
      source: video ? video.currentSrc : null,
    };
  })()`);
}

const checks = [];
for (const [index, absoluteTime] of [336.5, 352, 373, 405, 455, 478, 496].entries()) {
  await seek(absoluteTime);
  await delay(520);
  const frameState = await state();
  const screenshot = await send("Page.captureScreenshot", { format: "png", fromSurface: true });
  const screenshotPath = `/private/tmp/chapter-3-browser-${index + 1}.png`;
  writeFileSync(screenshotPath, Buffer.from(screenshot.data, "base64"));
  checks.push({ absoluteTime, expectedClipTime: absoluteTime - 336, screenshotPath, ...frameState });
}

await seek(336.5);
await delay(300);
await evaluate(`document.querySelector('button[aria-label="재생"]')?.click()`);
const playbackBefore = await state();
await delay(2600);
const playbackAfter = await state();
await evaluate(`document.querySelector('button[aria-label="일시정지"]')?.click()`);

const resource = await evaluate(`(() => {
  const entry = performance.getEntriesByType("resource")
    .find((item) => item.name.includes("the-shadow-motion-pass.mp4"));
  return entry ? { name: entry.name, duration: entry.duration, transferSize: entry.transferSize } : null;
})()`);

const seekFailures = checks.filter((check) =>
  !check.videoPresent || Math.abs(check.videoTime - check.expectedClipTime) > 0.18,
);
const playbackAdvance = playbackAfter.videoTime - playbackBefore.videoTime;
const report = {
  checks,
  playback: { before: playbackBefore, after: playbackAfter, advanceSeconds: playbackAdvance },
  resource,
  browserErrors,
};

console.log(JSON.stringify(report, null, 2));
socket.close();

if (seekFailures.length > 0) {
  throw new Error(`Chapter video seek synchronization failed at ${seekFailures.length} checkpoints.`);
}
if (playbackAdvance < 2.1) {
  throw new Error(`Chapter video advanced only ${playbackAdvance.toFixed(2)}s during playback.`);
}
if (!resource) throw new Error("Chapter video resource was not requested by the browser.");
if (browserErrors.length > 0) throw new Error("Browser reported runtime errors.");
