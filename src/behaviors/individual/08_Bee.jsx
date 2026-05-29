import { HOME_SPRITE_ATLASES } from "../../data/spriteAtlases";
import { resolveDomAtlasSprite } from "../../utils/spritePose";

// 꿀벌
const PARAMS = {
  BASE_SPEED_MIN: 3, // 최소 기본 속도
  BASE_SPEED_RANGE: 2, // 추가 속도 범위
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
  HOVER_HOLD_FRAMES: 350, // 호버링 진입 후 유지 프레임 수
  HOVER_HOLD_MIN_MIX: 0.55, // 유지 구간 최소 호버링 강도
  HOVER_COOLDOWN_MIN_FRAMES: 180, // 호버링 쿨타임 최소 프레임 수
  HOVER_COOLDOWN_MAX_FRAMES: 800, // 호버링 쿨타임 최대 프레임 수
  HOVER_SPEED_RATIO: 0.05, // 호버링 중 속도 비율
  HOVER_BOB_RATE: 0.001, // 호버링 상하 진동 속도
  HOVER_BOB_FORCE: 0.09, // 호버링 상하 진동 강도
  HOVER_BOB_PIXELS: 2, // 스프라이트 들썩임 높이
  FLIGHT_BLEND: 0.2, // 목표 비행 방향으로 수렴하는 정도
  HOVER_FLIGHT_BLEND: 0.28, // 호버링 중 목표 속도로 더 빠르게 수렴하는 정도
  HOVER_PUSH_RATIO: 0.12, // 호버링 중에도 남겨둘 군집 힘 비율
  HOVER_MIX_BLEND: 0.08, // 호버링 강도 변화 보간 정도
};

function getRandomHoverCooldownFrames() {
  const {
    HOVER_COOLDOWN_MIN_FRAMES: minFrames,
    HOVER_COOLDOWN_MAX_FRAMES: maxFrames,
  } = PARAMS;
  return Math.floor(Math.random() * (maxFrames - minFrames + 1)) + minFrames;
}

function ensureBeeState(animal) {
  if (typeof animal.hoverOffset !== "number") {
    animal.hoverOffset = Math.random() * Math.PI * 2;
  }
  if (typeof animal.hoverLockedAngle !== "number") {
    animal.hoverLockedAngle = Math.atan2(animal.vy, animal.vx);
  }
  if (typeof animal.hoverHoldFrames !== "number") {
    animal.hoverHoldFrames = 0;
  }
  if (typeof animal.hoverCooldownFrames !== "number") {
    animal.hoverCooldownFrames = 0;
  }
  if (typeof animal.hoverMix !== "number") {
    animal.hoverMix = 0;
  }
  if (typeof animal.hoverBobOffsetY !== "number") {
    animal.hoverBobOffsetY = 0;
  }
  if (typeof animal.wasHovering !== "boolean") {
    animal.wasHovering = false;
  }
}

function getBeeHoverMix(animal) {
  ensureBeeState(animal);
  let targetHoverMix = 0;
  if (animal.hoverHoldFrames > 0) {
    animal.hoverHoldFrames -= 1;
    targetHoverMix = Math.max(PARAMS.HOVER_HOLD_MIN_MIX, animal.hoverMix || 0);
  } else if (animal.hoverCooldownFrames > 0) {
    animal.hoverCooldownFrames -= 1;
  } else {
    animal.hoverHoldFrames = PARAMS.HOVER_HOLD_FRAMES;
    animal.hoverCooldownFrames = getRandomHoverCooldownFrames();
    targetHoverMix = 1;
  }

  animal.hoverMix +=
    (targetHoverMix - animal.hoverMix) * PARAMS.HOVER_MIX_BLEND;
  return animal.hoverMix;
}

function applyBeeFlightFlavor(animal, speedMultiplier = 1) {
  ensureBeeState(animal);
  const baseAngle = Math.atan2(animal.vy, animal.vx);
  const hoverMix = getBeeHoverMix(animal);
  if (hoverMix > 0.001 && !animal.wasHovering) {
    animal.hoverLockedAngle = baseAngle;
  }
  if (hoverMix <= 0.001) {
    animal.hoverLockedAngle = baseAngle;
  }
  animal.wasHovering = hoverMix > 0.001;
  const hoverSpeedRatio = 1 - hoverMix * (1 - PARAMS.HOVER_SPEED_RATIO);
  const targetSpeed = animal.baseSpeed * speedMultiplier * hoverSpeedRatio;
  const bobForce =
    Math.sin((animal.time + animal.hoverOffset * 20) * PARAMS.HOVER_BOB_RATE) *
    PARAMS.HOVER_BOB_FORCE *
    hoverMix;
  animal.hoverBobOffsetY =
    Math.sin((animal.time + animal.hoverOffset * 20) * PARAMS.HOVER_BOB_RATE) *
    PARAMS.HOVER_BOB_PIXELS *
    hoverMix;

  if (hoverMix > 0.001) {
    const hoverSettle = hoverMix * hoverMix;
    const currentSpeed = Math.hypot(animal.vx, animal.vy);
    const hoverBlend =
      PARAMS.FLIGHT_BLEND +
      (PARAMS.HOVER_FLIGHT_BLEND - PARAMS.FLIGHT_BLEND) * hoverSettle;
    const nextSpeed = currentSpeed + (targetSpeed - currentSpeed) * hoverBlend;
    const targetVx = Math.cos(animal.hoverLockedAngle) * nextSpeed;
    const targetVy = Math.sin(animal.hoverLockedAngle) * nextSpeed;
    animal.vx += (targetVx - animal.vx) * hoverBlend;
    animal.vy += (targetVy - animal.vy) * hoverBlend + bobForce;
    return;
  }

  animal.hoverBobOffsetY = 0;
  const targetVx = Math.cos(baseAngle) * targetSpeed;
  const targetVy = Math.sin(baseAngle) * targetSpeed;
  animal.vx += (targetVx - animal.vx) * PARAMS.FLIGHT_BLEND;
  animal.vy += (targetVy - animal.vy) * PARAMS.FLIGHT_BLEND;
}

// 꿀벌 - 일단 찌르레기와 같은 비행 패턴을 기반으로 사용
export function initBee(rect, width, height) {
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
    pattern: "wave",
    time: 0,
    rotation: 0,
    scaleX: 1,
    beeType: "bee_fly",
    hoverOffset: Math.random() * Math.PI * 2,
    hoverCooldownFrames: getRandomHoverCooldownFrames(),
  };
}

export function updateBee(animal, rect) {
  applyBeeFlightFlavor(animal);

  const displayAngle =
    animal.hoverMix > 0.001
      ? animal.hoverLockedAngle
      : Math.atan2(animal.vy, animal.vx);
  const sprite = resolveDomAtlasSprite(HOME_SPRITE_ATLASES.bee, {
    velocity: {
      x: Math.cos(displayAngle),
      y: Math.sin(displayAngle),
    },
  });

  animal.rotation = sprite.rotationDeg;
  animal.scaleX = sprite.scaleX;
  animal.beeType = sprite.stage;

  animal.x += animal.vx;
  animal.y += animal.vy;

  if (animal.isHome) {
    // 홈 화면 - 벽 처리 없음 (homeGroup에서 회피기동)
  } else {
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

export function applySpriteBee(el, animal) {
  const sprite = el.querySelector(".sprite_bee");
  if (!sprite) return;
  sprite.style.transform = `translateY(${animal.hoverBobOffsetY || 0}px) rotate(${animal.rotation}deg) scaleX(${animal.scaleX})`;
  if (animal.beeType) {
    const next = "sprite_bee " + animal.beeType;
    if (sprite.className !== next) sprite.className = next;
  }
}

// 홈 시작 배치
export function initHomeBee({
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
}

export function applyHomeGroupBee(groupIds, animalsRef, rect) {
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
      ensureBeeState(animal);
      const hoverForceRatio =
        1 - (animal.hoverMix || 0) * (1 - PARAMS.HOVER_PUSH_RATIO);
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

      animal.vx += pushX * PARAMS.PUSH_WEIGHT * hoverForceRatio;
      animal.vy += pushY * PARAMS.PUSH_WEIGHT * hoverForceRatio;

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
      applyBeeFlightFlavor(animal, boostRatio * verticalRatio);

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
    ensureBeeState(animal);
    const hoverForceRatio =
      1 - (animal.hoverMix || 0) * (1 - PARAMS.HOVER_PUSH_RATIO);
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
      1.25 *
      hoverForceRatio;
    animal.vy +=
      ((toCenterY / (centerDistance || 1)) * PARAMS.COHESION_FORCE +
        avgVy * PARAMS.ALIGNMENT_FORCE) *
      PARAMS.PUSH_WEIGHT *
      1.25 *
      hoverForceRatio;

    const currentSpeed = Math.hypot(animal.vx, animal.vy) || 1;
    const normVy = animal.vy / currentSpeed;
    const verticalRatio = 1 + normVy * PARAMS.VERTICAL_RATIO;
    applyBeeFlightFlavor(animal, boostRatio * verticalRatio);

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
  init: initBee,
  update: updateBee,
  applySprite: applySpriteBee,
  homeInit: initHomeBee,
  homeGroup: applyHomeGroupBee,
};
