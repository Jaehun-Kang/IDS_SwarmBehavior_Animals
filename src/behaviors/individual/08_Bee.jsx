// 꿀벌 - 중간 속도, 파동 움직임
export function initBee(rect, width, height) {
  const speed = Math.random() * 1 + 2;
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
  };
}

export function updateBee(animal, rect) {
  animal.vy = Math.sin(animal.time * 0.1) * 2;

  animal.rotation = 0;
  if (Math.abs(animal.vx) > 0.01) animal.scaleX = animal.vx < 0 ? -1 : 1;
  animal.beeType = "bee_fly";

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

export function applySpriteBee(el, animal) {
  const sprite = el.querySelector(".sprite_bee");
  if (!sprite) return;
  sprite.style.transform = `rotate(${animal.rotation}deg) scaleX(${animal.scaleX})`;
  if (animal.beeType) {
    const next = "sprite_bee " + animal.beeType;
    if (sprite.className !== next) sprite.className = next;
  }
}

export default {
  init: initBee,
  update: updateBee,
  applySprite: applySpriteBee,
};
