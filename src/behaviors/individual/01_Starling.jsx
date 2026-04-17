// 찌르레기 - 빠른 속도, 직선 움직임
export function initStarling(rect, width, height) {
  const speed = Math.random() * 2 + 3;
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
    flyType: "starling_fly1",
    flyTypeLock: true,
  };
}

export function updateStarling(animal, rect) {
  // uniform 패턴: 직진 움직임만

  // 진행 방향 벡터(vx, vy)의 각도 계산 (라디안 -> 도 변환)
  let rotation = (Math.atan2(animal.vy, animal.vx) * 180) / Math.PI;
  let scaleX = 1;

  // x축 음의 방향(왼쪽)으로 가면 x축, y축 반사
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
      animal.flyType = Math.random() > 0.5 ? "starling_fly2" : "starling_fly3";
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

export default { init: initStarling, update: updateStarling };
