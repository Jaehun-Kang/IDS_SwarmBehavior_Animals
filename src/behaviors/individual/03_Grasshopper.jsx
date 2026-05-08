// 메뚜기
const PARAMS = {
  // 기본 속도
  BASE_SPEED_MIN: 1.2, // 최소 기본 속도
  BASE_SPEED_RANGE: 0.6, // 추가 속도 범위
  // 점프 이동
  JUMP_CYCLE: 60 * 3, // 점프 주기
  JUMP_ANIMATION_TIME: 60 * 0.5, // 점프 동작 시간
  JUMP_RADIUS: 250, // 점프 반경
  JUMP_HEIGHT: 80, // 점프 높이
  INITIAL_JUMP_OFFSET_MAX: 144, // 첫 점프 시작 오차 최대값
  IDLE_FRONT_THRESHOLD: 0.9, // idle에서 정면 스프라이트로 볼 수직 비율
  DIRECTION_BLEND: 0.72, // 점프 방향에 군집 조향 반영 비율
  // 군집
  MIN_DIST_RATIO: 0.8, // 최소 간격 배수
  MAX_DIST_RATIO: 1.45, // 최대 이탈 배수
  SEPARATION_FORCE: 1.35, // 분리 반발 강도
  COHESION_FORCE: 2.8, // 중심 복귀 강도
  ALIGNMENT_FORCE: 1.4, // 방향 정렬 강도
  PUSH_WEIGHT: 0.08, // 그룹 힘 적용 배율
};

export function initGrasshopper(rect, width, height) {
  const startX = Math.random() * (rect.width - width);
  const startY = Math.random() * (rect.height - height);
  const baseSpeed =
    PARAMS.BASE_SPEED_MIN + Math.random() * PARAMS.BASE_SPEED_RANGE;

  return {
    x: startX,
    y: startY,
    vx: 0,
    vy: 0,
    baseSpeed,
    width,
    height,
    time: 0,
    baseY: startY,
    nextJumpAt: Math.random() * PARAMS.INITIAL_JUMP_OFFSET_MAX,
    jumpStartedAt: -1,
    jumpStartX: startX,
    jumpStartY: startY,
    jumpTargetX: startX,
    jumpTargetY: startY,
    jumpHeight: PARAMS.JUMP_HEIGHT,
    // 스프라이트 상태
    rotation: 0,
    scaleX: 1,
    spriteType: "grasshopper_idle",
    jumpDirX: 1,
    jumpDirY: 0,
  };
}

function setNextJumpTarget(animal, minX, maxX, minY, maxY) {
  animal.jumpStartX = animal.x;
  animal.jumpStartY = animal.y;
  animal.baseY = animal.y;

  const randomAngle = Math.random() * Math.PI * 2;
  let dirX = Math.cos(randomAngle);
  let dirY = Math.sin(randomAngle);

  if (animal.isHome) {
    const steerLength = Math.hypot(animal.vx, animal.vy);
    if (steerLength > 0.0001) {
      const steerX = animal.vx / steerLength;
      const steerY = animal.vy / steerLength;
      dirX =
        dirX * (1 - PARAMS.DIRECTION_BLEND) + steerX * PARAMS.DIRECTION_BLEND;
      dirY =
        dirY * (1 - PARAMS.DIRECTION_BLEND) + steerY * PARAMS.DIRECTION_BLEND;
      const dirLength = Math.hypot(dirX, dirY) || 1;
      dirX /= dirLength;
      dirY /= dirLength;
    }
  }

  let targetX = animal.x + dirX * PARAMS.JUMP_RADIUS;
  let targetY = animal.baseY + dirY * PARAMS.JUMP_RADIUS;

  animal.jumpTargetX = Math.max(minX, Math.min(maxX, targetX));
  animal.jumpTargetY = Math.max(minY, Math.min(maxY, targetY));

  animal.jumpDirX = animal.jumpTargetX - animal.jumpStartX;
  animal.jumpDirY = animal.jumpTargetY - animal.jumpStartY;
}

export function updateGrasshopper(animal, rect) {
  const jumpCycle = PARAMS.JUMP_CYCLE;
  const jumpAnimationTime = PARAMS.JUMP_ANIMATION_TIME;

  const minX = 0;
  const maxX = rect.width - animal.width;
  const minY = 0;
  const maxY = rect.height - animal.height;

  const shouldStartJump = animal.time >= animal.nextJumpAt;

  if (shouldStartJump) {
    setNextJumpTarget(animal, minX, maxX, minY, maxY);
    animal.jumpStartedAt = animal.time;
    animal.nextJumpAt = animal.time + jumpCycle;
  }

  const isJumpAnimating =
    animal.jumpStartedAt >= 0 &&
    animal.time - animal.jumpStartedAt < jumpAnimationTime;
  const phaseInCycle = isJumpAnimating
    ? animal.time - animal.jumpStartedAt
    : jumpAnimationTime;

  // 점프 애니메이션
  if (phaseInCycle < jumpAnimationTime) {
    const jumpPhase = phaseInCycle / jumpAnimationTime;
    const easePhase =
      jumpPhase < 0.5
        ? 2 * jumpPhase * jumpPhase
        : -1 + (4 - 2 * jumpPhase) * jumpPhase;

    animal.x =
      animal.jumpStartX + (animal.jumpTargetX - animal.jumpStartX) * easePhase;
    const baseYPosition =
      animal.jumpStartY + (animal.jumpTargetY - animal.jumpStartY) * easePhase;
    const parabola = 4 * jumpPhase * (1 - jumpPhase);
    animal.y = baseYPosition - animal.jumpHeight * parabola;
  } else {
    animal.x = animal.jumpTargetX;
    animal.y = animal.jumpTargetY;
  }

  animal.x = Math.max(minX, Math.min(maxX, animal.x));
  animal.y = Math.max(minY, Math.min(maxY, animal.y));
  animal.vx = 0;
  animal.vy = 0;

  // 스프라이트 타입 결정
  const isJumping = phaseInCycle < jumpAnimationTime;
  const jumpProgress = isJumping ? phaseInCycle / jumpAnimationTime : 0;

  if (isJumping) {
    animal.spriteType =
      jumpProgress < 0.3 ? "grasshopper_jump" : "grasshopper_fly";
  } else {
    const jumpDirLength = Math.hypot(animal.jumpDirX, animal.jumpDirY) || 1;
    const verticalRatio = Math.abs(animal.jumpDirY) / jumpDirLength;
    animal.spriteType =
      verticalRatio >= PARAMS.IDLE_FRONT_THRESHOLD
        ? "grasshopper_idle_front"
        : "grasshopper_idle";
  }

  // 회전 계산
  if (animal.spriteType === "grasshopper_idle_front") {
    animal.rotation = 0;
    animal.scaleX = 1;
  } else if (animal.spriteType === "grasshopper_idle") {
    animal.rotation = 0;
    animal.scaleX = animal.jumpDirX < 0 ? -1 : 1;
  } else if (animal.jumpDirX !== 0 || animal.jumpDirY !== 0) {
    let rotation =
      (Math.atan2(animal.jumpDirY, animal.jumpDirX) * 180) / Math.PI;
    let scaleX = 1;
    if (Math.abs(rotation) > 90) {
      scaleX = -1;
      rotation = rotation > 0 ? rotation - 180 : rotation + 180;
    }
    animal.rotation = rotation;
    animal.scaleX = scaleX;
  } else {
    animal.rotation = 0;
    animal.scaleX = 1;
  }
}

export function applySpriteGrasshopper(el, animal) {
  const sprite = el.querySelector(".sprite_grasshopper");
  if (!sprite) return;

  sprite.style.transform = `rotate(${animal.rotation}deg) scaleX(${animal.scaleX})`;
  if (animal.spriteType) {
    const next = "sprite_grasshopper " + animal.spriteType;
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
export function initHomeGrasshopper({
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

export function applyHomeGroupGrasshopper(groupIds, animalsRef) {
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
    const speed = Math.hypot(animal.vx, animal.vy);
    if (speed > 0.0001) {
      avgVx += animal.vx / speed;
      avgVy += animal.vy / speed;
    }
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
    normalizeHomeVelocity(animal);
  });
}

export default {
  init: initGrasshopper,
  update: updateGrasshopper,
  applySprite: applySpriteGrasshopper,
  homeInit: initHomeGrasshopper,
  homeGroup: applyHomeGroupGrasshopper,
};
