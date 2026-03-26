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
  };
}

export function updateFirefly(animal, rect) {
  // 우아한 움직임: 일정 주기마다 천천히 방향 변경
  if (animal.time % 60 === 0) {
    const angle = Math.random() * Math.PI * 2;
    animal.vx = Math.cos(angle) * animal.baseSpeed;
    animal.vy = Math.sin(angle) * animal.baseSpeed;
  }

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

export default { init: initFirefly, update: updateFirefly };
