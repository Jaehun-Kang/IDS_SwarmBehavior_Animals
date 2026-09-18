import { useEffect, useRef } from "react";
import { drawThreatMarker } from "./bookPreviews/bookThreatDrawing.js";

export default function ThreatPointerOverlay({ enabled, containerRef }) {
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
    drawThreatMarker(ctx,13,13,26,26);
    const hide = () => { canvas.style.display = 'none'; };
    const move = event => {
      if (!(event.target instanceof Element) || event.target.closest('button,input,select,.sim-control-panel')) { hide(); return; }
      canvas.style.display = 'block';
      canvas.style.transform = `translate(${event.clientX-13}px,${event.clientY-13}px)`;
    };
    container.addEventListener('pointermove',move);
    container.addEventListener('pointerleave',hide);
    container.addEventListener('pointercancel',hide);
    return () => {
      hide();container.removeEventListener('pointermove',move);
      container.removeEventListener('pointerleave',hide);container.removeEventListener('pointercancel',hide);
    };
  }, [enabled, containerRef]);
  return enabled ? <canvas ref={ref} aria-hidden="true" /> : null;
}
