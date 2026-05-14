class Particle {
  constructor(effect, x, y, color, startX = null, startY = null) {
    this.effect = effect;
    this.x = startX ?? Math.random() * this.effect.canvasWidth;
    this.y = startY ?? Math.random() * this.effect.canvasHeight;
    this.color = color;
    this.originX = x;
    this.originY = y;
    this.size = this.effect.gap;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
    this.friction = Math.random() * 0.5 + 0.25;
    this.ease = 0.045;
    this.opacity = 1;
    this.targetOpacity = 1;
  }

  setTarget(x, y, color, targetOpacity = 1) {
    this.originX = x;
    this.originY = y;
    this.color = color;
    this.targetOpacity = targetOpacity;
  }

  isSettled(
    positionTolerance = 0.8,
    velocityTolerance = 0.08,
    opacityTolerance = 0.03,
  ) {
    const dx = this.originX - this.x;
    const dy = this.originY - this.y;
    const speed = Math.hypot(this.vx, this.vy);
    const opacityDelta = Math.abs(this.targetOpacity - this.opacity);

    return (
      Math.abs(dx) <= positionTolerance &&
      Math.abs(dy) <= positionTolerance &&
      speed <= velocityTolerance &&
      opacityDelta <= opacityTolerance
    );
  }

  draw() {
    if (!this.effect || !this.effect.context) {
      return;
    }

    this.effect.context.globalAlpha = this.opacity;
    this.effect.context.fillStyle = this.color;
    this.effect.context.fillRect(this.x, this.y, this.size, this.size);
    this.effect.context.globalAlpha = 1;
  }

  update() {
    if (!this.effect) {
      return;
    }

    // 목표 복귀
    this.x += (this.originX - this.x) * this.ease;
    this.y += (this.originY - this.y) * this.ease;

    // 마우스 회피
    if (this.effect.mouseRepulsionEnabled) {
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
    }

    // 속도 적용
    this.x += this.vx;
    this.y += this.vy;

    // 마찰력
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.opacity += (this.targetOpacity - this.opacity) * 0.12;

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
    this.mouseRepulsionEnabled = true;
  }

  setSize(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.textX = this.canvasWidth / 2;
    this.textY = this.canvasHeight / 2 - 80;
    this.fontSize = this.canvasHeight * 0.12;
  }

  setMouseListener(callback) {
    this.mouseListener = (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      if (callback) callback();
    };
    window.addEventListener("mousemove", this.mouseListener);
  }

  setMouseRepulsionEnabled(enabled) {
    this.mouseRepulsionEnabled = enabled;
  }

  isFontReady(fontStr) {
    const test = document.createElement("canvas");
    test.width = 60;
    test.height = 60;
    const testCtx = test.getContext("2d");
    if (!testCtx) {
      return false;
    }

    testCtx.font = fontStr;
    testCtx.fillStyle = "#000";
    testCtx.fillText("S", 5, 45);
    const testData = testCtx.getImageData(0, 0, 60, 60).data;
    return testData.some((value, index) => index % 4 === 3 && value > 0);
  }

  setText(lines, retries = 20) {
    if (!this.context) {
      return;
    }

    const defaultFont = `bold ${this.fontSize}px Playfair`;
    if (!this.isFontReady(defaultFont)) {
      if (retries > 0) {
        requestAnimationFrame(() => this.setText(lines, retries - 1));
      }
      return;
    }

    const offscreen = document.createElement("canvas");
    offscreen.width = this.canvasWidth;
    offscreen.height = this.canvasHeight;
    const offCtx = offscreen.getContext("2d");
    if (!offCtx) {
      return;
    }

    offCtx.fillStyle = "oklch(0.4777 0.0208 81.25)";
    offCtx.textAlign = "center";
    offCtx.textBaseline = "middle";

    lines.forEach(({ text, offsetY = 0, fontSize = this.fontSize }) => {
      offCtx.font = `bold ${fontSize}px Playfair`;
      offCtx.fillText(text, this.textX, this.textY + offsetY);
    });

    const targets = this.extractParticleTargets(offCtx);
    this.morphToTargets(targets);
  }

  wrapText(text, offsetY = 0, _retries = 20) {
    if (!this.context) {
      return;
    }

    const fontStr = `bold ${this.fontSize}px Playfair`;

    // 소형 테스트 캔버스로 폰트 래스터화 여부 확인
    const fontReady = this.isFontReady(fontStr);

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

  extractParticleTargets(sourceCtx) {
    const ctx = sourceCtx || this.context;
    if (!ctx) {
      return [];
    }

    const pixels = ctx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
    const data = pixels.data;
    const targets = [];

    for (let y = 0; y < this.canvasHeight; y += this.gap) {
      for (let x = 0; x < this.canvasWidth; x += this.gap) {
        const index = (y * this.canvasWidth + x) * 4;
        const alpha = data[index + 3];

        if (alpha > 0) {
          targets.push({
            x,
            y,
            color: "oklch(0.4777 0.0208 81.25)",
          });
        }
      }
    }

    return targets;
  }

  convertToParticles(sourceCtx) {
    const targets = this.extractParticleTargets(sourceCtx);
    targets.forEach(({ x, y, color }) => {
      this.particles.push(new Particle(this, x, y, color));
    });
  }

  shuffleTargets(targets) {
    const shuffled = [...targets];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [
        shuffled[swapIndex],
        shuffled[index],
      ];
    }
    return shuffled;
  }

  morphToTargets(targets) {
    const shuffledTargets = this.shuffleTargets(targets);
    const activeTargets = shuffledTargets.length;
    if (activeTargets === 0) {
      return;
    }

    const reusableCount = Math.min(this.particles.length, activeTargets);

    for (let index = 0; index < reusableCount; index += 1) {
      const target = shuffledTargets[index];
      this.particles[index].setTarget(target.x, target.y, target.color, 1);
    }

    if (activeTargets > this.particles.length) {
      for (
        let index = this.particles.length;
        index < activeTargets;
        index += 1
      ) {
        const target = shuffledTargets[index];
        this.particles.push(
          new Particle(
            this,
            target.x,
            target.y,
            target.color,
            this.textX,
            this.textY,
          ),
        );
      }
    }

    for (let index = activeTargets; index < this.particles.length; index += 1) {
      const target = shuffledTargets[index % activeTargets];
      this.particles[index].setTarget(target.x, target.y, target.color, 1);
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

  isTextSettled(
    positionTolerance = 0.8,
    velocityTolerance = 0.08,
    opacityTolerance = 0.03,
  ) {
    return (
      this.particles.length > 0 &&
      this.particles.every((particle) =>
        particle.isSettled(
          positionTolerance,
          velocityTolerance,
          opacityTolerance,
        ),
      )
    );
  }

  isTextMostlySettled(
    positionTolerance = 2.4,
    velocityTolerance = 0.22,
    opacityTolerance = 0.08,
    settledRatio = 0.82,
  ) {
    if (this.particles.length === 0) {
      return false;
    }

    const settledCount = this.particles.filter((particle) =>
      particle.isSettled(
        positionTolerance,
        velocityTolerance,
        opacityTolerance,
      ),
    ).length;

    return settledCount / this.particles.length >= settledRatio;
  }

  isTextReadyForSubtitle(positionTolerance = 5.5, readyRatio = 0.25) {
    if (this.particles.length === 0) {
      return false;
    }

    const readyCount = this.particles.filter((particle) => {
      const dx = particle.originX - particle.x;
      const dy = particle.originY - particle.y;
      return Math.hypot(dx, dy) <= positionTolerance;
    }).length;

    return readyCount / this.particles.length >= readyRatio;
  }

  cleanup() {
    if (this.mouseListener) {
      window.removeEventListener("mousemove", this.mouseListener);
    }
    this.particles = [];
    this.context = null;
  }
}
