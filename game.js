const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gameRunning = false;
let paused = false;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;

let stars = [];
let asteroids = [];
let keys = {};
let spaceship;

document.getElementById("startBtn").onclick = () => {
  document.getElementById("titleScreen").style.display = "none";
  gameRunning = true;
  resetGame();
};

document.getElementById("pauseBtn").onclick = () => {
  paused = !paused;
  document.getElementById("pauseBtn").innerText = paused ? "Resume" : "Pause";
};

window.addEventListener("keydown", e => keys[e.code] = true);
window.addEventListener("keyup", e => keys[e.code] = false);

function resetGame() {
  spaceship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20,
    angle: 0,
    speed: 0,
    rotationSpeed: 0.05
  };
  asteroids = [];
  score = 0;
  stars = Array.from({ length: 100 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2 + 1
  }));
}

function drawStars() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  for (let s of stars) {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    s.y += 0.5;
    if (s.y > canvas.height) {
      s.y = 0;
      s.x = Math.random() * canvas.width;
    }
  }
}

function drawSpaceship() {
  ctx.save();
  ctx.translate(spaceship.x, spaceship.y);
  ctx.rotate(spaceship.angle);
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(12, 10);
  ctx.lineTo(-12, 10);
  ctx.closePath();
  ctx.fillStyle = "lime";
  ctx.fill();
  ctx.restore();
}

function updateSpaceship() {
  if (keys["ArrowLeft"]) spaceship.angle -= spaceship.rotationSpeed;
  if (keys["ArrowRight"]) spaceship.angle += spaceship.rotationSpeed;
  if (keys["ArrowUp"]) {
    spaceship.speed = 3;
  } else {
    spaceship.speed = 0;
  }

  spaceship.x += Math.cos(spaceship.angle) * spaceship.speed;
  spaceship.y += Math.sin(spaceship.angle) * spaceship.speed;

  // Screen wrap
  if (spaceship.x < 0) spaceship.x = canvas.width;
  if (spaceship.x > canvas.width) spaceship.x = 0;
  if (spaceship.y < 0) spaceship.y = canvas.height;
  if (spaceship.y > canvas.height) spaceship.y = 0;
}

function spawnAsteroids() {
  if (asteroids.length < 5) {
    const size = Math.random() * 20 + 20;
    let angle = Math.random() * 2 * Math.PI;
    let x = Math.random() < 0.5 ? 0 : canvas.width;
    let y = Math.random() < 0.5 ? 0 : canvas.height;
    asteroids.push({
      x,
      y,
      radius: size,
      dx: Math.cos(angle) * 2,
      dy: Math.sin(angle) * 2
    });
  }
}

function drawAsteroids() {
  for (let a of asteroids) {
    ctx.beginPath();
    ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
    ctx.fillStyle = "gray";
    ctx.fill();
  }
}

function updateAsteroids() {
  for (let a of asteroids) {
    a.x += a.dx;
    a.y += a.dy;

    if (a.x < 0) a.x = canvas.width;
    if (a.x > canvas.width) a.x = 0;
    if (a.y < 0) a.y = canvas.height;
    if (a.y > canvas.height) a.y = 0;

    const dx = a.x - spaceship.x;
    const dy = a.y - spaceship.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < a.radius + spaceship.radius) {
      gameOver();
    }
  }
}

function gameOver() {
  gameRunning = false;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }
  alert(`Game Over! Score: ${score} | High Score: ${highScore}`);
  document.getElementById("titleScreen").style.display = "block";
  document.getElementById("pauseBtn").innerText = "Pause";
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 20, 30);
  ctx.fillText(`High Score: ${highScore}`, 20, 60);
}

function gameLoop() {
  if (!gameRunning) return;
  if (!paused) {
    drawStars();
    updateSpaceship();
    drawSpaceship();
    spawnAsteroids();
    updateAsteroids();
    drawAsteroids();
    drawScore();
    score++;
  }
  requestAnimationFrame(gameLoop);
}

gameLoop();
