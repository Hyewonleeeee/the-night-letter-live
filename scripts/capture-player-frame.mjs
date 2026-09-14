import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const timeSeconds = Number(process.argv[2]);
const outputArg = process.argv[3];
const captureWhilePlaying = process.argv.includes("--playing");
const reloadPage = process.argv.includes("--reload");
if (!Number.isFinite(timeSeconds) || !outputArg) {
  throw new Error("Usage: node scripts/capture-player-frame.mjs <timeSeconds> <output.png>");
}
const output = resolve(outputArg);

const debugPort = process.env.CHROME_DEBUG_PORT ?? "9223";
const targets = await fetch(`http://127.0.0.1:${debugPort}/json`).then((response) => response.json());
const page = targets.find((target) => target.type === "page" && target.url.includes("/player"));
if (!page) throw new Error(`No /player page is available on Chrome port ${debugPort}.`);

const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolveOpen, reject) => {
  socket.addEventListener("open", resolveOpen, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let requestId = 0;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const message = JSON.parse(String(event.data));
  const callback = pending.get(message.id);
  if (callback) {
    pending.delete(message.id);
    if (message.error) callback.reject(new Error(message.error.message));
    else callback.resolve(message.result);
  }
});

const send = (method, params = {}) => new Promise((resolveSend, reject) => {
  const id = ++requestId;
  pending.set(id, { resolve: resolveSend, reject });
  socket.send(JSON.stringify({ id, method, params }));
});

await send("Emulation.setDeviceMetricsOverride", {
  width: 1600,
  height: 1000,
  deviceScaleFactor: 1,
  mobile: false,
});
if (reloadPage) {
  await send("Page.reload", { ignoreCache: true });
  await new Promise((resolveWait) => setTimeout(resolveWait, 1800));
}
await send("Runtime.evaluate", {
  expression: `(() => {
    const slider = document.querySelector('input[aria-label="재생 위치"]');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(slider, '${timeSeconds}');
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    slider.dispatchEvent(new Event('change', { bubbles: true }));
  })()`,
});
await new Promise((resolveWait) => setTimeout(resolveWait, 900));
await send("Runtime.evaluate", {
  expression: `new Promise((resolve) => {
    const video = document.querySelector('.chapter-motion-video');
    if (!video || (!video.seeking && video.readyState >= 2)) return resolve();
    const done = () => resolve();
    video.addEventListener('seeked', done, { once: true });
    setTimeout(done, 4000);
  })`,
  awaitPromise: true,
});
if (captureWhilePlaying) {
  await send("Runtime.evaluate", {
    expression: `document.querySelector('button[aria-label="재생"]')?.click()`,
  });
  await new Promise((resolveWait) => setTimeout(resolveWait, 3200));
}

const boxResult = await send("Runtime.evaluate", {
  expression: `(() => {
    const box = document.querySelector('.player-viewport').getBoundingClientRect();
    return { x: box.x, y: box.y, width: box.width, height: box.height };
  })()`,
  returnByValue: true,
});
const box = boxResult.result.value;
const mediaResult = await send("Runtime.evaluate", {
  expression: `(() => {
    const video = document.querySelector('.chapter-motion-video');
    return video ? { src: video.getAttribute('src'), currentSrc: video.currentSrc, currentTime: video.currentTime, duration: video.duration, readyState: video.readyState } : null;
  })()`,
  returnByValue: true,
});
const capture = await send("Page.captureScreenshot", {
  format: "png",
  fromSurface: true,
  clip: { ...box, scale: 1 },
});
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, Buffer.from(capture.data, "base64"));
if (captureWhilePlaying) {
  await send("Runtime.evaluate", {
    expression: `document.querySelector('button[aria-label="일시정지"]')?.click()`,
  });
}
socket.close();
console.log(`${timeSeconds}s → ${output} ${JSON.stringify(mediaResult.result.value)}`);
