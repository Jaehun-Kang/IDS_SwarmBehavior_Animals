import { useEffect, useRef, useState } from "react";
import { computeTextZIndex } from "../behaviors/animalData";
import { animals } from "../behaviors/animalData";
import { getAnimalDetails } from "../behaviors/animalDetails";
import { useParticleCanvas } from "../hooks/useParticleCanvas";
import { useAnimals } from "../hooks/useAnimals";
import SpriteAtlas from "../components/SpriteAtlas.jsx";
import { HOME_SPRITE_ATLASES } from "../data/spriteAtlases";
import "../styles/Home.css";

const HOME_ANIMALS = animals.flatMap((animal) =>
  Array.from({ length: 10 }, (_, index) => ({
    ...animal,
    speciesId: animal.id,
    instanceId: `${animal.id}-${index + 1}`,
    instanceIndex: index,
  })),
);

const DEFAULT_SUBTITLE_KEY = "__default__";
const HOME_IDLE_HINT_DELAY_MS = 10000;
const HOME_HOVER_CLEAR_DELAY_MS = 20000;

const idleHintStyle = {
  position: "absolute",
  left: "50%",
  bottom: "2.5rem",
  zIndex: 1000002,
  padding: "0.75rem 1.25rem",
  border: "0.0625rem solid var(--theme-border)",
  borderRadius: "999px",
  background: "var(--theme-panel-strong)",
  boxShadow: "var(--theme-shadow)",
  color: "var(--theme-text-strong)",
  fontFamily: "var(--theme-ui-font)",
  fontSize: "clamp(0.95rem, 1.2vw, 1.05rem)",
  fontWeight: 600,
  letterSpacing: "0.02em",
  pointerEvents: "none",
  userSelect: "none",
  whiteSpace: "nowrap",
  backdropFilter: "blur(1rem)",
  transition: "opacity 260ms ease, transform 320ms ease",
};

function renderSprite(speciesId) {
  const atlas = HOME_SPRITE_ATLASES[speciesId];
  if (atlas) {
    return (
      <SpriteAtlas
        atlas={atlas}
        baseClassName={atlas.baseClassName}
        observeClassNameStages
      />
    );
  }

  return null;
}

function Home(props) {
  const homeRef = useRef(null);
  const particleObstacleBoxRef = useRef(null);
  const subtitleRef = useRef(null);
  const hoverIdleTimeoutRef = useRef(null);
  const isHoverFocusLockedRef = useRef(false);
  const pointerPositionRef = useRef({ x: 0, y: 0, hasPosition: false });
  const isPointerInsideHomeRef = useRef(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [committedSubtitleSpeciesId, setCommittedSubtitleSpeciesId] =
    useState(null);
  const [committedTitleBottomY, setCommittedTitleBottomY] = useState(0);
  const [isIdleHintVisible, setIsIdleHintVisible] = useState(false);
  const [particleTextState, setParticleTextState] = useState({
    speciesId: null,
    lineCount: 2,
    isSettled: false,
    textZIndex: computeTextZIndex(0),
    titleBottomY: 0,
  });

  // 폰트 로드 대기
  useEffect(() => {
    const loadFonts = async () => {
      try {
        const fontLoadPromise = document.fonts.load('700 16px "Playfair"');
        const timeoutPromise = new Promise((resolve) =>
          setTimeout(resolve, 5000),
        );
        await Promise.race([fontLoadPromise, timeoutPromise]);
        setFontsLoaded(true);
      } catch {
        setFontsLoaded(true);
      }
    };

    const initialDelay = setTimeout(() => loadFonts(), 100);
    return () => clearTimeout(initialDelay);
  }, []);

  const { animalsLoaded, hoveredIdRef } = useAnimals(
    homeRef,
    fontsLoaded,
    props.savedPosition,
    particleObstacleBoxRef,
  );
  useParticleCanvas(
    homeRef,
    fontsLoaded,
    hoveredIdRef,
    setParticleTextState,
    particleObstacleBoxRef,
    subtitleRef,
  );

  const clearHoverIdleTimeout = () => {
    if (hoverIdleTimeoutRef.current) {
      window.clearTimeout(hoverIdleTimeoutRef.current);
      hoverIdleTimeoutRef.current = null;
    }
  };

  const scheduleHoverIdleClear = () => {
    clearHoverIdleTimeout();

    if (!hoveredIdRef.current) {
      return;
    }

    hoverIdleTimeoutRef.current = window.setTimeout(() => {
      hoveredIdRef.current = null;
      isHoverFocusLockedRef.current = true;
      hoverIdleTimeoutRef.current = null;
    }, HOME_HOVER_CLEAR_DELAY_MS);
  };

  const focusHoveredAnimal = (instanceId) => {
    if (!instanceId) {
      return;
    }

    hoveredIdRef.current = instanceId;
    isHoverFocusLockedRef.current = false;
    scheduleHoverIdleClear();
  };

  const clearHoveredAnimal = () => {
    hoveredIdRef.current = null;
    clearHoverIdleTimeout();
  };

  const updatePointerState = (pointX, pointY) => {
    pointerPositionRef.current = {
      x: pointX,
      y: pointY,
      hasPosition: true,
    };

    const homeRect = homeRef.current?.getBoundingClientRect();
    isPointerInsideHomeRef.current =
      !!homeRect &&
      pointX >= homeRect.left &&
      pointX <= homeRect.right &&
      pointY >= homeRect.top &&
      pointY <= homeRect.bottom;
  };

  useEffect(() => {
    let timeoutId;

    const hideHint = () => {
      setIsIdleHintVisible(false);
    };

    const scheduleHint = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setIsIdleHintVisible(true);
      }, HOME_IDLE_HINT_DELAY_MS);
    };

    const handlePointerMove = () => {
      hideHint();
      scheduleHint();
    };

    const handleEngagement = () => {
      hideHint();
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("pointerdown", handleEngagement, {
      passive: true,
    });
    window.addEventListener("touchstart", handleEngagement, {
      passive: true,
    });
    window.addEventListener("keydown", handleEngagement);

    scheduleHint();

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handleEngagement);
      window.removeEventListener("touchstart", handleEngagement);
      window.removeEventListener("keydown", handleEngagement);
    };
  }, []);

  useEffect(() => {
    const handleActivity = () => {
      isHoverFocusLockedRef.current = false;

      if (!hoveredIdRef.current) {
        clearHoverIdleTimeout();
        return;
      }

      scheduleHoverIdleClear();
    };

    window.addEventListener("pointermove", handleActivity, {
      passive: true,
    });
    window.addEventListener("pointerdown", handleActivity, {
      passive: true,
    });
    window.addEventListener("wheel", handleActivity, {
      passive: true,
    });
    window.addEventListener("touchstart", handleActivity, {
      passive: true,
    });
    window.addEventListener("keydown", handleActivity);

    return () => {
      clearHoverIdleTimeout();
      window.removeEventListener("pointermove", handleActivity);
      window.removeEventListener("pointerdown", handleActivity);
      window.removeEventListener("wheel", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      window.removeEventListener("keydown", handleActivity);
    };
  }, [hoveredIdRef]);

  useEffect(() => {
    const syncHoveredAnimalFromPointer = () => {
      if (!homeRef.current || isHoverFocusLockedRef.current) {
        if (isHoverFocusLockedRef.current && hoveredIdRef.current) {
          clearHoveredAnimal();
        }

        frameId = requestAnimationFrame(syncHoveredAnimalFromPointer);
        return;
      }

      const pointerState = pointerPositionRef.current;

      if (!pointerState.hasPosition || !isPointerInsideHomeRef.current) {
        if (hoveredIdRef.current) {
          clearHoveredAnimal();
        }

        frameId = requestAnimationFrame(syncHoveredAnimalFromPointer);
        return;
      }

      const hoveredElement = document
        .elementFromPoint(pointerState.x, pointerState.y)
        ?.closest(".creature");
      const nextHoveredId = hoveredElement?.id ?? null;

      if (!nextHoveredId) {
        if (hoveredIdRef.current) {
          clearHoveredAnimal();
        }
      } else if (hoveredIdRef.current !== nextHoveredId) {
        focusHoveredAnimal(nextHoveredId);
      }

      frameId = requestAnimationFrame(syncHoveredAnimalFromPointer);
    };

    let frameId = requestAnimationFrame(syncHoveredAnimalFromPointer);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [hoveredIdRef]);

  useEffect(() => {
    const handlePointerMove = (event) => {
      updatePointerState(event.clientX, event.clientY);
    };

    const handlePointerDown = (event) => {
      updatePointerState(event.clientX, event.clientY);
    };

    const handleTouchStart = (event) => {
      const firstTouch = event.touches[0];
      if (!firstTouch) {
        return;
      }

      updatePointerState(firstTouch.clientX, firstTouch.clientY);
    };

    const handlePointerLeaveWindow = () => {
      isPointerInsideHomeRef.current = false;
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("pointerdown", handlePointerDown, {
      passive: true,
    });
    window.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    window.addEventListener("blur", handlePointerLeaveWindow);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("blur", handlePointerLeaveWindow);
    };
  }, []);

  useEffect(() => {
    let frameId;

    if (particleTextState.isSettled) {
      const nextSpeciesId = particleTextState.speciesId ?? DEFAULT_SUBTITLE_KEY;
      const nextTitleBottomY = particleTextState.titleBottomY;
      frameId = requestAnimationFrame(() => {
        setCommittedSubtitleSpeciesId(nextSpeciesId);
        setCommittedTitleBottomY(nextTitleBottomY);
      });
    }

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [
    particleTextState.isSettled,
    particleTextState.speciesId,
    particleTextState.titleBottomY,
  ]);

  const currentSubtitleKey =
    particleTextState.speciesId ?? DEFAULT_SUBTITLE_KEY;
  const subtitleKey = committedSubtitleSpeciesId ?? DEFAULT_SUBTITLE_KEY;
  const subtitle =
    subtitleKey === DEFAULT_SUBTITLE_KEY
      ? "군집행동"
      : getAnimalDetails(subtitleKey)?.korean || "";
  const isSubtitleVisible =
    particleTextState.isSettled && subtitleKey === currentSubtitleKey;

  return (
    <div className="home" ref={homeRef}>
      {!fontsLoaded && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 1000,
            color: "var(--theme-text-strong)",
            fontSize: "1.5rem",
          }}
        >
          <p>로딩 중...</p>
        </div>
      )}

      <div
        ref={subtitleRef}
        className={`home-particle-subtitle${isSubtitleVisible && subtitle ? " is-visible" : ""}`}
        aria-hidden={!isSubtitleVisible || !subtitle}
        style={{
          top: `${committedTitleBottomY + 60}px`,
          zIndex: particleTextState.textZIndex,
        }}
      >
        {subtitle}
      </div>

      <div
        aria-hidden={!isIdleHintVisible}
        style={{
          ...idleHintStyle,
          opacity: isIdleHintVisible ? 1 : 0,
          transform: isIdleHintVisible
            ? "translate3d(-50%, 0, 0)"
            : "translate3d(-50%, 10px, 0)",
        }}
      >
        동물을 클릭해보세요
      </div>

      {HOME_ANIMALS.map((animal) => (
        <div
          key={animal.instanceId}
          onClick={props.onAnimalClick}
          onMouseEnter={() => {
            if (isHoverFocusLockedRef.current) {
              return;
            }

            focusHoveredAnimal(animal.instanceId);
          }}
          onMouseLeave={() => {
            if (hoveredIdRef.current === animal.instanceId) {
              clearHoveredAnimal();
            }
          }}
          className="creature"
          id={animal.instanceId}
          data-species-id={animal.speciesId}
          data-instance-index={animal.instanceIndex}
          style={{ opacity: animalsLoaded ? 1 : 0 }}
        >
          {renderSprite(animal.speciesId)}
        </div>
      ))}
    </div>
  );
}

export default Home;
