const DEFAULT_THEME_BACKGROUND_HEX = "#faf8f5";
const DEFAULT_THEME_BACKGROUND_RGB = [250, 248, 245];

function readCssVariable(name) {
  if (typeof window === "undefined") {
    return "";
  }

  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

export function getThemeBackgroundHex() {
  return readCssVariable("--theme-bg-hex") || DEFAULT_THEME_BACKGROUND_HEX;
}

export function getThemeBackgroundRgb() {
  const rawValue = readCssVariable("--theme-bg-rgb");

  if (!rawValue) {
    return DEFAULT_THEME_BACKGROUND_RGB;
  }

  const parsed = rawValue
    .split(/\s+/)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

  return parsed.length === 3 ? parsed : DEFAULT_THEME_BACKGROUND_RGB;
}
