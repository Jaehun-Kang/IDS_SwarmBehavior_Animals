// 펭귄
const PARAMS = {
  BASE_SPEED_MIN: 1, // 최소 기본 속도
  BASE_SPEED_RANGE: 0.5, // 추가 속도 범위
  START_DISTANCE_RATIO: 0.28, // 초기 배치 간격 배수
  START_DISTANCE_RANDOM: 6, // 초기 배치 추가 랜덤 거리
  START_VELOCITY_JITTER: 0.6, // 초기 속도 랜덤 보정 폭
  MIN_DISTANCE_RATIO: 0.45, // 분리 반발 시작 거리 배수
  MAX_DISTANCE_RATIO: 1.1, // 응집 복귀 시작 거리 배수
  SEPARATION_FORCE: 1.2, // 분리 반발 강도
  COHESION_FORCE: 3.2, // 중심 응집 강도
  ALIGNMENT_FORCE: 1.5, // 방향 정렬 강도
  PUSH_BLEND: 0.06, // 그룹 힘 적용 배율
  LAG_THRESHOLD_RATIO: 1.5, // 뒤처짐 가속 시작 거리 배수
  LAG_BOOST_SCALE: 2.0, // 뒤처짐 가속 기울기
  LAG_BOOST_MAX: 2.0, // 최대 가속 배수
  VERTICAL_RATIO: 0.35, // 하강 가속, 상승 감속 비율
  WALL_LOOK_AHEAD: 100, // 전방 벽 감지 거리
  WALL_MARGIN: 15, // 벽 여유 거리
  WALL_STEER: 0.25, // 벽 회피 조향력
  WADDLE_SPEED_THRESHOLD: 0.08, // 뒤뚱거림이 시작되는 최소 이동 속도
  WADDLE_SIDE_SWAY_DEG: 1.5, // 측면 이동 시 좌우 흔들림 최대 각도
  WADDLE_FRONT_BACK_SWAY_DEG: 3, // 정면/후면 이동 시 좌우 흔들림 최대 각도
  WADDLE_SWAY_RATE: 0.22, // 뒤뚱거림 회전 속도
};

// 펜규인 - 느린 속도, 직선 움직임
export function initPenguin(rect, width, height) {
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
    pattern: "uniform",
    time: 0,
    rotation: 0,
    scaleX: 1,
    penguinType: "penguin_walk",
    waddlePhaseOffset: Math.random() * Math.PI * 2,
  };
}

function getPenguinWaddleRotation(animal) {
  const speed = Math.hypot(animal.vx, animal.vy);
  if (!animal.isHovered && speed <= PARAMS.WADDLE_SPEED_THRESHOLD) {
    return 0;
  }
  const swayDeg =
    animal.penguinType === "penguin_walk"
      ? PARAMS.WADDLE_SIDE_SWAY_DEG
      : PARAMS.WADDLE_FRONT_BACK_SWAY_DEG;
  const baseSpeed = Math.max(
    animal.baseSpeed || 0,
    PARAMS.WADDLE_SPEED_THRESHOLD,
  );
  const speedRatio = Math.max(speed / baseSpeed, 0.2);
  const swayPhase =
    Date.now() * 0.001 * (PARAMS.WADDLE_SWAY_RATE * speedRatio * 60);
  return Math.sin(swayPhase + (animal.waddlePhaseOffset || 0)) * swayDeg;
}

function getPenguinMoveType(animal) {
  const absVx = Math.abs(animal.vx);
  const absVy = Math.abs(animal.vy);

  if (absVy > absVx) {
    return {
      scaleX: 1,
      penguinType: animal.vy < 0 ? "penguin_back" : "penguin_front",
    };
  }

  return {
    scaleX: absVx > 0.01 ? (animal.vx < 0 ? -1 : 1) : animal.scaleX,
    penguinType: "penguin_walk",
  };
}

export function updatePenguin(animal, rect) {
  const { scaleX, penguinType } = getPenguinMoveType(animal);
  animal.scaleX = scaleX;
  animal.penguinType = penguinType;
  animal.rotation = getPenguinWaddleRotation(animal);

  animal.x += animal.vx;
  animal.y += animal.vy;

  if (!animal.isHome) {
    if (animal.x <= 0 || animal.x + animal.width >= rect.width) {
      animal.vx *= -1;
      animal.x = Math.max(0, Math.min(rect.width - animal.width, animal.x));
    }
    if (animal.y <= 0 || animal.y + animal.height >= rect.height) {
      animal.vy *= -1;
      animal.y = Math.max(0, Math.min(rect.height - animal.height, animal.y));
    }
  }
}

export function applySpritePenguin(el, animal) {
  const sprite = el.querySelector(".sprite_penguin");
  if (!sprite) return;
  animal.rotation = getPenguinWaddleRotation(animal);
  sprite.style.transformOrigin = "50% 100%";
  sprite.style.transform = `rotate(${animal.rotation}deg) scaleX(${animal.scaleX})`;
  if (animal.penguinType)
    if (animal.penguinType) {
      const next = "sprite_penguin " + animal.penguinType;
      if (sprite.className !== next) sprite.className = next;
    }
}

function normalizeHomeVelocity(animal) {
  const targetSpeed = animal.baseSpeed;
  if (!targetSpeed) return;
  const currentSpeed = Math.hypot(animal.vx, animal.vy);
  if (currentSpeed < 0.0001) return;
  const speedScale = targetSpeed / currentSpeed;
  animal.vx *= speedScale;
  animal.vy *= speedScale;
}

// 시작 배치
export function initHomePenguin({
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
  animal.vx =
    anchor.vx + (Math.random() - 0.5) * PARAMS.START_VELOCITY_JITTER;
  animal.vy =
    anchor.vy + (Math.random() - 0.5) * PARAMS.START_VELOCITY_JITTER;
}

export function applyHomeGroupPenguin(groupIds, animalsRef, rect) {
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
  let avgVx = 0;
  let avgVy = 0;
  coreIds.forEach((id) => {
    const animal = animalsRef.current[id];
    if (!animal) return;
    centerX += animal.x;
    centerY += animal.y;
    const speed = Math.hypot(animal.vx, animal.vy) || 1;
    avgVx += animal.vx / speed;
    avgVy += animal.vy / speed;
  });
  centerX /= coreIds.length;
  centerY /= coreIds.length;
  const avgLength = Math.hypot(avgVx, avgVy) || 1;
  avgVx /= avgLength;
  avgVy /= avgLength;
  if (coreIds.length >= 2) {
    coreIds.forEach((id) => {
      const animal = animalsRef.current[id];
      if (!animal) return;
      const minDistance =
        Math.max(animal.width, animal.height) * PARAMS.MIN_DISTANCE_RATIO;
      const maxDistance =
        Math.max(animal.width, animal.height) * PARAMS.MAX_DISTANCE_RATIO;
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

      animal.vx += pushX * PARAMS.PUSH_BLEND;
      animal.vy += pushY * PARAMS.PUSH_BLEND;

      const lagDistance = Math.hypot(centerX - animal.x, centerY - animal.y);
      const lagThreshold =
        Math.max(animal.width, animal.height) * PARAMS.LAG_THRESHOLD_RATIO;
      const boostRatio =
        lagDistance > lagThreshold
          ? Math.min(
              1 +
                ((lagDistance - lagThreshold) / lagThreshold) *
                  PARAMS.LAG_BOOST_SCALE,
              PARAMS.LAG_BOOST_MAX,
            )
          : 1;

      const currentSpeed = Math.hypot(animal.vx, animal.vy) || 1;
      const normVy = animal.vy / currentSpeed;
      const verticalRatio = 1 + normVy * PARAMS.VERTICAL_RATIO;
      const targetSpeed = animal.baseSpeed * boostRatio * verticalRatio;
      if (currentSpeed > 0.0001) {
        animal.vx = (animal.vx / currentSpeed) * targetSpeed;
        animal.vy = (animal.vy / currentSpeed) * targetSpeed;
      }

      if (rect) {
        const speed = Math.hypot(animal.vx, animal.vy) || 1;
        const nx = animal.vx / speed;
        const ny = animal.vy / speed;
        const fwdX = animal.x + nx * PARAMS.WALL_LOOK_AHEAD;
        const fwdY = animal.y + ny * PARAMS.WALL_LOOK_AHEAD;

        let steerX = 0;
        let steerY = 0;

        if (fwdX < PARAMS.WALL_MARGIN) {
          steerX +=
            PARAMS.WALL_STEER *
            (1 - Math.max(0, fwdX) / PARAMS.WALL_MARGIN);
        } else if (fwdX > rect.width - PARAMS.WALL_MARGIN - animal.width) {
          steerX -=
            PARAMS.WALL_STEER *
            Math.min(
              1,
              (fwdX - (rect.width - PARAMS.WALL_MARGIN - animal.width)) /
                PARAMS.WALL_MARGIN,
            );
        }
        if (fwdY < PARAMS.WALL_MARGIN) {
          steerY +=
            PARAMS.WALL_STEER *
            (1 - Math.max(0, fwdY) / PARAMS.WALL_MARGIN);
        } else if (
          fwdY >
          rect.height - PARAMS.WALL_MARGIN - animal.height
        ) {
          steerY -=
            PARAMS.WALL_STEER *
            Math.min(
              1,
              (fwdY - (rect.height - PARAMS.WALL_MARGIN - animal.height)) /
                PARAMS.WALL_MARGIN,
            );
        }

        animal.vx += steerX;
        animal.vy += steerY;
      }
      normalizeHomeVelocity(animal);
    });
  }
  rejoiningIds.forEach((id) => {
    const animal = animalsRef.current[id];
    if (!animal) return;
    const maxDistance =
      Math.max(animal.width, animal.height) * PARAMS.MAX_DISTANCE_RATIO;
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
      PARAMS.PUSH_BLEND *
      1.25;
    animal.vy +=
      ((toCenterY / (centerDistance || 1)) * PARAMS.COHESION_FORCE +
        avgVy * PARAMS.ALIGNMENT_FORCE) *
      PARAMS.PUSH_BLEND *
      1.25;

    const currentSpeed = Math.hypot(animal.vx, animal.vy) || 1;
    const normVy = animal.vy / currentSpeed;
    const verticalRatio = 1 + normVy * PARAMS.VERTICAL_RATIO;
    const targetSpeed = animal.baseSpeed * boostRatio * verticalRatio;
    if (currentSpeed > 0.0001) {
      animal.vx = (animal.vx / currentSpeed) * targetSpeed;
      animal.vy = (animal.vy / currentSpeed) * targetSpeed;
    }

    if (rect) {
      const speed = Math.hypot(animal.vx, animal.vy) || 1;
      const nx = animal.vx / speed;
      const ny = animal.vy / speed;
      const fwdX = animal.x + nx * PARAMS.WALL_LOOK_AHEAD;
      const fwdY = animal.y + ny * PARAMS.WALL_LOOK_AHEAD;

      let steerX = 0;
      let steerY = 0;

      if (fwdX < PARAMS.WALL_MARGIN) {
        steerX +=
          PARAMS.WALL_STEER *
          (1 - Math.max(0, fwdX) / PARAMS.WALL_MARGIN);
      } else if (fwdX > rect.width - PARAMS.WALL_MARGIN - animal.width) {
        steerX -=
          PARAMS.WALL_STEER *
          Math.min(
            1,
            (fwdX - (rect.width - PARAMS.WALL_MARGIN - animal.width)) /
              PARAMS.WALL_MARGIN,
          );
      }
      if (fwdY < PARAMS.WALL_MARGIN) {
        steerY +=
          PARAMS.WALL_STEER *
          (1 - Math.max(0, fwdY) / PARAMS.WALL_MARGIN);
      } else if (fwdY > rect.height - PARAMS.WALL_MARGIN - animal.height) {
        steerY -=
          PARAMS.WALL_STEER *
          Math.min(
            1,
            (fwdY - (rect.height - PARAMS.WALL_MARGIN - animal.height)) /
              PARAMS.WALL_MARGIN,
          );
      }

      animal.vx += steerX;
      animal.vy += steerY;
    }
    normalizeHomeVelocity(animal);
  });
}

export default {
  init: initPenguin,
  update: updatePenguin,
  applySprite: applySpritePenguin,
  homeInit: initHomePenguin,
  homeGroup: applyHomeGroupPenguin,
};
