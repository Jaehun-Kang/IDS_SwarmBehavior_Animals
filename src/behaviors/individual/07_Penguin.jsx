// 펜규인 - 느린 속도, 직선 움직임
export function initPenguin(rect, width, height) {
  const speed = Math.random() * 1 + 1;
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
  };
}

export function updatePenguin(animal, rect) {
  animal.rotation = 0;
  if (Math.abs(animal.vx) > 0.01) animal.scaleX = animal.vx < 0 ? -1 : 1;
  animal.penguinType = "penguin_walk";

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

export function applySpritePenguin(el, animal) {
  const sprite = el.querySelector(".sprite_penguin");
  if (!sprite) return;
  sprite.style.transform = `rotate(${animal.rotation}deg) scaleX(${animal.scaleX})`;
  if (animal.penguinType)
    if (animal.penguinType) {
      const next = "sprite_penguin " + animal.penguinType;
      if (sprite.className !== next) sprite.className = next;
    }
}

export default {
  init: initPenguin,
  update: updatePenguin,
  applySprite: applySpritePenguin,
};
