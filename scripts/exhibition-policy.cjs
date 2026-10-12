function exhibitionKeyAction(input, platform = process.platform) {
  const key = String(input.code || input.key || "").toLowerCase().replace(/^key/, "");
  const command = input.control || input.meta;
  if ((platform === "darwin" && input.meta && key === "q") ||
      (platform === "win32" && input.alt && key === "f4") ||
      (command && input.shift && key === "q")) return "quit";
  if (["f5", "f12", "browserrefresh", "f11"].includes(key)) return "block";
  if (command && key === "r") return "block";
  if (command && (input.shift || input.alt) && ["i", "j", "c"].includes(key)) return "block";
  return "allow";
}

function isExhibitionUrl(candidate, startUrl) {
  try {
    const url = new URL(candidate);
    const start = new URL(startUrl);
    return url.origin === start.origin && url.pathname.startsWith(start.pathname);
  } catch { return false; }
}

module.exports = { exhibitionKeyAction, isExhibitionUrl };
