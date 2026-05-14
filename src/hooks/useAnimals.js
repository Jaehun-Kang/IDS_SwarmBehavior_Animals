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

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const getAnimalDirection = (animal) => {
  const vx = animal.vx || 0;
  const vy = animal.vy || 0;
  const speed = Math.hypot(vx, vy);
  if (speed > 0.001) {
    return { x: vx / speed, y: vy / speed };
  }

  if (typeof animal.heading === "number") {
    return { x: Math.cos(animal.heading), y: Math.sin(animal.heading) };
  }

  return { x: 0, y: 0 };
};

const resolveBoxNormal = (pointX, pointY, box) => {
  const insideX = pointX >= box.left && pointX <= box.right;
  const insideY = pointY >= box.top && pointY <= box.bottom;

  if (insideX && insideY) {
    const toLeft = Math.abs(pointX - box.left);
    const toRight = Math.abs(box.right - pointX);
    const toTop = Math.abs(pointY - box.top);
    const toBottom = Math.abs(box.bottom - pointY);
    const minDistance = Math.min(toLeft, toRight, toTop, toBottom);

    if (minDistance === toLeft) return { x: -1, y: 0, distance: 0 };
    if (minDistance === toRight) return { x: 1, y: 0, distance: 0 };
    if (minDistance === toTop) return { x: 0, y: -1, distance: 0 };
    return { x: 0, y: 1, distance: 0 };
  }

  const nearestX = clamp(pointX, box.left, box.right);
  const nearestY = clamp(pointY, box.top, box.bottom);
  const awayX = pointX - nearestX;
  const awayY = pointY - nearestY;
  const distance = Math.hypot(awayX, awayY);

  if (distance < 0.001) {
    return null;
  }

  return {
    x: awayX / distance,
    y: awayY / distance,
    distance,
  };
};

const applyTextObstacleAvoidance = (animal, obstacleBox, rect) => {
  if (!obstacleBox) {
    return;
  }

  const padding = Math.max(3, Math.max(animal.width, animal.height) * 0.22);
  const lookAhead = Math.max(56, Math.max(animal.width, animal.height) * 2.6);
  const steerStrength = 0.9;
  const centerX = animal.x + animal.width / 2;
  const centerY = animal.y + animal.height / 2;
  const direction = getAnimalDirection(animal);

  if (Math.hypot(direction.x, direction.y) < 0.001) {
    return;
  }

  const probeX = centerX + direction.x * lookAhead;
  const probeY = centerY + direction.y * lookAhead;
  const expanded = {
    left: obstacleBox.left - padding,
    right: obstacleBox.right + padding,
    top: obstacleBox.top - padding,
    bottom: obstacleBox.bottom + padding,
  };
  const normal = resolveBoxNormal(probeX, probeY, expanded);
  const insideExpanded =
    probeX >= expanded.left &&
    probeX <= expanded.right &&
    probeY >= expanded.top &&
    probeY <= expanded.bottom;

  if (!normal) {
    return;
  }

  const distance = normal.distance;

  if (!insideExpanded && distance > lookAhead) {
    return;
  }

  const proximity = insideExpanded ? 1 : 1 - Math.min(1, distance / lookAhead);
  const steerX = normal.x * steerStrength * proximity;
  const steerY = normal.y * steerStrength * proximity;
  const desiredX = direction.x + steerX;
  const desiredY = direction.y + steerY;
  const desiredLength = Math.hypot(desiredX, desiredY) || 1;
  const nextDirX = desiredX / desiredLength;
  const nextDirY = desiredY / desiredLength;
  const speed =
    Math.hypot(animal.vx || 0, animal.vy || 0) || animal.baseSpeed || 1;

  if (typeof animal.vx === "number") {
    animal.vx = nextDirX * speed;
  }
  if (typeof animal.vy === "number") {
    animal.vy = nextDirY * speed;
  }

  const nextHeading = Math.atan2(nextDirY, nextDirX);
  if (typeof animal.targetHeading === "number") {
    animal.targetHeading = nextHeading;
  } else if (typeof animal.heading === "number") {
    animal.heading = nextHeading;
  }

  animal.x = clamp(animal.x, 0, rect.width - animal.width);
  animal.y = clamp(animal.y, 0, rect.height - animal.height);
};

export function useAnimals(
  homeRef,
  fontsLoaded,
  savedPosition,
  obstacleBoxRef,
) {
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
      const obstacleBox = obstacleBoxRef?.current || null;
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

        applyTextObstacleAvoidance(animal, obstacleBox, rect);
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
        applyTextObstacleAvoidance(animal, obstacleBox, rect);
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
