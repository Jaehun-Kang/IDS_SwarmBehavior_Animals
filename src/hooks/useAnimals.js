import { useEffect, useRef, useState } from "react";
import { behaviorMap, computeZIndicesFromCSS } from "../behaviors/animalData";

export function useAnimals(homeRef, fontsLoaded, savedPosition) {
  const animalsRef = useRef({});
  const animationRef = useRef(null);
  const hoveredIdRef = useRef(null);
  const [animalsLoaded, setAnimalsLoaded] = useState(false);

  // 동물 초기화
  useEffect(() => {
    if (!homeRef.current || !fontsLoaded) return;

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

    // CSS 변수 기반 z-index 적용
    const ids = Array.from(creatures).map((el) => el.id);
    const zIndices = computeZIndicesFromCSS(ids);
    creatures.forEach((el) => {
      if (zIndices[el.id] !== undefined) el.style.zIndex = zIndices[el.id];
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    setAnimalsLoaded(true);
  }, [fontsLoaded]);

  // 애니메이션 루프
  useEffect(() => {
    if (!animalsLoaded) return;

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

        if (hoveredIdRef.current) {
          el.style.pointerEvents =
            el.id === hoveredIdRef.current ? "auto" : "none";
        } else {
          el.style.pointerEvents = "auto";
        }

        if (el.id === hoveredIdRef.current) return;

        animal.time += 1;

        const behavior = behaviorMap[el.id];
        if (behavior) {
          behavior.update(animal, rect);
        }

        el.style.left = animal.x + "px";
        el.style.top = animal.y + "px";

        if (behavior && behavior.applySprite) {
          behavior.applySprite(el, animal);
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [animalsLoaded]);

  // 동물 위치 복원
  useEffect(() => {
    if (!homeRef.current || !savedPosition) return;

    const el = homeRef.current.querySelector(`#${savedPosition.animalId}`);
    if (el && animalsRef.current[savedPosition.animalId]) {
      const animal = animalsRef.current[savedPosition.animalId];
      animal.x = savedPosition.position.x;
      animal.y = savedPosition.position.y;
      el.style.left = animal.x + "px";
      el.style.top = animal.y + "px";
    }
  }, [savedPosition]);

  return { animalsLoaded, hoveredIdRef };
}
