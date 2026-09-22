import { memo, useEffect, useRef } from "react";
import { drawThreatMarker } from "./bookPreviews/bookThreatDrawing.js";
import { drawFlashlightOverlay, FLASHLIGHT_PRESET } from "../utils/flashlight.js";

const predator = { label: "포식자", draw: (ctx) => drawThreatMarker(ctx, 16, 16, 32, 32) };
const flashlight = { label: "인공조명", circle: true, draw: (ctx) => drawFlashlightOverlay(
  ctx, { active: true, x: 16, y: 16 }, {
    ...FLASHLIGHT_PRESET, width: 32, height: 32, radiusPx: 15, bloomRadiusPx: 16,
    compositeOperation: "source-over", bloomAlpha: 0.4, dustAlpha: 0.35,
  },
) };

function LegendIcon({ entry }) {
  const ref = useRef(null);
  useEffect(() => {
    const ctx = ref.current.getContext("2d");
    const ratio = window.devicePixelRatio || 1;
    ref.current.width = ref.current.height = Math.round(32 * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.save();
    if (entry.circle) {
      ctx.beginPath();ctx.arc(16,16,14,0,Math.PI*2);ctx.clip();
    }
    if (entry.color) {
      ctx.fillStyle = `rgb(${entry.color.join(",")})`;
      ctx.fillRect(0,0,32,32);
    } else entry.draw(ctx);
    ctx.restore();
    if (entry.circle && entry.border !== false) {
      ctx.strokeStyle = "rgba(110,110,110,0.5)";ctx.lineWidth = 1;
      ctx.beginPath();ctx.arc(16,16,14,0,Math.PI*2);ctx.stroke();
    }
  }, [entry]);
  return <canvas ref={ref} width={32} height={32} className="sim-legend__icon" aria-hidden="true" />;
}

function SimLegend({ animalId, controls, ui }) {
  const entries = [...(ui.legendEntries?.(controls) ?? [])];
  if (["starling", "sardine", "spiny_lobster", "bat", "firefly", "krill"].includes(animalId)) {
    entries.unshift(predator);
  } else if (animalId === "bee") {
    entries.unshift({ ...predator, label: "말벌" });
  }
  if (["bat", "firefly"].includes(animalId)) entries.unshift(flashlight);
  if (!entries.length) return null;
  return <div className="sim-legend" role="list" aria-label="시뮬레이션 범례">
    {entries.map(entry => <div className="sim-legend__item" role="listitem" key={entry.label}>
      <LegendIcon entry={entry} /><span className="sim-legend__label">{entry.label}</span>
    </div>)}
  </div>;
}

export default memo(SimLegend);
