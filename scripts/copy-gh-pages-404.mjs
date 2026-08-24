import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const distDir = "dist";
const indexPath = join(distDir, "index.html");
const fallbackPath = join(distDir, "404.html");

if (!existsSync(indexPath)) {
  throw new Error("dist/index.html not found. Run vite build first.");
}

copyFileSync(indexPath, fallbackPath);
