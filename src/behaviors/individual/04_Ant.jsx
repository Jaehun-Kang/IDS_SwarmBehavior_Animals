// 개미
const PARAMS = {
  BASE_SPEED_MIN: 1, // 최소 기본 속도
  BASE_SPEED_RANGE: 0.25, // 추가 속도 범위
  TOP_VIEW_ROTATION_OFFSET: 0, // 윗면 회전 보정
  WALL_LOOK_AHEAD: 200, // 전방 벽 감지 거리
  WALL_MARGIN: 85, // 벽 여유 거리
  WALL_TURN_BLEND: 0.05, // 일반 벽 회피 조향 비율
  START_GAP_RATIO: 1.75, // 초기 배치 간격 배수
  POINT_INTERVAL: 30, // 선두 개미 포인트 기록 주기
  POINT_REACHED_DISTANCE: 10, // 후발 개미 포인트 도달 판정 거리
  STEER_BLEND: 0.08, // 이동 조향 보간 비율
  LEADER_RETURN_BLEND: 0.008, // 선두 개미 화면 복귀 조향 비율
  ROTATION_BLEND: 0.14, // 회전 보간 비율
  OUTSIDE_MARGIN: 24, // 화면 복귀 목표 여유 거리
  LEADER_STALL_DISTANCE: 0.01, // 선두 정지 판정 거리
  LEADER_STALL_FRAMES: 2, // 선두 승계 시작 프레임 수
  QUEUE_ACCEL_THRESHOLD: 2, // 가속 시작 큐 개수 기준
  QUEUE_ACCEL_PER_POINT: 0.08, // 초과 큐당 추가 속도 비율
  QUEUE_DECEL_MIN_RATIO: 0.7, // 큐가 적을 때 최소 감속 배율
  QUEUE_ACCEL_MAX_RATIO: 1.6, // 최대 가속 배율
  STOPPED_DISTANCE: 0.01, // 일반 개미 정지 판정 거리
  STOPPED_FRAMES: 2, // 큐 추가 제외 시작 프레임 수
};

function normalizeVector(x, y) {
  const length = Math.hypot(x, y) || 1;
  return { x: x / length, y: y / length };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getTopViewRotation(vx, vy) {
  return (Math.atan2(vy, vx) * 180) / Math.PI + PARAMS.TOP_VIEW_ROTATION_OFFSET;
}

function lerpAngleDeg(current, target, amount) {
  const diff = ((target - current + 540) % 360) - 180;
  return current + diff * amount;
}

function lerpAngleRad(current, target, amount) {
  const diff = Math.atan2(
    Math.sin(target - current),
    Math.cos(target - current),
  );
  return current + diff * amount;
}

function setSpeed(animal, speed) {
  const dir = normalizeVector(animal.vx || 1, animal.vy || 0);
  animal.vx = dir.x * speed;
  animal.vy = dir.y * speed;
}

function ensureHeading(animal) {
  if (animal.heading === undefined) {
    animal.heading = Math.atan2(animal.vy || 0, animal.vx || 1);
  }
}

function ensurePointQueue(animal) {
  if (!Array.isArray(animal.pointQueue)) {
    animal.pointQueue = [];
  }
}

function applyWallAvoidance(animal, rect) {
  const speed = Math.hypot(animal.vx, animal.vy) || 1;
  const dirX = animal.vx / speed;
  const dirY = animal.vy / speed;
  const forwardX = animal.x + dirX * PARAMS.WALL_LOOK_AHEAD;
  const forwardY = animal.y + dirY * PARAMS.WALL_LOOK_AHEAD;

  let targetDirX = dirX;
  let targetDirY = dirY;
  let turnStrength = 0;

  if (forwardX < PARAMS.WALL_MARGIN && dirX < 0) {
    targetDirX = Math.abs(targetDirX);
    turnStrength = Math.max(
      turnStrength,
      (PARAMS.WALL_MARGIN - forwardX) / PARAMS.WALL_MARGIN,
    );
  } else if (
    forwardX > rect.width - animal.width - PARAMS.WALL_MARGIN &&
    dirX > 0
  ) {
    targetDirX = -Math.abs(targetDirX);
    turnStrength = Math.max(
      turnStrength,
      (forwardX - (rect.width - animal.width - PARAMS.WALL_MARGIN)) /
        PARAMS.WALL_MARGIN,
    );
  }

  if (forwardY < PARAMS.WALL_MARGIN && dirY < 0) {
    targetDirY = Math.abs(targetDirY);
    turnStrength = Math.max(
      turnStrength,
      (PARAMS.WALL_MARGIN - forwardY) / PARAMS.WALL_MARGIN,
    );
  } else if (
    forwardY > rect.height - animal.height - PARAMS.WALL_MARGIN &&
    dirY > 0
  ) {
    targetDirY = -Math.abs(targetDirY);
    turnStrength = Math.max(
      turnStrength,
      (forwardY - (rect.height - animal.height - PARAMS.WALL_MARGIN)) /
        PARAMS.WALL_MARGIN,
    );
  }

  if (turnStrength <= 0) return;

  const desired = normalizeVector(targetDirX, targetDirY);
  const currentHeading = Math.atan2(dirY, dirX);
  const targetHeading = Math.atan2(desired.y, desired.x);
  const nextHeading = lerpAngleRad(
    currentHeading,
    targetHeading,
    PARAMS.WALL_TURN_BLEND * turnStrength,
  );
  animal.vx = Math.cos(nextHeading) * speed;
  animal.vy = Math.sin(nextHeading) * speed;
}

function getOrderedGroup(groupIds, animalsRef) {
  return [...groupIds].sort((leftId, rightId) => {
    const leftAnimal = animalsRef.current[leftId];
    const rightAnimal = animalsRef.current[rightId];
    return (leftAnimal?.instanceIndex || 0) - (rightAnimal?.instanceIndex || 0);
  });
}

function getLeaderAnimal(orderedIds, animalsRef) {
  const existingLeader = orderedIds
    .map((id) => animalsRef.current[id])
    .find((animal) => animal?.isLeadAnt);

  if (existingLeader) {
    orderedIds.forEach((id) => {
      const animal = animalsRef.current[id];
      if (animal) animal.isLeadAnt = animal === existingLeader;
    });
    return existingLeader;
  }

  const fallbackLeader = animalsRef.current[orderedIds[0]];
  orderedIds.forEach((id) => {
    const animal = animalsRef.current[id];
    if (animal) animal.isLeadAnt = animal === fallbackLeader;
  });
  return fallbackLeader;
}

function getRoleOrder(animal) {
  return animal?.roleOrder ?? 0;
}

function isStoppedAnimal(animal) {
  return (animal?.stoppedFrames || 0) >= PARAMS.STOPPED_FRAMES;
}

function compareQueueLength(leftAnimal, rightAnimal) {
  const leftQueueLength = leftAnimal?.pointQueue?.length || 0;
  const rightQueueLength = rightAnimal?.pointQueue?.length || 0;
  if (leftQueueLength !== rightQueueLength) {
    return leftQueueLength - rightQueueLength;
  }
  return (leftAnimal?.instanceIndex || 0) - (rightAnimal?.instanceIndex || 0);
}

function assignFollowerRoles(orderedIds, animalsRef, leader) {
  const followers = orderedIds
    .map((id) => animalsRef.current[id])
    .filter((animal) => animal && animal !== leader)
    .sort(compareQueueLength);

  leader.roleOrder = 0;
  followers.forEach((animal, index) => {
    animal.roleOrder = index + 1;
  });

  return followers;
}

function reassignLeader(orderedIds, animalsRef, nextLeader) {
  orderedIds.forEach((id) => {
    const animal = animalsRef.current[id];
    if (!animal) return;
    animal.isLeadAnt = animal === nextLeader;
  });
  nextLeader.pointTick = 0;
  ensurePointQueue(nextLeader);
  nextLeader.pointQueue.length = 0;
  nextLeader.roleOrder = 0;
  return nextLeader;
}

function updateStoppedState(animal) {
  const wasStopped = isStoppedAnimal(animal);
  const previousX = animal.lastQueueTrackX ?? animal.x;
  const previousY = animal.lastQueueTrackY ?? animal.y;
  const movedDistance = Math.hypot(animal.x - previousX, animal.y - previousY);

  if (movedDistance <= PARAMS.STOPPED_DISTANCE) {
    animal.stoppedFrames = (animal.stoppedFrames || 0) + 1;
  } else {
    animal.stoppedFrames = 0;
  }

  animal.lastQueueTrackX = animal.x;
  animal.lastQueueTrackY = animal.y;
  animal.justResumedFromStop = wasStopped && !isStoppedAnimal(animal);
}

function appendLeaderPointToQueues(orderedIds, animalsRef, point) {
  orderedIds.forEach((id) => {
    const animal = animalsRef.current[id];
    if (!animal) return;
    if (animal.isLeadAnt) return;
    if ((animal.stoppedFrames || 0) >= PARAMS.STOPPED_FRAMES) return;
    ensurePointQueue(animal);
    animal.pointQueue.push({ x: point.x, y: point.y });
  });
}

function steerAnimalTowardDirection(animal, targetDirX, targetDirY, speed) {
  return steerAnimalTowardDirectionWithBlend(
    animal,
    targetDirX,
    targetDirY,
    speed,
    PARAMS.STEER_BLEND,
  );
}

function steerAnimalTowardDirectionWithBlend(
  animal,
  targetDirX,
  targetDirY,
  speed,
  blend,
) {
  const currentDir = normalizeVector(
    animal.vx || targetDirX,
    animal.vy || targetDirY,
  );
  const nextDir = normalizeVector(
    currentDir.x * (1 - blend) + targetDirX * blend,
    currentDir.y * (1 - blend) + targetDirY * blend,
  );
  animal.vx = nextDir.x * speed;
  animal.vy = nextDir.y * speed;
}

function updateAntRotation(animal) {
  ensureHeading(animal);
  const targetHeading = Math.atan2(animal.vy, animal.vx);
  animal.heading = lerpAngleRad(
    animal.heading,
    targetHeading,
    PARAMS.ROTATION_BLEND,
  );
  animal.rotation = lerpAngleDeg(
    animal.rotation,
    (animal.heading * 180) / Math.PI + PARAMS.TOP_VIEW_ROTATION_OFFSET,
    PARAMS.ROTATION_BLEND,
  );
}

function getInsideDirection(animal, rect) {
  const centerX = animal.x + animal.width / 2;
  const centerY = animal.y + animal.height / 2;
  const insideX = clamp(
    centerX,
    PARAMS.OUTSIDE_MARGIN,
    rect.width - PARAMS.OUTSIDE_MARGIN,
  );
  const insideY = clamp(
    centerY,
    PARAMS.OUTSIDE_MARGIN,
    rect.height - PARAMS.OUTSIDE_MARGIN,
  );
  return normalizeVector(insideX - centerX, insideY - centerY);
}

function getLeaderAvoidDirection(animal, rect) {
  const direction = normalizeVector(animal.vx || 1, animal.vy || 0);
  const lookAheadX =
    animal.x + animal.width / 2 + direction.x * PARAMS.WALL_LOOK_AHEAD;
  const lookAheadY =
    animal.y + animal.height / 2 + direction.y * PARAMS.WALL_LOOK_AHEAD;

  let targetX = lookAheadX;
  let targetY = lookAheadY;
  let shouldTurn = false;

  if (lookAheadX < PARAMS.WALL_MARGIN) {
    targetX = PARAMS.OUTSIDE_MARGIN;
    shouldTurn = true;
  } else if (lookAheadX > rect.width - PARAMS.WALL_MARGIN) {
    targetX = rect.width - PARAMS.OUTSIDE_MARGIN;
    shouldTurn = true;
  }

  if (lookAheadY < PARAMS.WALL_MARGIN) {
    targetY = PARAMS.OUTSIDE_MARGIN;
    shouldTurn = true;
  } else if (lookAheadY > rect.height - PARAMS.WALL_MARGIN) {
    targetY = rect.height - PARAMS.OUTSIDE_MARGIN;
    shouldTurn = true;
  }

  if (!shouldTurn) {
    return null;
  }

  return normalizeVector(
    targetX - (animal.x + animal.width / 2),
    targetY - (animal.y + animal.height / 2),
  );
}

function updateLeaderPoints(leader, orderedIds, animalsRef) {
  leader.pointTick = (leader.pointTick || 0) + 1;
  if (leader.pointTick < PARAMS.POINT_INTERVAL) {
    return;
  }

  leader.pointTick = 0;
  appendLeaderPointToQueues(orderedIds, animalsRef, {
    x: leader.x,
    y: leader.y,
  });
}

function updateLeaderStallState(leader) {
  const previousX = leader.lastLeadX ?? leader.x;
  const previousY = leader.lastLeadY ?? leader.y;
  const movedDistance = Math.hypot(leader.x - previousX, leader.y - previousY);

  if (movedDistance <= PARAMS.LEADER_STALL_DISTANCE) {
    leader.stalledLeadFrames = (leader.stalledLeadFrames || 0) + 1;
  } else {
    leader.stalledLeadFrames = 0;
  }

  leader.lastLeadX = leader.x;
  leader.lastLeadY = leader.y;
}

function getQueueSpeed(sharedSpeed, queueLength, roleOrder) {
  const roleTargetQueue = PARAMS.QUEUE_ACCEL_THRESHOLD * Math.max(1, roleOrder);
  const queueDelta = queueLength - roleTargetQueue;
  const speedRatio = clamp(
    1 + queueDelta * PARAMS.QUEUE_ACCEL_PER_POINT,
    PARAMS.QUEUE_DECEL_MIN_RATIO,
    PARAMS.QUEUE_ACCEL_MAX_RATIO,
  );
  return sharedSpeed * speedRatio;
}

function consumeReachedPoint(animal) {
  ensurePointQueue(animal);
  while (animal.pointQueue.length > 0) {
    const nextPoint = animal.pointQueue[0];
    const pointDeltaX = nextPoint.x - animal.x;
    const pointDeltaY = nextPoint.y - animal.y;
    const distance = Math.hypot(pointDeltaX, pointDeltaY);
    if (distance <= PARAMS.POINT_REACHED_DISTANCE) {
      animal.pointQueue.shift();
      continue;
    }

    const forward = normalizeVector(
      animal.vx || Math.cos(animal.heading || 0),
      animal.vy || Math.sin(animal.heading || 0),
    );
    const pointAlignment = pointDeltaX * forward.x + pointDeltaY * forward.y;
    if (pointAlignment < 0) {
      animal.pointQueue.shift();
      continue;
    }

    if (distance > PARAMS.POINT_REACHED_DISTANCE) {
      break;
    }
  }
}

export function initAnt(rect, width, height) {
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
    heading: angle,
    scaleX: 1,
    antType: "ant_walk",
  };
}

export function updateAnt(animal, rect) {
  if (animal.isHome) {
    animal.antType = "ant_top";
    animal.scaleX = 1;
  } else {
    animal.rotation = 0;
    if (Math.abs(animal.vx) > 0.01) {
      animal.scaleX = animal.vx < 0 ? -1 : 1;
    }
    animal.antType = "ant_walk";
    applyWallAvoidance(animal, rect);
  }

  animal.x += animal.vx;
  animal.y += animal.vy;

  if (!animal.isHome) {
    animal.x = Math.max(0, Math.min(rect.width - animal.width, animal.x));
    animal.y = Math.max(0, Math.min(rect.height - animal.height, animal.y));
  }
}

export function applySpriteAnt(el, animal) {
  const sprite = el.querySelector(".sprite_ant");
  if (!sprite) return;

  sprite.style.transform = `rotate(${animal.rotation}deg) scaleX(${animal.scaleX})`;
  if (animal.antType) {
    const nextClassName = "sprite_ant " + animal.antType;
    if (sprite.className !== nextClassName) {
      sprite.className = nextClassName;
    }
  }
}

export function initHomeAnt({
  animal,
  speciesId,
  speciesAnchors,
  width,
  height,
}) {
  animal.isHome = true;
  animal.antType = "ant_top";
  animal.scaleX = 1;
  animal.isLeadAnt = false;
  animal.pointQueue = [];
  animal.pointTick = 0;
  animal.stalledLeadFrames = 0;
  animal.lastLeadX = animal.x;
  animal.lastLeadY = animal.y;
  animal.stoppedFrames = 0;
  animal.justResumedFromStop = false;
  animal.lastQueueTrackX = animal.x;
  animal.lastQueueTrackY = animal.y;

  if (!speciesAnchors[speciesId]) {
    const initialDir = normalizeVector(animal.vx || 1, animal.vy || 0);
    speciesAnchors[speciesId] = {
      x: animal.x,
      y: animal.y,
      dirX: initialDir.x,
      dirY: initialDir.y,
      speed: animal.baseSpeed,
    };
  }

  const anchor = speciesAnchors[speciesId];
  const index = animal.instanceIndex || 0;
  const sharedSpeed = anchor.speed;
  const startGap = Math.max(width, height) * PARAMS.START_GAP_RATIO;

  animal.baseSpeed = sharedSpeed;
  animal.homeSpeed = sharedSpeed;
  animal.x = anchor.x - anchor.dirX * startGap * index;
  animal.y = anchor.y - anchor.dirY * startGap * index;
  animal.vx = anchor.dirX * sharedSpeed;
  animal.vy = anchor.dirY * sharedSpeed;
  animal.heading = Math.atan2(animal.vy, animal.vx);
  animal.rotation = getTopViewRotation(animal.vx, animal.vy);

  if (index === 0) {
    animal.isLeadAnt = true;
  }
  animal.roleOrder = index;
}

export function applyHomeGroupAnt(groupIds, animalsRef, rect) {
  if (groupIds.length < 2) return;

  const orderedIds = getOrderedGroup(groupIds, animalsRef);
  let leader = getLeaderAnimal(orderedIds, animalsRef);
  if (!leader) return;

  const sharedSpeed =
    leader.homeSpeed || leader.baseSpeed || PARAMS.BASE_SPEED_MIN;

  ensurePointQueue(leader);
  leader.pointQueue.length = 0;

  orderedIds.forEach((id) => {
    const animal = animalsRef.current[id];
    if (!animal) return;
    animal.antType = "ant_top";
    animal.scaleX = 1;
    animal.baseSpeed = sharedSpeed;
    animal.homeSpeed = sharedSpeed;
    ensurePointQueue(animal);
    ensureHeading(animal);
    updateStoppedState(animal);
  });

  const resumedFollower = orderedIds.some((id) => {
    const animal = animalsRef.current[id];
    return animal && !animal.isLeadAnt && animal.justResumedFromStop;
  });

  updateLeaderStallState(leader);
  if ((leader.stalledLeadFrames || 0) >= PARAMS.LEADER_STALL_FRAMES) {
    const replacementLeader = orderedIds
      .map((id) => animalsRef.current[id])
      .filter(
        (animal) => animal && animal !== leader && !isStoppedAnimal(animal),
      )
      .sort(compareQueueLength)[0];
    if (replacementLeader) {
      leader = reassignLeader(orderedIds, animalsRef, replacementLeader);
      setSpeed(leader, sharedSpeed);
      leader.stalledLeadFrames = 0;
      leader.lastLeadX = leader.x;
      leader.lastLeadY = leader.y;
    }
  }

  assignFollowerRoles(orderedIds, animalsRef, leader);
  if (resumedFollower) {
    assignFollowerRoles(orderedIds, animalsRef, leader);
  }

  const leaderAvoidDirection = rect
    ? getLeaderAvoidDirection(leader, rect)
    : null;
  const leaderOutside =
    rect &&
    (leader.x < 0 ||
      leader.y < 0 ||
      leader.x > rect.width - leader.width ||
      leader.y > rect.height - leader.height);

  if (leaderOutside || leaderAvoidDirection) {
    const insideDir = leaderOutside
      ? getInsideDirection(leader, rect)
      : leaderAvoidDirection;
    steerAnimalTowardDirectionWithBlend(
      leader,
      insideDir.x,
      insideDir.y,
      sharedSpeed,
      PARAMS.LEADER_RETURN_BLEND,
    );
  } else {
    setSpeed(leader, sharedSpeed);
  }
  updateAntRotation(leader);
  updateLeaderPoints(leader, orderedIds, animalsRef);

  orderedIds.forEach((id) => {
    const animal = animalsRef.current[id];
    if (!animal || animal.isLeadAnt) return;

    consumeReachedPoint(animal);
    const nextPoint = animal.pointQueue[0];
    const targetSpeed = getQueueSpeed(
      sharedSpeed,
      animal.pointQueue.length,
      getRoleOrder(animal),
    );

    if (nextPoint) {
      const targetDir = normalizeVector(
        nextPoint.x - animal.x,
        nextPoint.y - animal.y,
      );
      steerAnimalTowardDirection(animal, targetDir.x, targetDir.y, targetSpeed);
    } else {
      const leaderDir = normalizeVector(leader.vx || 1, leader.vy || 0);
      steerAnimalTowardDirection(animal, leaderDir.x, leaderDir.y, targetSpeed);
    }

    updateAntRotation(animal);
  });
}

export default {
  init: initAnt,
  update: updateAnt,
  applySprite: applySpriteAnt,
  homeInit: initHomeAnt,
  homeGroup: applyHomeGroupAnt,
};
