import { useEffect, useRef } from "react";
import starlingBehavior from "./behaviors/individual/01_Starling.jsx";
import sardineBehavior from "./behaviors/individual/02_Sardine.jsx";
import grasshopperBehavior from "./behaviors/individual/03_Grasshopper.jsx";
import antBehavior from "./behaviors/individual/04_Ant.jsx";
import batBehavior from "./behaviors/individual/05_Bat.jsx";
import sheepBehavior from "./behaviors/individual/06_Sheep.jsx";
import penguinBehavior from "./behaviors/individual/07_Penguin.jsx";
import beeBehavior from "./behaviors/individual/08_Bee.jsx";
import fireflyBehavior from "./behaviors/individual/09_Firefly.jsx";
import spinyLobsterBehavior from "./behaviors/individual/10_SpinyLobster.jsx";
import krillBehavior from "./behaviors/individual/11_Krill.jsx";

// 동물 행동 매핑 (함수 외부에서 정의)
const behaviorMap = {
  starling: starlingBehavior,
  sardine: sardineBehavior,
  grasshopper: grasshopperBehavior,
  ant: antBehavior,
  bat: batBehavior,
  sheep: sheepBehavior,
  penguin: penguinBehavior,
  bee: beeBehavior,
  firefly: fireflyBehavior,
  spiny_lobster: spinyLobsterBehavior,
  krill: krillBehavior,
};

// 동물 생성 데이터 (함수 외부에서 정의)
const animals = [
  { id: "starling", name: "찌르레기" },
  { id: "sardine", name: "정어리" },
  { id: "grasshopper", name: "메뚜기" },
  { id: "ant", name: "개미" },
  { id: "bat", name: "박쥐" },
  { id: "sheep", name: "양" },
  { id: "penguin", name: "펭귄" },
  { id: "bee", name: "꿀벌" },
  { id: "firefly", name: "반딧불이" },
  { id: "spiny_lobster", name: "닭새우" },
  { id: "krill", name: "크릴" },
];

function Home(props) {
  const homeRef = useRef(null);
  const animalsRef = useRef({});
  const animationRef = useRef(null);
  const hoveredIdRef = useRef(null);

  // 동물 초기화
  useEffect(() => {
    if (!homeRef.current) return;

    const creatures = homeRef.current.querySelectorAll(".creature");
    creatures.forEach((el) => {
      if (!animalsRef.current[el.id]) {
        const rect = {
          width: homeRef.current.clientWidth || window.innerWidth,
          height: homeRef.current.clientHeight || window.innerHeight,
        };
        const width = el.offsetWidth;
        const height = el.offsetHeight;

        const behavior = behaviorMap[el.id];
        if (behavior) {
          animalsRef.current[el.id] = behavior.init(rect, width, height);
        }

        const animal = animalsRef.current[el.id];
        el.style.position = "absolute";
        el.style.left = animal.x + "px";
        el.style.top = animal.y + "px";
      }
    });
  }, []);

  // 애니메이션 루프 (마운트됨과 동시에 자동 시작, 언마운트 시 자동 정리)
  useEffect(() => {
    const creatures = homeRef.current?.querySelectorAll(".creature");
    if (!creatures) return;

    const animate = () => {
      const rect = {
        width: homeRef.current.clientWidth || window.innerWidth,
        height: homeRef.current.clientHeight || window.innerHeight,
      };

      creatures.forEach((el) => {
        const animal = animalsRef.current[el.id];
        if (!animal) return;

        // 호버된 개체는 일시정지
        if (el.id === hoveredIdRef.current) {
          return;
        }

        animal.time += 1;

        const behavior = behaviorMap[el.id];
        if (behavior) {
          behavior.update(animal, rect);
        }

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

  // savedPosition이 변할 때 동물 위치 복원
  useEffect(() => {
    if (!homeRef.current || !props.savedPosition) return;

    const el = homeRef.current.querySelector(
      `#${props.savedPosition.animalId}`,
    );
    if (el && animalsRef.current[props.savedPosition.animalId]) {
      const animal = animalsRef.current[props.savedPosition.animalId];
      animal.x = props.savedPosition.position.x;
      animal.y = props.savedPosition.position.y;
      el.style.left = animal.x + "px";
      el.style.top = animal.y + "px";
    }
  }, [props.savedPosition]);

  return (
    <div
      className="home"
      ref={homeRef}
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
}

export default Home;
