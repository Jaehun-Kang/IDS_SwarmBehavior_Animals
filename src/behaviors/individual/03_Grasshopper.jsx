// 메뚜기 - 포물선 호핑 움직임
export function initGrasshopper(rect, width, height) {
  const startX = Math.random() * (rect.width - width);
  const startY = Math.random() * (rect.height - height);

  return {
    x: startX,
    y: startY,
    vx: 0,
    vy: 0,
    width,
    height,
    time: 0,
    baseY: startY,
    jumpStartX: startX,
    jumpStartY: startY,
    jumpTargetX: startX,
    jumpTargetY: startY,
    jumpHeight: 80,
    // 스프라이트 상태
    rotation: 0,
    scaleX: 1,
    spriteType: "grasshopper_idle",
    jumpDirX: 1,
    jumpDirY: 0,
  };
}

export function updateGrasshopper(animal, rect) {
  const jumpCycle = 60 * 3;
  const jumpAnimationTime = 60 * 0.5;
  const phaseInCycle = animal.time % jumpCycle;

  const minX = 0;
  const maxX = rect.width - animal.width;
  const minY = 0;
  const maxY = rect.height - animal.height;

  // 새 점프 목표 설정
  if (animal.time % jumpCycle === 0) {
    animal.jumpStartX = animal.x;
    animal.jumpStartY = animal.y;
    animal.baseY = animal.y;

    const maxRadius = 250;
    const angle = Math.random() * Math.PI * 2;
    let targetX = animal.x + Math.cos(angle) * maxRadius;
    let targetY = animal.baseY + Math.sin(angle) * maxRadius;

    animal.jumpTargetX = Math.max(minX, Math.min(maxX, targetX));
    animal.jumpTargetY = Math.max(minY, Math.min(maxY, targetY));

    animal.jumpDirX = animal.jumpTargetX - animal.jumpStartX;
    animal.jumpDirY = animal.jumpTargetY - animal.jumpStartY;
  }

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
    animal.spriteType = "grasshopper_idle";
  }

  // 회전 계산 (측면 뷰일 때만)
  const sideTypes = ["grasshopper_idle", "grasshopper_jump", "grasshopper_fly"];
  if (
    sideTypes.includes(animal.spriteType) &&
    (animal.jumpDirX !== 0 || animal.jumpDirY !== 0)
  ) {
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

export default {
  init: initGrasshopper,
  update: updateGrasshopper,
  applySprite: applySpriteGrasshopper,
};
