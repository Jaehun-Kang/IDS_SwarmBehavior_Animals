import { forwardRef, useEffect, useRef } from "react";
import starlingBehavior from "./behaviors/individual/Starling.jsx";
import sardineBehavior from "./behaviors/individual/Sardine.jsx";
import grasshopperBehavior from "./behaviors/individual/Grasshopper.jsx";
import antBehavior from "./behaviors/individual/Ant.jsx";
import batBehavior from "./behaviors/individual/Bat.jsx";
import sheepBehavior from "./behaviors/individual/Sheep.jsx";
import beeBehavior from "./behaviors/individual/Bee.jsx";
import fireflyBehavior from "./behaviors/individual/Firefly.jsx";
import spinyLobsterBehavior from "./behaviors/individual/SpinyLobster.jsx";
import krillBehavior from "./behaviors/individual/Krill.jsx";

const Home = forwardRef((props, ref) => {
  const homeRef = useRef(null);
  const animalsRef = useRef({});
  const animationRef = useRef(null);
  const hoveredIdRef = useRef(null);

  // 동물 데이터
  const animals = [
    { id: "starling", name: "찌르레기" },
    { id: "sardine", name: "정어리" },
    { id: "grasshopper", name: "메뚜기" },
    { id: "ant", name: "개미" },
    { id: "bat", name: "박쥐" },
    { id: "sheep", name: "양" },
    { id: "bee", name: "꿀벌" },
    { id: "firefly", name: "반딧불이" },
    { id: "spiny_lobster", name: "닭새우" },
    { id: "krill", name: "크릴" },
  ];

  // 동물별 behavior 매핑
  const behaviorMap = {
    starling: starlingBehavior,
    sardine: sardineBehavior,
    grasshopper: grasshopperBehavior,
    ant: antBehavior,
    bat: batBehavior,
    sheep: sheepBehavior,
    bee: beeBehavior,
    firefly: fireflyBehavior,
    spiny_lobster: spinyLobsterBehavior,
    krill: krillBehavior,
  };

  useEffect(() => {
    if (!homeRef.current) return;

    // 각 동물의 상태 초기화
    const creatures = homeRef.current.querySelectorAll(".creature");
    creatures.forEach((el) => {
      if (!animalsRef.current[el.id]) {
        const rect = {
          width: homeRef.current.clientWidth,
          height: homeRef.current.clientHeight,
        };
        const width = el.offsetWidth;
        const height = el.offsetHeight;

        // 동물별 behavior에서 초기화
        const behavior = behaviorMap[el.id];
        if (behavior) {
          animalsRef.current[el.id] = behavior.init(rect, width, height);
        }

        // 초기 위치를 CSS에 적용
        const animal = animalsRef.current[el.id];
        el.style.position = "absolute";
        el.style.left = animal.x + "px";
        el.style.top = animal.y + "px";
      }
    });

    const animate = () => {
      const rect = {
        width: homeRef.current.clientWidth,
        height: homeRef.current.clientHeight,
      };
      creatures.forEach((el) => {
        const animal = animalsRef.current[el.id];
        if (!animal) return;

        // 호버된 개체는 일시정지
        if (el.id === hoveredIdRef.current) {
          return;
        }

        animal.time += 1;

        // 동물별 behavior에서 움직임과 충돌 처리
        const behavior = behaviorMap[el.id];
        if (behavior) {
          behavior.update(animal, rect);
        }

        // 메뚜기 위치 디버그 (3초마다)
        if (el.id === "grasshopper" && animal.time % 180 === 0) {
          console.log(
            `[Grasshopper] x=${animal.x.toFixed(2)}, y=${animal.y.toFixed(2)}, width=${animal.width}, height=${animal.height}`,
            `screenWidth=${rect.width}, screenHeight=${rect.height}`,
            `valid=${animal.x >= 0 && animal.x + animal.width <= rect.width && animal.y >= 0 && animal.y + animal.height <= rect.height}`,
          );
        }

        // CSS 동위치 적용
        el.style.left = animal.x + "px";
        el.style.top = animal.y + "px";
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div
      className="home"
      ref={(el) => {
        homeRef.current = el;
        if (ref) {
          if (typeof ref === "function") {
            ref(el);
          } else {
            ref.current = el;
          }
        }
      }}
      style={{ position: "relative", overflow: "hidden" }}
    >
      <h1>
        Swarm
        <br />
        Behavior
      </h1>

      {animals.map((animal) => (
        <div
          key={animal.id}
          onClick={props.onAnimalClick}
          onMouseEnter={() => (hoveredIdRef.current = animal.id)}
          onMouseLeave={() => (hoveredIdRef.current = null)}
          className="creature"
          id={animal.id}
        >
          <p>{animal.name}</p>
        </div>
      ))}
    </div>
  );
});

Home.displayName = "Home";
export default Home;
