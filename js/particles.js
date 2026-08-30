/**
 * Canvas Particle & Confetti FX Engine
 * Triggers colorful celebration bursts upon game victory.
 */

class ParticleEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  triggerVictoryConfetti(winnerColor) {
    if (!this.canvas) return;

    this.particles = [];
    const particleCount = 120;
    const colors = winnerColor === 'X' 
      ? ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#10b981', '#fbbf24']
      : ['#e11d48', '#f43f5e', '#fb7185', '#fda4af', '#10b981', '#fbbf24'];

    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
        y: window.innerHeight * 0.45 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 0.8) * 18 - 4,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        gravity: 0.35,
        drag: 0.98,
        shape: Math.random() > 0.5 ? 'rect' : 'circle'
      });
    }

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.animate();
  }

  animate() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let activeParticles = 0;

    for (let p of this.particles) {
      if (p.opacity <= 0.01) continue;

      p.vx *= p.drag;
      p.vy *= p.drag;
      p.vy += p.gravity;

      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rSpeed;
      p.opacity -= 0.008;

      if (p.opacity > 0) {
        activeParticles++;
        this.ctx.save();
        this.ctx.globalAlpha = Math.max(0, p.opacity);
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
        } else {
          this.ctx.beginPath();
          this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          this.ctx.fill();
        }

        this.ctx.restore();
      }
    }

    if (activeParticles > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

window.particleEngine = new ParticleEngine('confetti-canvas');
