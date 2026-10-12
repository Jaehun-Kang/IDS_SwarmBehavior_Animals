import { access, mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { join } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { preview } from "vite";

const root = fileURLToPath(new URL("../", import.meta.url));
const checkOnly = process.argv.includes("--check");

async function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    ...(process.platform === "darwin" ? [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      join(homedir(), "Applications/Google Chrome.app/Contents/MacOS/Google Chrome"),
    ] : []),
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
  throw new Error("Chrome was not found. Install Google Chrome or set CHROME_PATH to its executable.");
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
  const profileRoot = process.platform === "darwin"
    ? join(homedir(), "Library", "Application Support")
    : process.env.LOCALAPPDATA;
  if (!profileRoot) throw new Error("LOCALAPPDATA is required for the exhibition profile.");
  const profile = join(profileRoot, "SwarmBehavior-Animals", "Chrome-Kiosk");
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
    console.log(`Chrome kiosk launched. ${process.platform === "darwin" ? "Cmd+Q" : "Alt+F4"} closes the exhibition; Ctrl+C stops this launcher.`);
  }
} catch (error) {
  console.error(error.message);
  await stop(1);
}
