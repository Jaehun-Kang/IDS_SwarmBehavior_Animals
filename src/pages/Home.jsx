import { useEffect, useRef, useState } from "react";
import { animals } from "../behaviors/animalData";
import { useParticleCanvas } from "../hooks/useParticleCanvas";
import { useAnimals } from "../hooks/useAnimals";

function Home(props) {
  const homeRef = useRef(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // 폰트 로드 대기
  useEffect(() => {
    const loadFonts = async () => {
      try {
        const fontLoadPromise = document.fonts.ready;
        const timeoutPromise = new Promise((resolve) =>
          setTimeout(resolve, 5000),
        );
        await Promise.race([fontLoadPromise, timeoutPromise]);
        setFontsLoaded(true);
      } catch (e) {
        setFontsLoaded(true);
      }
    };

    const initialDelay = setTimeout(() => loadFonts(), 100);
    return () => clearTimeout(initialDelay);
  }, []);

  useParticleCanvas(homeRef, fontsLoaded);
  const { animalsLoaded, hoveredIdRef } = useAnimals(
    homeRef,
    fontsLoaded,
    props.savedPosition,
  );

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
            color: "oklch(0.4777 0.0208 81.25)",
            fontSize: "1.5rem",
          }}
        >
          <p>로딩 중...</p>
        </div>
      )}

      {animals.map((animal) => (
        <div
          key={animal.id}
          onClick={props.onAnimalClick}
          onMouseEnter={() => (hoveredIdRef.current = animal.id)}
          onMouseLeave={() => (hoveredIdRef.current = null)}
          className="creature"
          id={animal.id}
          style={{ opacity: animalsLoaded ? 1 : 0 }}
        >
          {animal.id === "starling" && <div className="sprite_starling" />}
          {animal.id === "sardine" && <div className="sprite_sardine" />}
          {animal.id === "grasshopper" && (
            <div className="sprite_grasshopper" />
          )}
          {animal.id === "ant" && <div className="sprite_ant" />}
          {animal.id === "bat" && <div className="sprite_bat" />}
          {animal.id === "sheep" && <div className="sprite_sheep" />}
          {animal.id === "penguin" && <div className="sprite_penguin" />}
          {animal.id === "bee" && <div className="sprite_bee" />}
          {animal.id === "firefly" && <div className="sprite_firefly" />}
          {animal.id === "spiny_lobster" && (
            <div className="sprite_spiny_lobster" />
          )}
          {animal.id === "krill" && <div className="sprite_krill" />}
        </div>
      ))}
    </div>
  );
}

export default Home;
