import { useEffect, useRef } from "react";
import { computeTextZIndex } from "../behaviors/animalData";
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

const measureTextBox = (text, fontSize, centerX, centerY) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    return {
      left: centerX,
      right: centerX,
      top: centerY,
      bottom: centerY,
    };
  }

  context.font = `bold ${fontSize}px Playfair`;
  const metrics = context.measureText(text);
  const ascent = metrics.actualBoundingBoxAscent || fontSize * 0.72;
  const descent = metrics.actualBoundingBoxDescent || fontSize * 0.22;
  const width = metrics.width;

  return {
    left: centerX - width / 2,
    right: centerX + width / 2,
    top: centerY - ascent,
    bottom: centerY + descent,
  };
};

const getLayoutBounds = (lines, centerX, centerY) => {
  if (!lines.length) {
    return null;
  }

  const boxes = lines.map(({ text, offsetY = 0, fontSize }) =>
    measureTextBox(text, fontSize, centerX, centerY + offsetY),
  );

  return {
    left: Math.min(...boxes.map((box) => box.left)),
    right: Math.max(...boxes.map((box) => box.right)),
    top: Math.min(...boxes.map((box) => box.top)),
    bottom: Math.max(...boxes.map((box) => box.bottom)),
  };
};

const getParticleBounds = (effect) => {
  if (!effect?.particles?.length) {
    return null;
  }

  const size = (effect.gap || 0) * 0.5;
  return {
    left: Math.min(...effect.particles.map((particle) => particle.originX)),
    right:
      Math.max(...effect.particles.map((particle) => particle.originX)) + size,
    top: Math.min(...effect.particles.map((particle) => particle.originY)),
    bottom:
      Math.max(...effect.particles.map((particle) => particle.originY)) + size,
  };
};

const mergeBounds = (...boxes) => {
  const validBoxes = boxes.filter(Boolean);
  if (!validBoxes.length) {
    return null;
  }

  return {
    left: Math.min(...validBoxes.map((box) => box.left)),
    right: Math.max(...validBoxes.map((box) => box.right)),
    top: Math.min(...validBoxes.map((box) => box.top)),
    bottom: Math.max(...validBoxes.map((box) => box.bottom)),
  };
};

const getTitleBounds = (effect, layoutBounds) => {
  return mergeBounds(getParticleBounds(effect), layoutBounds);
};

const getSubtitleBounds = (homeRef, subtitleRef) => {
  const homeEl = homeRef?.current;
  const subtitleEl = subtitleRef?.current;
  if (!homeEl || !subtitleEl) {
    return null;
  }

  const subtitleText = subtitleEl.textContent?.trim();
  if (!subtitleText) {
    return null;
  }

  const styles = window.getComputedStyle(subtitleEl);
  if (
    styles.display === "none" ||
    styles.visibility === "hidden" ||
    Number.parseFloat(styles.opacity || "0") <= 0.01
  ) {
    return null;
  }

  const homeRect = homeEl.getBoundingClientRect();
  const subtitleRect = subtitleEl.getBoundingClientRect();
  return {
    left: subtitleRect.left - homeRect.left,
    right: subtitleRect.right - homeRect.left,
    top: subtitleRect.top - homeRect.top,
    bottom: subtitleRect.bottom - homeRect.top,
  };
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
  obstacleBoxRef,
  subtitleRef,
) {
  const canvasRef = useRef(null);
  const effectRef = useRef(null);
  const currentTextKeyRef = useRef(null);
  const currentLineCountRef = useRef(2);
  const currentObstacleBoxRef = useRef(null);
  const currentTitleBoundsRef = useRef(null);
  const subtitleUnlockAtRef = useRef(0);

  const syncTextLayerZIndex = (canvas, obstacleBox, onTextStateChange) => {
    if (!canvas || !onTextStateChange) {
      return;
    }

    const centerY = obstacleBox
      ? (obstacleBox.top + obstacleBox.bottom) / 2
      : canvas.height / 2;
    const zIndex = computeTextZIndex(centerY);
    canvas.style.zIndex = String(zIndex);
    onTextStateChange((prevState) => {
      if (prevState.textZIndex === zIndex) {
        return prevState;
      }

      return {
        ...prevState,
        textZIndex: zIndex,
      };
    });
  };

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
      const layout = getTextLayout(
        null,
        effectRef.current.fontSize,
        canvas.width,
      );
      effectRef.current.particles = [];
      currentLineCountRef.current = layout.lineCount;
      effectRef.current.wrapText("Swarm", 0);
      effectRef.current.wrapText("Behavior", effectRef.current.fontSize);
      currentTitleBoundsRef.current = getTitleBounds(
        effectRef.current,
        getLayoutBounds(
          layout.lines,
          effectRef.current.textX,
          effectRef.current.textY,
        ),
      );
      currentObstacleBoxRef.current = mergeBounds(
        currentTitleBoundsRef.current,
        getSubtitleBounds(homeRef, subtitleRef),
      );
    };

    const applyText = (speciesId) => {
      if (!effectRef.current) return;
      const layout = getTextLayout(
        speciesId,
        effectRef.current.fontSize,
        canvas.width,
      );
      currentLineCountRef.current = layout.lineCount;
      subtitleUnlockAtRef.current = performance.now() + 140;
      effectRef.current.setText(layout.lines);
      currentTitleBoundsRef.current = getTitleBounds(
        effectRef.current,
        getLayoutBounds(
          layout.lines,
          effectRef.current.textX,
          effectRef.current.textY,
        ),
      );
      currentObstacleBoxRef.current = mergeBounds(
        currentTitleBoundsRef.current,
        getSubtitleBounds(homeRef, subtitleRef),
      );
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
      currentTitleBoundsRef.current = getTitleBounds(
        effect,
        currentTitleBoundsRef.current,
      );
      currentObstacleBoxRef.current = mergeBounds(
        currentTitleBoundsRef.current,
        getSubtitleBounds(homeRef, subtitleRef),
      );
      syncTextLayerZIndex(
        canvas,
        currentObstacleBoxRef.current,
        onTextStateChange,
      );
      if (obstacleBoxRef) {
        obstacleBoxRef.current = hoveredSpeciesId
          ? currentObstacleBoxRef.current
          : null;
      }
      if (onTextStateChange) {
        const canShowSubtitle =
          performance.now() >= subtitleUnlockAtRef.current;
        onTextStateChange((prevState) => ({
          ...prevState,
          speciesId: currentTextKeyRef.current,
          lineCount: currentLineCountRef.current,
          titleBottomY:
            currentTitleBoundsRef.current?.bottom ?? prevState.titleBottomY,
          isSettled:
            canShowSubtitle && effect.isTextReadyForSubtitle(7.5, 0.015),
        }));
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
      currentObstacleBoxRef.current = null;
      currentTitleBoundsRef.current = null;
      if (obstacleBoxRef) {
        obstacleBoxRef.current = null;
      }
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [
    fontsLoaded,
    homeRef,
    hoveredIdRef,
    onTextStateChange,
    obstacleBoxRef,
    subtitleRef,
  ]);
}
