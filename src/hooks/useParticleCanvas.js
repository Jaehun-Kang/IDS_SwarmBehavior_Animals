import { useEffect, useRef } from "react";
import { getAnimalDetails } from "../behaviors/animalDetails";
import { Effect } from "../utils/ParticleEffect";

const measureTextWidth = (text, fontSize) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    return 0;
  }

  context.font = `bold ${fontSize}px Playfair`;
  return context.measureText(text).width;
};

const getTextLayout = (speciesId, fontSize, canvasWidth) => {
  const english = speciesId ? getAnimalDetails(speciesId)?.english : null;

  if (!speciesId || !english) {
    return {
      lines: [
        { text: "Swarm", offsetY: 0, fontSize },
        { text: "Behavior", offsetY: fontSize, fontSize },
      ],
      lineCount: 2,
    };
  }

  const englishLength = english.length;
  let adjustedFontSize = fontSize * 1.12;

  if (englishLength >= 22) {
    adjustedFontSize = fontSize * 0.68;
  } else if (englishLength >= 18) {
    adjustedFontSize = fontSize * 0.78;
  } else if (englishLength >= 14) {
    adjustedFontSize = fontSize * 0.9;
  }

  const maxWidth = canvasWidth * 0.72;
  const textWidth = measureTextWidth(english, adjustedFontSize);

  if (textWidth <= maxWidth || !english.includes(" ")) {
    return {
      lines: [
        {
          text: english,
          offsetY: fontSize * 0.56,
          fontSize: adjustedFontSize,
        },
      ],
      lineCount: 1,
    };
  }

  const words = english.split(" ");
  let bestSplitIndex = 1;
  let bestWidthScore = Number.POSITIVE_INFINITY;

  for (let splitIndex = 1; splitIndex < words.length; splitIndex += 1) {
    const firstLine = words.slice(0, splitIndex).join(" ");
    const secondLine = words.slice(splitIndex).join(" ");
    const firstWidth = measureTextWidth(firstLine, adjustedFontSize * 0.9);
    const secondWidth = measureTextWidth(secondLine, adjustedFontSize * 0.9);
    const widthScore = Math.max(firstWidth, secondWidth);

    if (widthScore < bestWidthScore) {
      bestWidthScore = widthScore;
      bestSplitIndex = splitIndex;
    }
  }

  const wrappedFontSize = adjustedFontSize * 0.9;
  return {
    lines: [
      {
        text: words.slice(0, bestSplitIndex).join(" "),
        offsetY: fontSize * 0.1,
        fontSize: wrappedFontSize,
      },
      {
        text: words.slice(bestSplitIndex).join(" "),
        offsetY: fontSize * 0.92,
        fontSize: wrappedFontSize,
      },
    ],
    lineCount: 2,
  };
};

export function useParticleCanvas(
  homeRef,
  fontsLoaded,
  hoveredIdRef,
  onTextStateChange,
) {
  const canvasRef = useRef(null);
  const effectRef = useRef(null);
  const currentTextKeyRef = useRef(null);
  const currentLineCountRef = useRef(2);

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
    canvas.style.backgroundColor = "transparent";
    homeRef.current.prepend(canvas);
    canvasRef.current = canvas;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const buildInitialTitle = () => {
      if (!effectRef.current) return;
      effectRef.current.particles = [];
      currentLineCountRef.current = 2;
      effectRef.current.wrapText("Swarm", 0);
      effectRef.current.wrapText("Behavior", effectRef.current.fontSize);
    };

    const applyText = (speciesId) => {
      if (!effectRef.current) return;
      const layout = getTextLayout(
        speciesId,
        effectRef.current.fontSize,
        canvas.width,
      );
      currentLineCountRef.current = layout.lineCount;
      effectRef.current.setText(layout.lines);
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (effectRef.current) {
        effectRef.current.setSize(canvas.width, canvas.height);
        if (currentTextKeyRef.current) {
          applyText(currentTextKeyRef.current);
        } else {
          buildInitialTitle();
        }
      }
    };
    window.addEventListener("resize", resizeCanvas);

    // 이전 effect 정리
    if (effectRef.current) effectRef.current.cleanup();

    const effect = new Effect(ctx, canvas.width, canvas.height);
    effectRef.current = effect;

    effect.setMouseListener();
    buildInitialTitle();

    let animationId;
    const animate = () => {
      if (!ctx || canvas.width === 0 || canvas.height === 0) return;
      const hoveredSpeciesId = hoveredIdRef?.current
        ? hoveredIdRef.current.replace(/-\d+$/, "")
        : null;
      effect.setMouseRepulsionEnabled(!hoveredSpeciesId);
      if (currentTextKeyRef.current !== hoveredSpeciesId) {
        currentTextKeyRef.current = hoveredSpeciesId;
        applyText(hoveredSpeciesId);
      }
      if (onTextStateChange) {
        onTextStateChange({
          speciesId: currentTextKeyRef.current,
          lineCount: currentLineCountRef.current,
          isSettled: effect.isTextReadyForSubtitle(7.5, 0.015),
        });
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
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
  }, [fontsLoaded, homeRef, hoveredIdRef, onTextStateChange]);
}
