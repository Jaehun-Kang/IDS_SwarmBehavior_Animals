// 크릴 - 빠른 속도, 직선 움직임
export function initKrill(rect, width, height) {
  const speed = Math.random() * 1.5 + 2.5;
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
    krillType: "krill_swim",
  };
}

export function updateKrill(animal, rect) {
  animal.rotation = 0;
  if (Math.abs(animal.vx) > 0.01) animal.scaleX = animal.vx < 0 ? -1 : 1;
  animal.krillType = "krill_swim";

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

export function applySpriteKrill(el, animal) {
  const sprite = el.querySelector(".sprite_krill");
  if (!sprite) return;
  sprite.style.transform = `rotate(${animal.rotation}deg) scaleX(${animal.scaleX})`;
  if (animal.krillType) {
    const next = "sprite_krill " + animal.krillType;
    if (sprite.className !== next) sprite.className = next;
  }
}

export default {
  init: initKrill,
  update: updateKrill,
  applySprite: applySpriteKrill,
};
