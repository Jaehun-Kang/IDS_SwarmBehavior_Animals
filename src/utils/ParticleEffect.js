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

  wrapText(text, offsetY = 0) {
    if (!this.context) {
      return;
    }

    this.context.fillStyle = "oklch(0.4777 0.0208 81.25)";
    this.context.font = `bold ${this.fontSize}px Playfair`;
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";

    const y = this.textY + offsetY;
    this.context.fillText(text, this.textX, y);
    this.convertToParticles();
  }

  convertToParticles() {
    if (!this.context) {
      return;
    }

    const pixels = this.context.getImageData(
      0,
      0,
      this.canvasWidth,
      this.canvasHeight,
    );
    const data = pixels.data;

    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

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
