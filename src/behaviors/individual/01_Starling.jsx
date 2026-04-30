// 찌르레기
export function initStarling(rect, width, height) {
  const speed = Math.random() * 2 + 3; // 3~5
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

  if (animal.vy < 0) {
    animal.flyType = "starling_fly1";
    if (animal.flyTypeLock) {
      animal.flyTypeLock = false;
    }
  } else {
    if (!animal.flyTypeLock) {
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

  // 벽 충돌 감지
  if (animal.x <= 0 || animal.x + animal.width >= rect.width) {
    animal.vx *= -1;
    animal.x = Math.max(0, Math.min(rect.width - animal.width, animal.x));
  }
  if (animal.y <= 0 || animal.y + animal.height >= rect.height) {
    animal.vy *= -1;
    animal.y = Math.max(0, Math.min(rect.height - animal.height, animal.y));
  }
}

export function applySpriteStarling(el, animal) {
  const sprite = el.querySelector(".sprite_starling");
  if (!sprite) return;

  const scaleX = animal.scaleX !== undefined ? animal.scaleX : 1;
  sprite.style.transform = `rotate(${animal.rotation}deg) scaleX(${scaleX})`;

  if (animal.flyType) {
    sprite.className = "sprite_starling " + animal.flyType;
  }
}

export default {
  init: initStarling,
  update: updateStarling,
  applySprite: applySpriteStarling,
};
