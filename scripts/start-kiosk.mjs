import { access, mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { preview } from "vite";

const root = fileURLToPath(new URL("../", import.meta.url));
const checkOnly = process.argv.includes("--check");

async function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    ...[process.env.PROGRAMFILES, process.env["PROGRAMFILES(X86)"], process.env.LOCALAPPDATA]
      .filter(Boolean)
      .map(base => join(base, "Google", "Chrome", "Application", "chrome.exe")),
  ].filter(Boolean);
  for (const path of candidates) {
    try {
      await access(path);
      return path;
    } catch { /* Try the next Chrome installation. */ }
  }
  throw new Error("Chrome was not found. Install Chrome or set CHROME_PATH to chrome.exe.");
}

let server;
let browser;
let stopping = false;
async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  if (browser && browser.exitCode === null) browser.kill();
  if (server) await new Promise(resolve => server.httpServer.close(resolve));
  process.exitCode = code;
}

try {
  const chrome = await findChrome();
  if (!process.env.LOCALAPPDATA) throw new Error("LOCALAPPDATA is required for the exhibition profile.");
  const profile = join(process.env.LOCALAPPDATA, "SwarmBehavior-Animals", "Chrome-Kiosk");
  server = await preview({
    root,
    preview: { host: "127.0.0.1", open: false, strictPort: false },
  });
  const url = server.resolvedUrls?.local[0];
  if (!url) throw new Error("The preview server did not provide a local URL.");
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Preview readiness check failed: ${response.status}`);
  console.log(`Exhibition URL: ${url}`);
  if (checkOnly) {
    console.log(`Chrome found: ${chrome}`);
    console.log("Server ready. Check completed without opening Chrome.");
    await stop();
  } else {
    await mkdir(profile, { recursive: true });
    browser = spawn(chrome, [
      `--user-data-dir=${profile}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--enable-features=CanvasDrawElement",
      "--kiosk",
      url,
    ], { stdio: "ignore" });
    browser.once("error", error => {
      console.error(error.message);
      void stop(1);
    });
    browser.once("exit", () => { void stop(); });
    process.once("SIGINT", () => { void stop(); });
    process.once("SIGTERM", () => { void stop(); });
    console.log("Chrome kiosk launched. Alt+F4 closes the exhibition; Ctrl+C stops this launcher.");
  }
} catch (error) {
  console.error(error.message);
  await stop(1);
}
