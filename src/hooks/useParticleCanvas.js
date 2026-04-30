import { useEffect, useRef } from "react";
import { Effect } from "../utils/ParticleEffect";

export function useParticleCanvas(homeRef, fontsLoaded) {
  const canvasRef = useRef(null);
  const effectRef = useRef(null);

  useEffect(() => {
    if (!fontsLoaded || !homeRef.current) return;

    // 이전 canvas 제거
    const oldCanvas = canvasRef.current;
    if (oldCanvas) {
      oldCanvas.remove();
      canvasRef.current = null;
    }

    // 새로운 canvas 생성
    const canvas = document.createElement("canvas");
    canvas.style.display = "block";
    homeRef.current.prepend(canvas);
    canvasRef.current = canvas;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resizeCanvas);

    // 이전 effect 정리
    if (effectRef.current) effectRef.current.cleanup();

    const effect = new Effect(ctx, canvas.width, canvas.height);
    effectRef.current = effect;

    effect.setMouseListener();
    effect.wrapText("Swarm", 0);
    effect.wrapText("Behavior", effect.fontSize);

    let animationId;
    const animate = () => {
      if (!ctx || canvas.width === 0 || canvas.height === 0) return;
      ctx.fillStyle = "oklch(0.9909 0.0123 91.51)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      effect.render();
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      effect.cleanup();
      effectRef.current = null;
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [fontsLoaded, homeRef]);
}
