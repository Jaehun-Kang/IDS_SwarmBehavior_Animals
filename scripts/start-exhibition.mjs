import { access } from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { preview } from "vite";

const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
let server, child;
let stopping = false;
async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  if (child && child.exitCode === null) child.kill();
  if (server) {
    server.httpServer.closeAllConnections();
    await new Promise(resolve => server.httpServer.close(resolve));
  }
  process.exitCode = code;
}

try {
  const electron = require("electron");
  await access(electron);
  await access(fileURLToPath(new URL("../dist/index.html", import.meta.url)));
  server = await preview({
    root, preview: { host: "127.0.0.1", port: 0, open: false, strictPort: false },
  });
  const url = server.resolvedUrls?.local[0];
  if (!url) throw new Error("The preview server did not provide a local URL.");
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Server check failed: ${response.status}`);
  console.log(`Exhibition URL: ${url}`);
  if (process.argv.includes("--check")) {
    console.log(`Electron found: ${electron}`);
    console.log("Server ready. Window and keyboard checks are not included.");
    await stop();
  } else {
    const env = { ...process.env, SWARM_EXHIBITION_URL: url };
    delete env.ELECTRON_RUN_AS_NODE;
    child = spawn(electron, [fileURLToPath(new URL("./exhibition-main.cjs", import.meta.url))], {
      cwd: root, env, stdio: "inherit", windowsHide: true,
    });
    child.once("error", error => { console.error(error.message); void stop(1); });
    child.once("exit", code => { void stop(code ?? 0); });
    process.once("SIGINT", () => { void stop(); });
    process.once("SIGTERM", () => { void stop(); });
    console.log("Exit: Alt+F4 (Windows), Cmd+Q (Mac), or Ctrl/Cmd+Shift+Q. Launcher: Ctrl+C.");
  }
} catch (error) {
  console.error(error.message);
  await stop(1);
}
