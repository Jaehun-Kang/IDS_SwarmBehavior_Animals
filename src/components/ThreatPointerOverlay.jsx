import { useEffect, useRef } from "react";
import { drawThreatMarker } from "./bookPreviews/bookThreatDrawing.js";
import { renderFlowerHead, FLOWER_HEAD_RADIUS } from "../utils/beeFlower.js";

export default function ThreatPointerOverlay({ enabled, containerRef, marker = "threat" }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current, container = containerRef.current;
    if (!canvas || !container || !enabled) return;
    // Viewport coordinates keep the overlay aligned with the interaction canvas.
    Object.assign(canvas.style, { position: 'fixed', width: '26px', height: '26px',
      pointerEvents: 'none', zIndex: '5', display: 'none', left: '0', top: '0' });
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.height = Math.round(26 * ratio);
    const ctx = canvas.getContext('2d');ctx.scale(ratio, ratio);
    if (marker === "flower") {
      ctx.save();
      ctx.translate(13, 13);
      ctx.scale(12 / FLOWER_HEAD_RADIUS, 12 / FLOWER_HEAD_RADIUS);
      renderFlowerHead(ctx, 0, 0);
      ctx.restore();
    } else if (marker !== "external") {
      drawThreatMarker(ctx,13,13,26,26);
    }
    let pointerTarget = null;
    const hide = () => {
      canvas.style.display = 'none';
      pointerTarget?.classList.remove('sim-graphic-pointer-target');
      pointerTarget = null;
    };
    const move = event => {
      // UI clicks are proxied to the simulation canvas, not to the visual pointer.
      if (!event.isTrusted) return;
      if (!(event.target instanceof Element) || !container.contains(event.target) || event.target.closest('button,input,select,.sim-control-panel')) { hide(); return; }
      if (pointerTarget !== event.target) {
        pointerTarget?.classList.remove('sim-graphic-pointer-target');
        pointerTarget = event.target;
        pointerTarget.classList.add('sim-graphic-pointer-target');
      }
      canvas.style.display = 'block';
      canvas.style.transform = `translate(${event.clientX-13}px,${event.clientY-13}px)`;
    };
    window.addEventListener('pointermove',move);
    window.addEventListener('blur',hide);
    container.addEventListener('pointerleave',hide);
    container.addEventListener('pointercancel',hide);
    return () => {
      hide();window.removeEventListener('pointermove',move);
      window.removeEventListener('blur',hide);
      container.removeEventListener('pointerleave',hide);container.removeEventListener('pointercancel',hide);
    };
  }, [enabled, containerRef, marker]);
  return enabled ? <canvas ref={ref} data-pointer-marker={marker} aria-hidden="true" /> : null;
}
