// 반딧불이
const PARAMS = {
  BASE_SPEED_MIN: 2.5, // 최소 기본 속도
  BASE_SPEED_RANGE: 1, // 추가 속도 범위
  BLINK_FRAMES: 60, // 발광/소등 전환 주기
  MIN_DIST_RATIO: 0.45, // 분리 반발 시작 거리 배수
  MAX_DIST_RATIO: 1.5, // 응집 복귀 시작 거리 배수
  SEPARATION_FORCE: 2.2, // 분리 반발 강도
  COHESION_FORCE: 3.2, // 중심 응집 강도
  ALIGNMENT_FORCE: 0.75, // 방향 정렬 강도
  PUSH_WEIGHT: 0.06, // 그룹 힘 적용 배율
  LAG_THRESHOLD_RATIO: 1.5, // 뒤처짐 가속 시작 거리 배수
  LAG_BOOST_SCALE: 1.2, // 뒤처짐 가속 기울기
  LAG_BOOST_MAX: 2.0, // 최대 가속 배수
  VERTICAL_RATIO: 0.35, // 하강 가속, 상승 감속 비율
  VERTICAL_THRESHOLD: 0.95, // 수직 판정 임계값
  WALL_LOOK_AHEAD: 100, // 전방 벽 감지 거리
  WALL_MARGIN: 90, // 벽 여유 거리
  WALL_STEER: 0.8, // 벽 회피 조향력
  START_DISTANCE_RATIO: 0.28, // 초기 배치 간격 배수
  START_DISTANCE_RANDOM: 6, // 초기 배치 추가 랜덤 거리
  START_VELOCITY_JITTER: 0.6, // 초기 속도 랜덤 보정 폭
};

function applyFireflyFlightFlavor(animal, speedMultiplier = 1) {
  const baseAngle = Math.atan2(animal.vy, animal.vx);
  const targetSpeed = animal.baseSpeed * speedMultiplier;
  const targetVx = Math.cos(baseAngle) * targetSpeed;
  const targetVy = Math.sin(baseAngle) * targetSpeed;
  animal.vx += (targetVx - animal.vx) * PARAMS.PUSH_WEIGHT;
  animal.vy += (targetVy - animal.vy) * PARAMS.PUSH_WEIGHT;
}

// 반딧불이 - 느린 속도, 우아한 움직임
export function initFirefly(rect, width, height) {
  const speed = Math.random() * PARAMS.BASE_SPEED_RANGE + PARAMS.BASE_SPEED_MIN;
  const angle = Math.random() * Math.PI * 2;
  return {
    x: Math.random() * (rect.width - width),
    y: Math.random() * (rect.height - height),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    baseSpeed: speed,
    width,
    height,
    pattern: "smooth",
    time: 0,
    rotation: 0,
    scaleX: 1,
    fireflyType: "firefly_glow",
  };
}

export function updateFirefly(animal, rect) {
  applyFireflyFlightFlavor(animal);

  // 불빛: 일정 주기로 켜짐/꺼짐
  const glow = Math.floor(animal.time / PARAMS.BLINK_FRAMES) % 2 === 0;

  let rotation = (Math.atan2(animal.vy, animal.vx) * 180) / Math.PI;
  let scaleX = 1;

  if (Math.abs(rotation) > 90) {
    scaleX = -1;
    rotation = rotation > 0 ? rotation - 180 : rotation + 180;
  }

  const speed = Math.hypot(animal.vx, animal.vy) || 1;
  const normVyAbs = Math.abs(animal.vy) / speed;
  const isNearVertical = normVyAbs > PARAMS.VERTICAL_THRESHOLD;

  animal.rotation = rotation;
  animal.scaleX = scaleX;
  if (isNearVertical) {
    animal.fireflyType = glow ? "firefly_lit_top_fly" : "firefly_dark_top_fly";
  } else {
    animal.fireflyType = glow ? "firefly_glow" : "firefly_dark";
  }

  animal.x += animal.vx;
  animal.y += animal.vy;

  if (animal.x <= 0 || animal.x + animal.width >= rect.width) {
    animal.vx *= -1;
    animal.x = Math.max(0, Math.min(rect.width - animal.width, animal.x));
  }
  if (animal.y <= 0 || animal.y + animal.height >= rect.height) {
    animal.vy *= -1;
    animal.y = Math.max(0, Math.min(rect.height - animal.height, animal.y));
  }
}

export function applySpriteFirefly(el, animal) {
  const sprite = el.querySelector(".sprite_firefly");
  if (!sprite) return;
  sprite.style.transform = `rotate(${animal.rotation}deg) scaleX(${animal.scaleX})`;
  if (animal.fireflyType)
    if (animal.fireflyType) {
      const next = "sprite_firefly " + animal.fireflyType;
      if (sprite.className !== next) sprite.className = next;
    }
}

// 시작 배치
export function initHomeFirefly({
  animal,
  speciesId,
  speciesAnchors,
  width,
  height,
}) {
  animal.isHome = true;
  if (!speciesAnchors[speciesId]) {
    speciesAnchors[speciesId] = {
      x: animal.x,
      y: animal.y,
      vx: animal.vx,
      vy: animal.vy,
    };
    return;
  }
  const anchor = speciesAnchors[speciesId];
  const angle = Math.random() * Math.PI * 2;
  const distance =
    (Math.max(width, height) * PARAMS.START_DISTANCE_RATIO +
      Math.random() * PARAMS.START_DISTANCE_RANDOM) *
    animal.instanceIndex;
  animal.x = anchor.x + Math.cos(angle) * distance;
  animal.y = anchor.y + Math.sin(angle) * distance;
  animal.vx = anchor.vx + (Math.random() - 0.5) * PARAMS.START_VELOCITY_JITTER;
  animal.vy = anchor.vy + (Math.random() - 0.5) * PARAMS.START_VELOCITY_JITTER;
}

export function applyHomeGroupFirefly(groupIds, animalsRef, rect) {
  const coreIds = groupIds.filter((id) => {
    const animal = animalsRef.current[id];
    return animal && !animal.isHovered && !animal.isRejoining;
  });
  const rejoiningIds = groupIds.filter((id) => {
    const animal = animalsRef.current[id];
    return animal && !animal.isHovered && animal.isRejoining;
  });
  if (coreIds.length < 1) return;

  let centerX = 0;
  let centerY = 0;
  coreIds.forEach((id) => {
    const animal = animalsRef.current[id];
    if (!animal) return;
    centerX += animal.x;
    centerY += animal.y;
  });
  centerX /= coreIds.length;
  centerY /= coreIds.length;

  let avgVx = 0;
  let avgVy = 0;
  coreIds.forEach((id) => {
    const animal = animalsRef.current[id];
    if (!animal) return;
    const speed = Math.hypot(animal.vx, animal.vy) || 1;
    avgVx += animal.vx / speed;
    avgVy += animal.vy / speed;
  });
  const avgLen = Math.hypot(avgVx, avgVy) || 1;
  avgVx /= avgLen;
  avgVy /= avgLen;

  if (coreIds.length >= 2) {
    coreIds.forEach((id) => {
      const animal = animalsRef.current[id];
      if (!animal) return;
      const minDistance =
        Math.max(animal.width, animal.height) * PARAMS.MIN_DIST_RATIO;
      const maxDistance =
        Math.max(animal.width, animal.height) * PARAMS.MAX_DIST_RATIO;
      let pushX = 0;
      let pushY = 0;

      coreIds.forEach((otherId) => {
        if (id === otherId) return;
        const other = animalsRef.current[otherId];
        if (!other) return;
        const dx = animal.x - other.x;
        const dy = animal.y - other.y;
        const distance = Math.hypot(dx, dy) || 1;
        if (distance < minDistance) {
          const force = (minDistance - distance) / minDistance;
          pushX += (dx / distance) * force * PARAMS.SEPARATION_FORCE;
          pushY += (dy / distance) * force * PARAMS.SEPARATION_FORCE;
        }
      });

      const toCenterX = centerX - animal.x;
      const toCenterY = centerY - animal.y;
      const centerDistance = Math.hypot(toCenterX, toCenterY);
      if (centerDistance > maxDistance) {
        pushX += (toCenterX / centerDistance) * PARAMS.COHESION_FORCE;
        pushY += (toCenterY / centerDistance) * PARAMS.COHESION_FORCE;
      }

      pushX += avgVx * PARAMS.ALIGNMENT_FORCE;
      pushY += avgVy * PARAMS.ALIGNMENT_FORCE;

      animal.vx += pushX * PARAMS.PUSH_WEIGHT;
      animal.vy += pushY * PARAMS.PUSH_WEIGHT;

      const lagDist = Math.hypot(centerX - animal.x, centerY - animal.y);
      const lagThreshold =
        Math.max(animal.width, animal.height) * PARAMS.LAG_THRESHOLD_RATIO;
      const boostRatio =
        lagDist > lagThreshold
          ? Math.min(
              1 +
                ((lagDist - lagThreshold) / lagThreshold) *
                  PARAMS.LAG_BOOST_SCALE,
              PARAMS.LAG_BOOST_MAX,
            )
          : 1;

      const currentSpeed = Math.hypot(animal.vx, animal.vy) || 1;
      const normVy = animal.vy / currentSpeed;
      const verticalRatio = 1 + normVy * PARAMS.VERTICAL_RATIO;
      applyFireflyFlightFlavor(animal, boostRatio * verticalRatio);

      if (rect) {
        const speed = Math.hypot(animal.vx, animal.vy) || 1;
        const nx = animal.vx / speed;
        const ny = animal.vy / speed;
        const {
          WALL_LOOK_AHEAD: lookAhead,
          WALL_MARGIN: wallMargin,
          WALL_STEER: steerForce,
        } = PARAMS;
        const fwdX = animal.x + nx * lookAhead;
        const fwdY = animal.y + ny * lookAhead;

        let steerX = 0;
        let steerY = 0;

        if (fwdX < wallMargin) {
          steerX += steerForce * (1 - Math.max(0, fwdX) / wallMargin);
        } else if (fwdX > rect.width - wallMargin - animal.width) {
          steerX -=
            steerForce *
            Math.min(
              1,
              (fwdX - (rect.width - wallMargin - animal.width)) / wallMargin,
            );
        }
        if (fwdY < wallMargin) {
          steerY += steerForce * (1 - Math.max(0, fwdY) / wallMargin);
        } else if (fwdY > rect.height - wallMargin - animal.height) {
          steerY -=
            steerForce *
            Math.min(
              1,
              (fwdY - (rect.height - wallMargin - animal.height)) / wallMargin,
            );
        }

        animal.vx += steerX;
        animal.vy += steerY;
      }
    });
  }

  rejoiningIds.forEach((id) => {
    const animal = animalsRef.current[id];
    if (!animal) return;
    const maxDistance =
      Math.max(animal.width, animal.height) * PARAMS.MAX_DIST_RATIO;
    const toCenterX = centerX - animal.x;
    const toCenterY = centerY - animal.y;
    const centerDistance = Math.hypot(toCenterX, toCenterY);
    if (centerDistance <= maxDistance) {
      animal.isRejoining = false;
      return;
    }

    const lagThreshold =
      Math.max(animal.width, animal.height) * PARAMS.LAG_THRESHOLD_RATIO;
    const boostRatio =
      centerDistance > lagThreshold
        ? Math.min(
            1 +
              ((centerDistance - lagThreshold) / lagThreshold) *
                PARAMS.LAG_BOOST_SCALE,
            PARAMS.LAG_BOOST_MAX,
          )
        : 1;

    animal.vx +=
      ((toCenterX / (centerDistance || 1)) * PARAMS.COHESION_FORCE +
        avgVx * PARAMS.ALIGNMENT_FORCE) *
      PARAMS.PUSH_WEIGHT *
      1.25;
    animal.vy +=
      ((toCenterY / (centerDistance || 1)) * PARAMS.COHESION_FORCE +
        avgVy * PARAMS.ALIGNMENT_FORCE) *
      PARAMS.PUSH_WEIGHT *
      1.25;

    const currentSpeed = Math.hypot(animal.vx, animal.vy) || 1;
    const normVy = animal.vy / currentSpeed;
    const verticalRatio = 1 + normVy * PARAMS.VERTICAL_RATIO;
    applyFireflyFlightFlavor(animal, boostRatio * verticalRatio);

    if (rect) {
      const speed = Math.hypot(animal.vx, animal.vy) || 1;
      const nx = animal.vx / speed;
      const ny = animal.vy / speed;
      const {
        WALL_LOOK_AHEAD: lookAhead,
        WALL_MARGIN: wallMargin,
        WALL_STEER: steerForce,
      } = PARAMS;
      const fwdX = animal.x + nx * lookAhead;
      const fwdY = animal.y + ny * lookAhead;

      let steerX = 0;
      let steerY = 0;

      if (fwdX < wallMargin) {
        steerX += steerForce * (1 - Math.max(0, fwdX) / wallMargin);
      } else if (fwdX > rect.width - wallMargin - animal.width) {
        steerX -=
          steerForce *
          Math.min(
            1,
            (fwdX - (rect.width - wallMargin - animal.width)) / wallMargin,
          );
      }
      if (fwdY < wallMargin) {
        steerY += steerForce * (1 - Math.max(0, fwdY) / wallMargin);
      } else if (fwdY > rect.height - wallMargin - animal.height) {
        steerY -=
          steerForce *
          Math.min(
            1,
            (fwdY - (rect.height - wallMargin - animal.height)) / wallMargin,
          );
      }

      animal.vx += steerX;
      animal.vy += steerY;
    }
  });
}

export default {
  init: initFirefly,
  update: updateFirefly,
  applySprite: applySpriteFirefly,
  homeInit: initHomeFirefly,
  homeGroup: applyHomeGroupFirefly,
};
