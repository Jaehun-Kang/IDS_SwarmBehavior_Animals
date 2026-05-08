// 찌르레기
const PARAMS = {
  // 기본 속도
  BASE_SPEED_MIN: 3, // 최소 기본 속도
  BASE_SPEED_RANGE: 1, // 추가 속도 범위
  // 개체 간 거리
  MIN_DIST_RATIO: 0.45, // 분리 반발 시작 (스프라이트 크기 배수)
  MAX_DIST_RATIO: 1.1, // 응집 복귀 시작 (스프라이트 크기 배수)
  // 조향력
  SEPARATION_FORCE: 1.2, // 분리 반발 강도
  COHESION_FORCE: 3.2, // 중심 응집 강도
  ALIGNMENT_FORCE: 1.5, // 방향 정렬 강도
  PUSH_WEIGHT: 0.06, // 전체 push 적용 배율
  // 뒤처짐 가속
  LAG_THRESHOLD_RATIO: 1.5, // 가속 시작 거리 (스프라이트 크기 배수)
  LAG_BOOST_SCALE: 1.2, // 가속 증가 기울기
  LAG_BOOST_MAX: 2.0, // 최대 가속 배수
  // 수직 방향 속도 보정
  VERTICAL_RATIO: 0.35, // 하강 +35%, 상승 -35%
  VERTICAL_THRESHOLD: 0.95, // 수직 판정 임계값 (|vy|/speed)
  // 전방 벽 회피
  WALL_LOOK_AHEAD: 100, // 전방 감지 거리 (px)
  WALL_MARGIN: 90, // 벽 여유 거리 (px)
  WALL_STEER: 0.4, // 회피 조향력
};

export function initStarling(rect, width, height) {
  const speed = Math.random() * PARAMS.BASE_SPEED_RANGE + PARAMS.BASE_SPEED_MIN;
  const angle = Math.random() * Math.PI * 2; // 0~360도
  return {
    x: Math.random() * (rect.width - width),
    y: Math.random() * (rect.height - height),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    baseSpeed: speed,
    width,
    height,
    time: 0,
    rotation: 0,
    flyType: "starling_fly1",
    flyTypeLock: false,
    randomType: Math.random(),
  };
}

export function updateStarling(animal, rect) {
  // 진행 방향
  let rotation = (Math.atan2(animal.vy, animal.vx) * 180) / Math.PI;
  let scaleX = 1;

  // 스프라이트 방향 보정
  if (Math.abs(rotation) > 90) {
    scaleX = -1;
    rotation = rotation > 0 ? rotation - 180 : rotation + 180;
  }

  const speed = Math.hypot(animal.vx, animal.vy) || 1;
  const normVyAbs = Math.abs(animal.vy) / speed; // 수직 비율
  const isNearVertical = normVyAbs > PARAMS.VERTICAL_THRESHOLD;

  if (animal.vy < 0) {
    // 상승
    animal.flyType = isNearVertical ? "starling_fly4" : "starling_fly1";
    if (animal.flyTypeLock) animal.flyTypeLock = false;
  } else {
    // 하강
    if (isNearVertical) {
      animal.flyType = "starling_fly5";
      animal.flyTypeLock = false;
    } else if (!animal.flyTypeLock) {
      animal.randomType = Math.random();
      animal.flyType =
        animal.randomType > 0.5 ? "starling_fly2" : "starling_fly3";
      animal.flyTypeLock = true;
    }
  }

  animal.rotation = rotation;
  animal.scaleX = scaleX;

  // 위치 업데이트
  animal.x += animal.vx;
  animal.y += animal.vy;

  if (animal.isHome) {
    // 홈 화면 - 벽 처리 없음 (homeGroup에서 회피기동)
  } else {
    // 시뮬레이션 - 벽 튕김
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

export function applySpriteStarling(el, animal) {
  const sprite = el.querySelector(".sprite_starling");
  if (!sprite) return;

  const scaleX = animal.scaleX !== undefined ? animal.scaleX : 1;
  sprite.style.transform = `rotate(${animal.rotation}deg) scaleX(${scaleX})`;

  if (animal.flyType) {
    const next = "sprite_starling " + animal.flyType;
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
export function initHomeStarling({
  animal,
  speciesId,
  speciesAnchors,
  width,
  height,
}) {
  animal.isHome = true; // 홈 화면 플래그
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
}

export function applyHomeGroupStarling(groupIds, animalsRef, rect) {
  const coreIds = groupIds.filter((id) => {
    const animal = animalsRef.current[id];
    return animal && !animal.isHovered && !animal.isRejoining;
  });
  const rejoiningIds = groupIds.filter((id) => {
    const animal = animalsRef.current[id];
    return animal && !animal.isHovered && animal.isRejoining;
  });
  if (coreIds.length < 1) return;

  // 무리 중심 계산
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

  // 무리 평균 방향 계산 (alignment)
  let avgVx = 0;
  let avgVy = 0;
  coreIds.forEach((id) => {
    const animal = animalsRef.current[id];
    if (!animal) return;
    const spd = Math.hypot(animal.vx, animal.vy) || 1;
    avgVx += animal.vx / spd;
    avgVy += animal.vy / spd;
  });
  const avgLen = Math.hypot(avgVx, avgVy) || 1;
  avgVx /= avgLen;
  avgVy /= avgLen;

  if (coreIds.length >= 2) {
    coreIds.forEach((id) => {
      const animal = animalsRef.current[id];
      if (!animal) return;

      const minDist =
        Math.max(animal.width, animal.height) * PARAMS.MIN_DIST_RATIO;
      const maxDist =
        Math.max(animal.width, animal.height) * PARAMS.MAX_DIST_RATIO;
      let pushX = 0;
      let pushY = 0;

      coreIds.forEach((otherId) => {
        if (id === otherId) return;
        const other = animalsRef.current[otherId];
        if (!other) return;
        const dx = animal.x - other.x;
        const dy = animal.y - other.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < minDist) {
          const force = (minDist - dist) / minDist;
          pushX += (dx / dist) * force * PARAMS.SEPARATION_FORCE;
          pushY += (dy / dist) * force * PARAMS.SEPARATION_FORCE;
        }
      });

      const toCX = centerX - animal.x;
      const toCY = centerY - animal.y;
      const centerDist = Math.hypot(toCX, toCY);
      if (centerDist > maxDist) {
        pushX += (toCX / centerDist) * PARAMS.COHESION_FORCE;
        pushY += (toCY / centerDist) * PARAMS.COHESION_FORCE;
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
      const targetSpeed = animal.baseSpeed * boostRatio * verticalRatio;
      if (currentSpeed > 0.0001) {
        animal.vx = (animal.vx / currentSpeed) * targetSpeed;
        animal.vy = (animal.vy / currentSpeed) * targetSpeed;
      }

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
        normalizeHomeVelocity(animal);
      }
    });
  }

  rejoiningIds.forEach((id) => {
    const animal = animalsRef.current[id];
    if (!animal) return;
    const maxDist =
      Math.max(animal.width, animal.height) * PARAMS.MAX_DIST_RATIO;
    const toCX = centerX - animal.x;
    const toCY = centerY - animal.y;
    const centerDist = Math.hypot(toCX, toCY);
    if (centerDist <= maxDist) {
      animal.isRejoining = false;
      return;
    }

    const lagThreshold =
      Math.max(animal.width, animal.height) * PARAMS.LAG_THRESHOLD_RATIO;
    const boostRatio =
      centerDist > lagThreshold
        ? Math.min(
            1 +
              ((centerDist - lagThreshold) / lagThreshold) *
                PARAMS.LAG_BOOST_SCALE,
            PARAMS.LAG_BOOST_MAX,
          )
        : 1;

    animal.vx +=
      ((toCX / (centerDist || 1)) * PARAMS.COHESION_FORCE +
        avgVx * PARAMS.ALIGNMENT_FORCE) *
      PARAMS.PUSH_WEIGHT *
      1.25;
    animal.vy +=
      ((toCY / (centerDist || 1)) * PARAMS.COHESION_FORCE +
        avgVy * PARAMS.ALIGNMENT_FORCE) *
      PARAMS.PUSH_WEIGHT *
      1.25;

    const currentSpeed = Math.hypot(animal.vx, animal.vy) || 1;
    const normVy = animal.vy / currentSpeed;
    const verticalRatio = 1 + normVy * PARAMS.VERTICAL_RATIO;
    const targetSpeed = animal.baseSpeed * boostRatio * verticalRatio;
    if (currentSpeed > 0.0001) {
      animal.vx = (animal.vx / currentSpeed) * targetSpeed;
      animal.vy = (animal.vy / currentSpeed) * targetSpeed;
    }

    // 전방 벽 회피 (normalize 이후 직접 방향 조정)
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
      normalizeHomeVelocity(animal); // 재정규화
    }
  });
}

export default {
  init: initStarling,
  update: updateStarling,
  applySprite: applySpriteStarling,
  homeInit: initHomeStarling,
  homeGroup: applyHomeGroupStarling,
};
