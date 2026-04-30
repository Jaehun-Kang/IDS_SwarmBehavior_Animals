// 반딧불이 - 느린 속도, 우아한 움직임 (천천히 방향 변경)
export function initFirefly(rect, width, height) {
  const speed = Math.random() * 1 + 1.5;
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
  if (animal.time % 60 === 0) {
    const angle = Math.random() * Math.PI * 2;
    animal.vx = Math.cos(angle) * animal.baseSpeed;
    animal.vy = Math.sin(angle) * animal.baseSpeed;
  }

  // 불빛: 60프레임 켜집, 60프레임 꺼집
  const glow = Math.floor(animal.time / 60) % 2 === 0;

  animal.rotation = 0;
  if (Math.abs(animal.vx) > 0.01) animal.scaleX = animal.vx < 0 ? -1 : 1;
  animal.fireflyType = glow ? "firefly_glow" : "firefly_dark";

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

export default {
  init: initFirefly,
  update: updateFirefly,
  applySprite: applySpriteFirefly,
};
