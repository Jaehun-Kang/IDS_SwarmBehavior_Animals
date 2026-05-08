import { useEffect, useRef, useState } from "react";
import { behaviorMap, computeCreatureZIndex } from "../behaviors/animalData";

// 종 식별
const getSpeciesId = (el) => el.dataset.speciesId || el.id;

// 종별 그룹 구성
const buildSpeciesGroups = (creatures) => {
  const speciesGroups = {};
  creatures.forEach((el) => {
    const speciesId = getSpeciesId(el);
    if (!speciesGroups[speciesId]) speciesGroups[speciesId] = [];
    speciesGroups[speciesId].push(el.id);
  });
  return speciesGroups;
};

export function useAnimals(homeRef, fontsLoaded, savedPosition) {
  const animalsRef = useRef({});
  const animationRef = useRef(null);
  const hoveredIdRef = useRef(null);
  const [animalsLoaded, setAnimalsLoaded] = useState(false);

  // 동물 초기화
  useEffect(() => {
    if (!homeRef.current || !fontsLoaded) return;

    const creatures = homeRef.current.querySelectorAll(".creature");
    const speciesAnchors = {};

    creatures.forEach((el) => {
      if (!animalsRef.current[el.id]) {
        const speciesId = getSpeciesId(el);
        const rect = {
          width: homeRef.current.clientWidth || window.innerWidth,
          height: homeRef.current.clientHeight || window.innerHeight,
        };
        const width = el.offsetWidth;
        const height = el.offsetHeight;

        const behavior = behaviorMap[speciesId];
        if (behavior) {
          animalsRef.current[el.id] = behavior.init(rect, width, height);
        }

        const animal = animalsRef.current[el.id];
        if (!animal) return;

        animal.speciesId = speciesId;
        animal.instanceIndex = Number(el.dataset.instanceIndex || 0);

        // 종별 초기 배치
        behavior.homeInit({
          animal,
          speciesId,
          speciesAnchors,
          width,
          height,
        });

        el.style.position = "absolute";
        el.style.left = animal.x + "px";
        el.style.top = animal.y + "px";
      }
    });

    requestAnimationFrame(() => setAnimalsLoaded(true));
  }, [fontsLoaded, homeRef]);

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
      const speciesGroups = buildSpeciesGroups(creatures);

      creatures.forEach((el) => {
        const animal = animalsRef.current[el.id];
        if (!animal) return;
        const speciesId = getSpeciesId(el);
        const wasHovered = !!animal.isHovered;
        const isHovered = el.id === hoveredIdRef.current;
        animal.isHovered = isHovered;
        if (isHovered) {
          animal.isRejoining = false;
        } else if (wasHovered) {
          animal.isRejoining = true;
        }

        if (hoveredIdRef.current) {
          el.style.pointerEvents =
            el.id === hoveredIdRef.current ? "auto" : "none";
        } else {
          el.style.pointerEvents = "auto";
        }

        if (el.id === hoveredIdRef.current) return;

        animal.time += 1;

        const behavior = behaviorMap[speciesId];
        if (behavior) {
          behavior.update(animal, rect);
        }
      });

      Object.values(speciesGroups).forEach((groupIds) => {
        const firstAnimal = animalsRef.current[groupIds[0]];
        const behavior = firstAnimal
          ? behaviorMap[firstAnimal.speciesId]
          : null;

        // 종별 그룹 이동
        behavior.homeGroup(groupIds, animalsRef, rect);
      });

      creatures.forEach((el) => {
        const animal = animalsRef.current[el.id];
        if (!animal) return;

        el.style.left = animal.x + "px";
        el.style.top = animal.y + "px";
        el.style.zIndex = String(
          computeCreatureZIndex(getSpeciesId(el), animal.y),
        );

        const behavior = behaviorMap[getSpeciesId(el)];
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
  }, [animalsLoaded, homeRef]);

  // 동물 위치 복원
  useEffect(() => {
    if (!homeRef.current || !savedPosition) return;

    const targetId = savedPosition.instanceId || savedPosition.animalId;
    const el =
      homeRef.current.querySelector(`#${targetId}`) ||
      homeRef.current.querySelector(
        `[data-species-id="${savedPosition.animalId}"]`,
      );

    if (el && animalsRef.current[el.id]) {
      const animal = animalsRef.current[el.id];
      animal.x = savedPosition.position.x;
      animal.y = savedPosition.position.y;
      el.style.left = animal.x + "px";
      el.style.top = animal.y + "px";
    }
  }, [savedPosition, homeRef]);

  return { animalsLoaded, hoveredIdRef };
}
