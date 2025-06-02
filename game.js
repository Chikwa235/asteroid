const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");
const gameOverDisplay = document.getElementById("gameOver");
const restartBtn = document.getElementById("restartBtn");

const shootSound = document.getElementById("shootSound");
const explodeSound = document.getElementById("explodeSound");

let score = 0;
let isGameOver = false;

const ship = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 15,
  angle: 0,
  velocity: { x: 0, y: 0 },
  shooting: false,
  accelerating: false,
};

let bullets = [];
let asteroids = [];
let particles = [];

function createAsteroidFarFromShip(size = 40) {
  let x, y;

  const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
  switch (edge) {
    case 0: // Top
      x = Math.random() * canvas.width;
      y = -size;
      break;
    case 1: // Right
      x = canvas.width + size;
      y = Math.random() * canvas.height;
      break;
    case 2: // Bottom
      x = Math.random() * canvas.width;
      y = canvas.height + size;
      break;
    case 3: // Left
      x = -size;
      y = Math.random() * canvas.height;
      break;
  }

  return {
    x,
    y,
    size,
    dx: (Math.random() - 0.5) * 2,
    dy: (Math.random() - 0.5) * 2
  };
}

function createParticles(x, y, count = 15) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x,
      y,
      dx: (Math.random() - 0.5) * 4,
      dy: (Math.random() - 0.5) * 4,
      life: 50
    });
  }
}

function shootBullet() {
  shootSound.currentTime = 0;
  shootSound.play();
  bullets.push({
    x: ship.x + Math.cos(ship.angle) * ship.radius,
    y: ship.y + Math.sin(ship.angle) * ship.radius,
    dx: Math.cos(ship.angle) * 5,
    dy: Math.sin(ship.angle) * 5
  });
}

function initAsteroids() {
  asteroids = [];
  for (let i = 0; i < 5; i++) {
    asteroids.push(createAsteroidFarFromShip());
  }
}

const keys = {};
document.addEventListener("keydown", (e) => {
  keys[e.code] = true;
});
document.addEventListener("keyup", (e) => keys[e.code] = false);

restartBtn.addEventListener("click", restartGame);

function checkAsteroidCollisions() {
  for (let i = 0; i < asteroids.length; i++) {
    for (let j = i + 1; j < asteroids.length; j++) {
      const a1 = asteroids[i];
      const a2 = asteroids[j];
      const dist = Math.hypot(a1.x - a2.x, a1.y - a2.y);
      if (dist < a1.size + a2.size) {
        const angle = Math.atan2(a2.y - a1.y, a2.x - a1.x);
        const speed = 1;
        a1.dx = -Math.cos(angle) * speed;
        a1.dy = -Math.sin(angle) * speed;
        a2.dx = Math.cos(angle) * speed;
        a2.dy = Math.sin(angle) * speed;
      }
    }
  }
}

function update() {
  if (isGameOver) return;

  if (keys["ArrowLeft"]) ship.angle -= 0.05;
  if (keys["ArrowRight"]) ship.angle += 0.05;

  ship.accelerating = false;
  if (keys["ArrowUp"]) {
    ship.velocity.x += Math.cos(ship.angle) * 0.1;
    ship.velocity.y += Math.sin(ship.angle) * 0.1;
    ship.accelerating = true;
  }

  if (keys["Space"] && !ship.shooting) {
    shootBullet();
    ship.shooting = true;
  }
  if (!keys["Space"]) ship.shooting = false;

  ship.x += ship.velocity.x;
  ship.y += ship.velocity.y;
  ship.x = Math.max(ship.radius, Math.min(canvas.width - ship.radius, ship.x));
  ship.y = Math.max(ship.radius, Math.min(canvas.height - ship.radius, ship.y));

  bullets.forEach((b, i) => {
    b.x += b.dx;
    b.y += b.dy;
    if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) bullets.splice(i, 1);
  });

  asteroids.forEach((a, ai) => {
    a.x += a.dx;
    a.y += a.dy;

    const distToShip = Math.hypot(ship.x - a.x, ship.y - a.y);
    if (distToShip < ship.radius + a.size) {
      isGameOver = true;
      gameOverDisplay.style.display = "block";
      restartBtn.style.display = "inline-block";
      explodeSound.currentTime = 0;
      explodeSound.play();
      createParticles(ship.x, ship.y, 30);
      return;
    }

    bullets.forEach((b, bi) => {
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      if (dist < a.size) {
        explodeSound.currentTime = 0;
        explodeSound.play();
        createParticles(a.x, a.y);
        bullets.splice(bi, 1);
        asteroids.splice(ai, 1);
        score += 10;
        scoreDisplay.textContent = score;
        if (a.size > 20) {
          asteroids.push(createAsteroidFarFromShip(a.size / 2));
          asteroids.push(createAsteroidFarFromShip(a.size / 2));
        }
      }
    });
  });

  checkAsteroidCollisions();

  particles.forEach((p, i) => {
    p.x += p.dx;
    p.y += p.dy;
    p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  });

  if (asteroids.length < 5) {
    asteroids.push(createAsteroidFarFromShip());
  }
}

function drawShip() {
  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.rotate(ship.angle);
  ctx.beginPath();
  ctx.moveTo(20, 0);
  ctx.lineTo(-10, 10);
  ctx.lineTo(-10, -10);
  ctx.closePath();
  ctx.strokeStyle = "white";
  ctx.stroke();

  if (ship.accelerating) {
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(-20, 5);
    ctx.lineTo(-20, -5);
    ctx.closePath();
    ctx.fillStyle = "orange";
    ctx.fill();
  }
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawShip();

  bullets.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
  });

  asteroids.forEach(a => {
    ctx.beginPath();
    ctx.arc(a.x, a.y, a.size, 0, Math.PI * 2);
    ctx.strokeStyle = "gray";
    ctx.stroke();
  });

  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${p.life / 50})`;
    ctx.fill();
  });
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

function restartGame() {
  score = 0;
  scoreDisplay.textContent = score;
  bullets = [];
  particles = [];
  ship.x = canvas.width / 2;
  ship.y = canvas.height / 2;
  ship.velocity = { x: 0, y: 0 };
  ship.angle = 0;
  isGameOver = false;
  gameOverDisplay.style.display = "none";
  restartBtn.style.display = "none";
  initAsteroids();
}

initAsteroids();
loop();
