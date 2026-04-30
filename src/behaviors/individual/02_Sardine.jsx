// 정어리 - 중간 속도, 직선 움직임
export function initSardine(rect, width, height) {
  const speed = Math.random() * 1.5 + 2;
  // 주로 수평으로 이동 (±30° 이내)
  const hAngle = (Math.random() - 0.5) * (Math.PI / 3);
  const dir = Math.random() < 0.5 ? 0 : Math.PI;
  const angle = dir + hAngle;
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
    swimType: "sardine_swim1",
  };
}

export function updateSardine(animal, rect) {
  const rawAngle = Math.atan2(animal.vy, animal.vx);
  const absCos = Math.abs(Math.cos(rawAngle)); // 수평 성분
  const absSin = Math.abs(Math.sin(rawAngle)); // 수직 성분

  if (absCos >= absSin) {
    // 수평 움직임 우세 → 측면 (1 프레임)
    let rotation = (rawAngle * 180) / Math.PI;
    let scaleX = 1;
    if (Math.abs(rotation) > 90) {
      scaleX = -1;
      rotation = rotation > 0 ? rotation - 180 : rotation + 180;
    }
    animal.rotation = rotation;
    animal.scaleX = scaleX;
    animal.swimType = "sardine_swim1";
  } else if (animal.vy > 0) {
    // 아래 방향 → 정면 (2 프레임)
    animal.rotation = 0;
    animal.scaleX = 1;
    animal.swimType = "sardine_swim2";
  } else {
    // 위 방향 → 후면 (3 프레임)
    animal.rotation = 0;
    animal.scaleX = 1;
    animal.swimType = "sardine_swim3";
  }

  // 위치 업데이트
  animal.x += animal.vx;
  animal.y += animal.vy;

  // 벽 충돌 감지 — 반사 후 수직 성분을 수평 성분의 50% 이하로 억제
  if (animal.x <= 0 || animal.x + animal.width >= rect.width) {
    animal.vx *= -1;
    animal.x = Math.max(0, Math.min(rect.width - animal.width, animal.x));
    // 수직 과다 시 감쇠
    if (Math.abs(animal.vy) > Math.abs(animal.vx) * 0.5) {
      animal.vy *= 0.4;
    }
  }
  if (animal.y <= 0 || animal.y + animal.height >= rect.height) {
    animal.vy *= -1;
    animal.y = Math.max(0, Math.min(rect.height - animal.height, animal.y));
    // 수직 과다 시 감쇠
    if (Math.abs(animal.vy) > Math.abs(animal.vx) * 0.5) {
      animal.vy *= 0.4;
    }
  }
}

export function applySpriteSardine(el, animal) {
  const sprite = el.querySelector(".sprite_sardine");
  if (!sprite) return;

  const scaleX = animal.scaleX !== undefined ? animal.scaleX : 1;
  sprite.style.transform = `rotate(${animal.rotation}deg) scaleX(${scaleX})`;

  if (animal.swimType) {
    const next = "sprite_sardine " + animal.swimType;
    if (sprite.className !== next) sprite.className = next;
  }
}

export default {
  init: initSardine,
  update: updateSardine,
  applySprite: applySpriteSardine,
};
