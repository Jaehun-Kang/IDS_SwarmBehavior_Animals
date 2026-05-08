// 정어리
const PARAMS = {
  // 기본 유영
  BASE_SPEED_MIN: 1, // 최소 기본 속도
  BASE_SPEED_RANGE: 1.5, // 추가 속도 범위
  START_ANGLE_MIN: (50 * Math.PI) / 180, // 시작 각도 최소값
  START_ANGLE_MAX: (120 * Math.PI) / 180, // 시작 각도 최대값
  // 대시 주기
  DASH_INTERVAL_MIN: 480, // 최소 대시 간격
  DASH_INTERVAL_RANGE: 240, // 추가 대시 간격
  DASH_MULT_MIN: 5, // 대시 시작 배수
  DASH_MULT_RANGE: 0, // 추가 대시 배수
  DASH_DECAY: 0.98, // 대시 감쇠율
  TURN_RATE: 0.12, // 일반 방향 전환 비율
  // 벽 회피
  WALL_LOOK_AHEAD: 110, // 전방 감지 거리
  WALL_MARGIN: 40, // 벽 여유 거리
  WALL_TURN_RATE: 0.18, // 회피 선회 비율
  WALL_STEER: 1.2, // 회피 조향력
  // 무리 이동
  MIN_DIST_RATIO: 0.8, // 최소 간격 배수
  MAX_DIST_RATIO: 1.1, // 최대 이탈 배수
  SEPARATION_FORCE: 1.3, // 분리 반발 강도
  COHESION_FORCE: 3.2, // 중심 복귀 강도
  ALIGNMENT_FORCE: 1.5, // 방향 정렬 강도
  PUSH_WEIGHT: 0.06, // 그룹 힘 적용 배율
  LAG_THRESHOLD_RATIO: 1.5, // 추격 가속 시작 거리
  LAG_BOOST_SCALE: 1.2, // 추격 가속 기울기
  LAG_BOOST_MAX: 2.0, // 최대 추격 배수
};

function randomFrames(min, range) {
  return min + Math.random() * range;
}

function clampPosition(animal, rect) {
  animal.x = Math.max(
    -animal.width * 0.5,
    Math.min(rect.width - animal.width * 0.5, animal.x),
  );
  animal.y = Math.max(
    -animal.height * 0.5,
    Math.min(rect.height - animal.height * 0.99, animal.y),
  );
}

function lerpAngle(current, target, amount) {
  const diff = Math.atan2(
    Math.sin(target - current),
    Math.cos(target - current),
  );
  return current + diff * amount;
}

function applyHomeWallAvoidance(animal, rect) {
  const forwardX = animal.x + Math.cos(animal.heading) * PARAMS.WALL_LOOK_AHEAD;
  const forwardY = animal.y + Math.sin(animal.heading) * PARAMS.WALL_LOOK_AHEAD;

  let steerX = 0;
  let steerY = 0;

  if (forwardX < PARAMS.WALL_MARGIN) {
    steerX +=
      ((PARAMS.WALL_MARGIN - forwardX) / PARAMS.WALL_MARGIN) *
      PARAMS.WALL_STEER;
  } else if (forwardX > rect.width - animal.width - PARAMS.WALL_MARGIN) {
    steerX -=
      ((forwardX - (rect.width - animal.width - PARAMS.WALL_MARGIN)) /
        PARAMS.WALL_MARGIN) *
      PARAMS.WALL_STEER;
  }

  if (forwardY < -animal.height * 0.2 + PARAMS.WALL_MARGIN * 0.35) {
    steerY +=
      ((-animal.height * 0.2 + PARAMS.WALL_MARGIN * 0.35 - forwardY) /
        PARAMS.WALL_MARGIN) *
      PARAMS.WALL_STEER;
  } else if (forwardY > rect.height - animal.height - PARAMS.WALL_MARGIN) {
    steerY -=
      ((forwardY - (rect.height - animal.height - PARAMS.WALL_MARGIN)) /
        PARAMS.WALL_MARGIN) *
      PARAMS.WALL_STEER;
  }

  if (steerX !== 0 || steerY !== 0) {
    const targetHeading = Math.atan2(
      Math.sin(animal.heading) + steerY,
      Math.cos(animal.heading) + steerX,
    );
    animal.targetHeading = lerpAngle(
      animal.targetHeading,
      targetHeading,
      PARAMS.WALL_TURN_RATE,
    );
  }
}

export function initSardine(rect, width, height) {
  const speed = Math.random() * PARAMS.BASE_SPEED_RANGE + PARAMS.BASE_SPEED_MIN;
  const angle =
    PARAMS.START_ANGLE_MIN +
    Math.random() * (PARAMS.START_ANGLE_MAX - PARAMS.START_ANGLE_MIN);
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
    swimType: "sardine_swim1",
    heading: angle,
    targetHeading: angle,
    dashMultiplier: 1,
    nextDashAt: randomFrames(
      PARAMS.DASH_INTERVAL_MIN,
      PARAMS.DASH_INTERVAL_RANGE,
    ),
  };
}

export function updateSardine(animal, rect) {
  animal.time += 1;

  if (animal.time >= animal.nextDashAt) {
    animal.dashMultiplier =
      PARAMS.DASH_MULT_MIN + Math.random() * PARAMS.DASH_MULT_RANGE;

    // 방향 재설정
    animal.targetHeading = Math.random() * Math.PI * 2;

    if (!animal.isHome) {
      // 벽 근접 방향 반전
      if (animal.x <= animal.width * 0.5) {
        animal.targetHeading = Math.PI - animal.targetHeading;
      }
      if (animal.x >= rect.width - animal.width * 0.5) {
        animal.targetHeading = Math.PI - animal.targetHeading;
      }
      if (animal.y <= -animal.height * 0.5) {
        animal.targetHeading = -animal.targetHeading;
      }
      if (animal.y >= rect.height * 0.9 - animal.height * 0.5) {
        animal.targetHeading = -animal.targetHeading;
      }
    }

    animal.nextDashAt =
      animal.time +
      randomFrames(PARAMS.DASH_INTERVAL_MIN, PARAMS.DASH_INTERVAL_RANGE);
  } else if (animal.dashMultiplier > 1) {
    animal.dashMultiplier = Math.max(
      1,
      animal.dashMultiplier * PARAMS.DASH_DECAY,
    );
  }

  if (animal.isHome) {
    applyHomeWallAvoidance(animal, rect);
  }

  animal.heading = lerpAngle(
    animal.heading,
    animal.targetHeading,
    PARAMS.TURN_RATE,
  );

  const currentSpeed = animal.baseSpeed * animal.dashMultiplier;
  animal.vx = Math.cos(animal.heading) * currentSpeed;
  animal.vy = Math.sin(animal.heading) * currentSpeed;

  const rawAngle = Math.atan2(animal.vy, animal.vx);
  const absCos = Math.abs(Math.cos(rawAngle)); // 수평 성분
  const absSin = Math.abs(Math.sin(rawAngle)); // 수직 성분

  if (absCos >= absSin) {
    // 수평 움직임 우세 → 측면 (1 프레임)
    let rotation = (rawAngle * 180) / Math.PI;
    let scaleX = 1;
    if (Math.abs(rotation) > 90) {
      scaleX = -1;
      rotation = rotation > 0 ? rotation - 180 : rotation + 180;
    }
    animal.rotation = rotation;
    animal.scaleX = scaleX;
    animal.swimType = "sardine_swim1";
  } else if (animal.vy > 0) {
    // 아래 방향 → 정면 (2 프레임)
    animal.rotation = 0;
    animal.scaleX = 1;
    animal.swimType = "sardine_swim2";
  } else {
    // 위 방향 → 후면 (3 프레임)
    animal.rotation = 0;
    animal.scaleX = 1;
    animal.swimType = "sardine_swim3";
  }

  // 위치 업데이트
  animal.x += animal.vx;
  animal.y += animal.vy;

  if (!animal.isHome) {
    clampPosition(animal, rect);
  }
}

export function applySpriteSardine(el, animal) {
  const sprite = el.querySelector(".sprite_sardine");
  if (!sprite) return;

  const scaleX = animal.scaleX !== undefined ? animal.scaleX : 1;
  sprite.style.transform = `rotate(${animal.rotation}deg) scaleX(${scaleX})`;

  if (animal.swimType) {
    const next = "sprite_sardine " + animal.swimType;
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

// 홈 시작 배치
export function initHomeSardine({
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
    (Math.max(width, height) * 0.28 + Math.random() * 6) * animal.instanceIndex;
  animal.x = anchor.x + Math.cos(angle) * distance;
  animal.y = anchor.y + Math.sin(angle) * distance;
  animal.vx = anchor.vx + (Math.random() - 0.5) * 0.6;
  animal.vy = anchor.vy + (Math.random() - 0.5) * 0.6;
  animal.heading = Math.atan2(animal.vy, animal.vx);
  animal.targetHeading = animal.heading;
}

export function applyHomeGroupSardine(groupIds, animalsRef, _rect) {
  const coreIds = groupIds.filter((id) => {
    const animal = animalsRef.current[id];
    return animal && !animal.isHovered && !animal.isRejoining;
  });
  const rejoiningIds = groupIds.filter((id) => {
    const animal = animalsRef.current[id];
    return animal && !animal.isHovered && animal.isRejoining;
  });
  if (coreIds.length < 1) return;

  void _rect;

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

      if (boostRatio > 1) {
        const currentSpeed = Math.hypot(animal.vx, animal.vy);
        if (currentSpeed > 0.0001) {
          const targetSpeed = animal.baseSpeed * boostRatio;
          animal.vx = (animal.vx / currentSpeed) * targetSpeed;
          animal.vy = (animal.vy / currentSpeed) * targetSpeed;
        }
      }

      animal.heading = Math.atan2(animal.vy, animal.vx);
      animal.targetHeading = animal.heading;
      normalizeHomeVelocity(animal);
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

    if (boostRatio > 1) {
      const currentSpeed = Math.hypot(animal.vx, animal.vy);
      if (currentSpeed > 0.0001) {
        const targetSpeed = animal.baseSpeed * boostRatio;
        animal.vx = (animal.vx / currentSpeed) * targetSpeed;
        animal.vy = (animal.vy / currentSpeed) * targetSpeed;
      }
    }

    animal.heading = Math.atan2(animal.vy, animal.vx);
    animal.targetHeading = animal.heading;
    normalizeHomeVelocity(animal);
  });
}

export default {
  init: initSardine,
  update: updateSardine,
  applySprite: applySpriteSardine,
  homeInit: initHomeSardine,
  homeGroup: applyHomeGroupSardine,
};
