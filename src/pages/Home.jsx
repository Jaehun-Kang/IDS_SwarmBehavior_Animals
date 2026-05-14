import { useEffect, useRef, useState } from "react";
import { computeTextZIndex } from "../behaviors/animalData";
import { animals } from "../behaviors/animalData";
import { getAnimalDetails } from "../behaviors/animalDetails";
import { useParticleCanvas } from "../hooks/useParticleCanvas";
import { useAnimals } from "../hooks/useAnimals";
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

function renderSprite(speciesId) {
  if (speciesId === "starling") return <div className="sprite_starling" />;
  if (speciesId === "sardine") return <div className="sprite_sardine" />;
  if (speciesId === "grasshopper") {
    return <div className="sprite_grasshopper" />;
  }
  if (speciesId === "ant") return <div className="sprite_ant" />;
  if (speciesId === "bat") return <div className="sprite_bat" />;
  if (speciesId === "sheep") return <div className="sprite_sheep" />;
  if (speciesId === "penguin") return <div className="sprite_penguin" />;
  if (speciesId === "bee") return <div className="sprite_bee" />;
  if (speciesId === "firefly") return <div className="sprite_firefly" />;
  if (speciesId === "spiny_lobster") {
    return <div className="sprite_spiny_lobster" />;
  }
  if (speciesId === "krill") return <div className="sprite_krill" />;
  return null;
}

function Home(props) {
  const homeRef = useRef(null);
  const particleObstacleBoxRef = useRef(null);
  const subtitleRef = useRef(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [committedSubtitleSpeciesId, setCommittedSubtitleSpeciesId] =
    useState(null);
  const [committedTitleBottomY, setCommittedTitleBottomY] = useState(0);
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

      {HOME_ANIMALS.map((animal) => (
        <div
          key={animal.instanceId}
          onClick={props.onAnimalClick}
          onMouseEnter={() => (hoveredIdRef.current = animal.instanceId)}
          onMouseLeave={() => {
            if (hoveredIdRef.current === animal.instanceId) {
              hoveredIdRef.current = null;
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
