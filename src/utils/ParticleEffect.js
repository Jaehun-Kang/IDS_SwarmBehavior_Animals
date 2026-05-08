class Particle {
  constructor(effect, x, y, color) {
    this.effect = effect;
    this.x = Math.random() * this.effect.canvasWidth;
    this.y = Math.random() * this.effect.canvasHeight;
    this.color = color;
    this.originX = x;
    this.originY = y;
    this.size = this.effect.gap;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
    this.friction = Math.random() * 0.5 + 0.25;
    this.ease = 0.045;
  }

  draw() {
    if (!this.effect || !this.effect.context) {
      return;
    }

    this.effect.context.fillStyle = this.color;
    this.effect.context.fillRect(this.x, this.y, this.size, this.size);
  }

  update() {
    if (!this.effect) {
      return;
    }

    // 목표 복귀
    this.x += (this.originX - this.x) * this.ease;
    this.y += (this.originY - this.y) * this.ease;

    // 마우스 회피
    const dx = this.x - this.effect.mouse.x;
    const dy = this.y - this.effect.mouse.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const forceDirectionX = dx / distance;
    const forceDirectionY = dy / distance;

    const force =
      (this.effect.mouse.radius - distance) / this.effect.mouse.radius;

    if (distance < this.effect.mouse.radius) {
      const xForce = forceDirectionX * force * this.effect.mouse.force;
      const yForce = forceDirectionY * force * this.effect.mouse.force;

      this.vx += xForce;
      this.vy += yForce;
    }

    // 속도 적용
    this.x += this.vx;
    this.y += this.vy;

    // 마찰력
    this.vx *= this.friction;
    this.vy *= this.friction;

    // 경계 처리
    if (this.x < 0 || this.x > this.effect.canvasWidth) this.vx *= -1;
    if (this.y < 0 || this.y > this.effect.canvasHeight) this.vy *= -1;

    this.x = Math.max(0, Math.min(this.effect.canvasWidth, this.x));
    this.y = Math.max(0, Math.min(this.effect.canvasHeight, this.y));
  }
}

export class Effect {
  constructor(context, canvasWidth, canvasHeight) {
    this.context = context;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.textX = this.canvasWidth / 2;
    this.textY = this.canvasHeight / 2 - 80;
    this.fontSize = this.canvasHeight * 0.12;
    this.gap = 2;
    this.particles = [];
    this.mouse = {
      radius: 300,
      force: 5,
      x: 0,
      y: 0,
    };
  }

  setMouseListener(callback) {
    this.mouseListener = (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      if (callback) callback();
    };
    window.addEventListener("mousemove", this.mouseListener);
  }

  wrapText(text, offsetY = 0, _retries = 20) {
    if (!this.context) {
      return;
    }

    const fontStr = `bold ${this.fontSize}px Playfair`;

    // 소형 테스트 캔버스로 폰트 래스터화 여부 확인
    const test = document.createElement("canvas");
    test.width = 60;
    test.height = 60;
    const testCtx = test.getContext("2d");
    testCtx.font = fontStr;
    testCtx.fillStyle = "#000";
    testCtx.fillText("S", 5, 45);
    const testData = testCtx.getImageData(0, 0, 60, 60).data;
    const fontReady = testData.some((v, i) => i % 4 === 3 && v > 0);

    // 폰트 미준비 시 재시도
    if (!fontReady) {
      if (_retries > 0) {
        requestAnimationFrame(() => this.wrapText(text, offsetY, _retries - 1));
      }
      return;
    }

    // 오프스크린 캔버스에서 텍스트 픽셀 추출
    const offscreen = document.createElement("canvas");
    offscreen.width = this.canvasWidth;
    offscreen.height = this.canvasHeight;
    const offCtx = offscreen.getContext("2d");

    offCtx.fillStyle = "oklch(0.4777 0.0208 81.25)";
    offCtx.font = fontStr;
    offCtx.textAlign = "center";
    offCtx.textBaseline = "middle";
    offCtx.fillText(text, this.textX, this.textY + offsetY);

    this.convertToParticles(offCtx);
  }

  convertToParticles(sourceCtx) {
    const ctx = sourceCtx || this.context;
    if (!ctx) {
      return;
    }

    const pixels = ctx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
    const data = pixels.data;

    for (let y = 0; y < this.canvasHeight; y += this.gap) {
      for (let x = 0; x < this.canvasWidth; x += this.gap) {
        const index = (y * this.canvasWidth + x) * 4;
        const alpha = data[index + 3];

        if (alpha > 0) {
          const color = `oklch(0.4777 0.0208 81.25)`;
          this.particles.push(new Particle(this, x, y, color));
        }
      }
    }
  }

  render() {
    if (!this.context) {
      return;
    }

    this.particles.forEach((particle) => {
      particle.update();
      particle.draw();
    });
  }

  cleanup() {
    if (this.mouseListener) {
      window.removeEventListener("mousemove", this.mouseListener);
    }
    this.particles = [];
    this.context = null;
  }
}
