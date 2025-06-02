const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let ship, bullets, asteroids, score, highScore, isGameOver, gameStarted = false;

const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highScore");
const gameOverDisplay = document.getElementById("gameOver");
const restartBtn = document.getElementById("restartBtn");
const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");

const shootSound = new Audio("shoot.mp3");
const explodeSound = new Audio("explode.mp3");

function init() {
  ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    angle: 0,
    radius: 20
  };
  bullets = [];
  asteroids = [];
  score = 0;
  isGameOver = false;
  gameStarted = true;

  scoreDisplay.textContent = score;
  highScore = parseInt(localStorage.getItem("highScore")) || 0;
  highScoreDisplay.textContent = highScore;

  for (let i = 0; i < 5; i++) {
    asteroids.push(createAsteroidFarFromShip());
  }

  update();
}

startBtn.addEventListener("click", () => {
  startScreen.style.display = "none";
  canvas.style.display = "block";
  init();
});

restartBtn.addEventListener("click", () => {
  location.reload();
});

document.addEventListener("keydown", (e) => {
  if (!gameStarted) return;

  if (e.code === "Space") {
    bullets.push({
      x: ship.x,
      y: ship.y,
      dx: Math.cos(ship.angle) * 10,
      dy: Math.sin(ship.angle) * 10
    });
    shootSound.currentTime = 0;
    shootSound.play();
  }
});

document.addEventListener("mousemove", (e) => {
  if (!gameStarted) return;
  const dx = e.clientX - ship.x;
  const dy = e.clientY - ship.y;
  ship.angle = Math.atan2(dy, dx);
});

function createAsteroidFarFromShip(size = 40) {
  let x, y, dx, dy;
  do {
    x = Math.random() * canvas.width;
    y = Math.random() * canvas.height;
  } while (Math.hypot(x - ship.x, y - ship.y) < 200);

  dx = (Math.random() - 0.5) * 2;
  dy = (Math.random() - 0.5) * 2;

  return { x, y, dx, dy, size };
}

function drawShip() {
  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.rotate(ship.angle);
  ctx.beginPath();
  ctx.moveTo(20, 0);
  ctx.lineTo(-20, 15);
  ctx.lineTo(-20, -15);
  ctx.closePath();
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.restore();
}

function drawBullets() {
  ctx.fillStyle = "red";
  bullets.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawAsteroids() {
  ctx.fillStyle = "gray";
  asteroids.forEach(a => {
    ctx.beginPath();
    ctx.arc(a.x, a.y, a.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

function createParticles(x, y, count = 10) {
  for (let i = 0; i < count; i++) {
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 3 + 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${Math.random()})`;
    ctx.fill();
  }
}

function update() {
  if (!gameStarted || isGameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawShip();

  bullets.forEach((b, i) => {
    b.x += b.dx;
    b.y += b.dy;
    if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
      bullets.splice(i, 1);
    }
  });

  drawBullets();

  for (let ai = asteroids.length - 1; ai >= 0; ai--) {
    let a = asteroids[ai];
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

      if (score > highScore) {
        localStorage.setItem("highScore", score);
      }

      return;
    }

    for (let bi = bullets.length - 1; bi >= 0; bi--) {
      const b = bullets[bi];
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
        break;
      }
    }
  }

  drawAsteroids();

  requestAnimationFrame(update);
}
