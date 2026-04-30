// 개미 - 느린 속도, 직선 움직임
export function initAnt(rect, width, height) {
  const speed = Math.random() * 1 + 0.5;
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
    antType: "ant_walk",
  };
}

export function updateAnt(animal, rect) {
  animal.rotation = 0;
  if (Math.abs(animal.vx) > 0.01) animal.scaleX = animal.vx < 0 ? -1 : 1;
  animal.antType = "ant_walk";

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

export function applySpriteAnt(el, animal) {
  const sprite = el.querySelector(".sprite_ant");
  if (!sprite) return;
  sprite.style.transform = `rotate(${animal.rotation}deg) scaleX(${animal.scaleX})`;
  if (animal.antType) {
    const next = "sprite_ant " + animal.antType;
    if (sprite.className !== next) sprite.className = next;
  }
}

export default {
  init: initAnt,
  update: updateAnt,
  applySprite: applySpriteAnt,
};
