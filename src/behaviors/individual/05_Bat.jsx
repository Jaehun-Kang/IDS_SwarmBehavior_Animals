// 박쥐 - 빠른 속도, 지그재그 움직임
export function initBat(rect, width, height) {
  const speed = Math.random() * 2 + 3;
  const angle = Math.random() * Math.PI * 2;
  return {
    x: Math.random() * (rect.width - width),
    y: Math.random() * (rect.height - height),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    baseVy: Math.sin(angle) * speed,
    baseSpeed: speed,
    width,
    height,
    pattern: "zigzag",
    time: 0,
    rotation: 0,
    scaleX: 1,
  };
}

export function updateBat(animal, rect) {
  const rawAngle = Math.atan2(animal.vy, animal.vx);
  let rotation = (rawAngle * 180) / Math.PI;
  let scaleX = 1;
  if (Math.abs(rotation) > 90) {
    scaleX = -1;
    rotation = rotation > 0 ? rotation - 180 : rotation + 180;
  }
  animal.rotation = rotation;
  animal.scaleX = scaleX;

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

export function applySpriteBat(el, animal) {
  const sprite = el.querySelector(".sprite_bat");
  if (!sprite) return;
  sprite.style.transform = `rotate(${animal.rotation}deg) scaleX(${animal.scaleX})`;
  if (sprite.className !== "sprite_bat bat_fly")
    sprite.className = "sprite_bat bat_fly";
}

export default {
  init: initBat,
  update: updateBat,
  applySprite: applySpriteBat,
};
