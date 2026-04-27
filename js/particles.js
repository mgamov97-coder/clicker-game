// ===== CANVAS PARTICLE SYSTEM =====
const canvas = document.getElementById('particles-canvas');
const ctx    = canvas.getContext('2d');

let W = 0, H = 0;
const bgParticles = [];
const clickParticles = [];

function resizeCanvas() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Фоновые плавающие частицы
function spawnBgParticle() {
  bgParticles.push({
    x:     Math.random() * W,
    y:     H + 10,
    vx:    (Math.random() - 0.5) * 0.4,
    vy:    -(0.3 + Math.random() * 0.6),
    size:  1 + Math.random() * 2,
    alpha: 0.1 + Math.random() * 0.4,
    hue:   260 + Math.random() * 60,   // фиолетово-синий диапазон
    life:  1,
    decay: 0.0008 + Math.random() * 0.001,
  });
}

// Частицы при клике
function spawnClickParticles(x, y, count) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const speed = 2 + Math.random() * 4;
    clickParticles.push({
      x, y,
      vx:    Math.cos(angle) * speed,
      vy:    Math.sin(angle) * speed - 2,
      size:  2 + Math.random() * 3,
      alpha: 1,
      hue:   270 + Math.random() * 60,
      life:  1,
      decay: 0.03 + Math.random() * 0.03,
    });
  }
}

// Частицы-искры при покупке (золотые)
function spawnBuyParticles(x, y) {
  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 3;
    clickParticles.push({
      x, y,
      vx:    Math.cos(angle) * speed,
      vy:    Math.sin(angle) * speed - 1,
      size:  1.5 + Math.random() * 2,
      alpha: 1,
      hue:   40 + Math.random() * 20,  // золото
      life:  1,
      decay: 0.025 + Math.random() * 0.02,
    });
  }
}

let bgSpawnTimer = 0;

function animateParticles(dt) {
  ctx.clearRect(0, 0, W, H);

  // Спавним фоновые частицы
  bgSpawnTimer += dt;
  if (bgSpawnTimer > 0.12) {
    spawnBgParticle();
    bgSpawnTimer = 0;
  }

  // Фоновые
  for (let i = bgParticles.length - 1; i >= 0; i--) {
    const p = bgParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= p.decay;
    if (p.life <= 0 || p.y < -20) { bgParticles.splice(i, 1); continue; }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.alpha * p.life})`;
    ctx.fill();
  }

  // Кликовые
  for (let i = clickParticles.length - 1; i >= 0; i--) {
    const p = clickParticles[i];
    p.x  += p.vx;
    p.y  += p.vy;
    p.vy += 0.1; // гравитация
    p.life -= p.decay;
    if (p.life <= 0) { clickParticles.splice(i, 1); continue; }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, ${p.life})`;
    ctx.shadowBlur  = 6;
    ctx.shadowColor = `hsla(${p.hue}, 90%, 60%, 0.8)`;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
