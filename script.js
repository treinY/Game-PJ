const canvas = document.getElementById('clock');
const ctx = canvas.getContext('2d');
const RADIUS = 150;
const CENTER = { x: canvas.width / 2, y: canvas.height / 2 };
const scoreEl = document.getElementById('score');
const progressBar = document.getElementById('progressbar');
const greetingEl = document.getElementById('greeting');
const themeBtn = document.getElementById('toggle-theme');

let score = 0;
let lastHour = new Date().getHours();

function drawClock() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const now = new Date();
  let hour = now.getHours() % 12;
  let minute = now.getMinutes();
  let second = now.getSeconds();
  let ms = now.getMilliseconds();

  // Smart premium glassy face
  drawFace();
  drawTicks();
  drawNumbers();

  // Animated progress ring for seconds (premium look)
  drawProgressRing(second, ms);

  // Hands
  drawHand((hour + minute / 60) * 30, RADIUS * 0.54, 7, "#3a6be7", 0.15); // hour
  drawHand((minute + second / 60) * 6, RADIUS * 0.7, 5, "#39e7b4", 0.18); // minute
  drawHand((second + ms / 1000) * 6, RADIUS * 0.82, 2.3, "#e76b6b", 0.22); // second

  // Center dot
  ctx.beginPath();
  ctx.arc(CENTER.x, CENTER.y, 8, 0, 2 * Math.PI, false);
  ctx.fillStyle = "rgba(90, 140, 220, 0.95)";
  ctx.shadowColor = "#81e7c2";
  ctx.shadowBlur = 14;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Score logic
  if (now.getHours() !== lastHour) {
    lastHour = now.getHours();
    score += 10;
    scoreEl.textContent = score;
    animateScore();
  }

  // Progress bar for hour
  let hourProgress = (minute * 60 + second) / 3600;
  progressBar.style.width = `${hourProgress * 100}%`;

  // Greeting
  setGreeting(now);

  requestAnimationFrame(drawClock);
}

function drawFace() {
  // Main glass effect
  let grad = ctx.createRadialGradient(CENTER.x, CENTER.y, RADIUS * 0.3, CENTER.x, CENTER.y, RADIUS);
  grad.addColorStop(0, "rgba(245,255,255,0.95)");
  grad.addColorStop(1, "rgba(200,230,255,0.28)");
  ctx.beginPath();
  ctx.arc(CENTER.x, CENTER.y, RADIUS, 0, 2 * Math.PI);
  ctx.fillStyle = grad;
  ctx.fill();

  // Outer border
  ctx.lineWidth = 7;
  ctx.strokeStyle = "rgba(120,180,255,0.25)";
  ctx.stroke();

  // Inner shadow
  ctx.save();
  ctx.globalAlpha = 0.13;
  ctx.beginPath();
  ctx.arc(CENTER.x, CENTER.y, RADIUS - 14, 0, 2 * Math.PI);
  ctx.strokeStyle = "#3a6be7";
  ctx.lineWidth = 12;
  ctx.stroke();
  ctx.restore();
}

function drawTicks() {
  // Major ticks (hour)
  for (let i = 0; i < 12; i++) {
    let angle = (i * Math.PI) / 6;
    let xStart = CENTER.x + Math.cos(angle) * (RADIUS - 18);
    let yStart = CENTER.y + Math.sin(angle) * (RADIUS - 18);
    let xEnd = CENTER.x + Math.cos(angle) * (RADIUS - 6);
    let yEnd = CENTER.y + Math.sin(angle) * (RADIUS - 6);

    ctx.beginPath();
    ctx.moveTo(xStart, yStart);
    ctx.lineTo(xEnd, yEnd);
    ctx.strokeStyle = "#7ba7d6";
    ctx.lineWidth = 4.2;
    ctx.shadowColor = "rgba(120,200,255,0.19)";
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // Minor ticks (minute)
  for (let i = 0; i < 60; i++) {
    if (i % 5 === 0) continue;
    let angle = (i * Math.PI) / 30;
    let xStart = CENTER.x + Math.cos(angle) * (RADIUS - 14);
    let yStart = CENTER.y + Math.sin(angle) * (RADIUS - 14);
    let xEnd = CENTER.x + Math.cos(angle) * (RADIUS - 7);
    let yEnd = CENTER.y + Math.sin(angle) * (RADIUS - 7);

    ctx.beginPath();
    ctx.moveTo(xStart, yStart);
    ctx.lineTo(xEnd, yEnd);
    ctx.strokeStyle = "#b3d0f9";
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
}

function drawNumbers() {
  ctx.save();
  ctx.font = "bold 1.33rem 'Inter', Arial, sans-serif";
  ctx.fillStyle = "#2f4a7d";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  for (let num = 1; num <= 12; num++) {
    let angle = ((num - 3) * Math.PI) / 6;
    let x = CENTER.x + Math.cos(angle) * (RADIUS - 35);
    let y = CENTER.y + Math.sin(angle) * (RADIUS - 35);
    ctx.fillText(num, x, y);
  }
  ctx.restore();
}

function drawHand(angleDeg, length, width, color, glow) {
  let angle = ((angleDeg - 90) * Math.PI) / 180;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(CENTER.x, CENTER.y);
  ctx.lineTo(
    CENTER.x + Math.cos(angle) * length,
    CENTER.y + Math.sin(angle) * length
  );
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.shadowColor = color;
  ctx.shadowBlur = 18 * glow;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawProgressRing(second, ms) {
  const angle = ((second + ms / 1000) / 60) * 2 * Math.PI - Math.PI / 2;
  ctx.save();
  ctx.beginPath();
  ctx.arc(
    CENTER.x,
    CENTER.y,
    RADIUS - 5,
    -Math.PI / 2,
    angle,
    false
  );
  let grad = ctx.createLinearGradient(
    CENTER.x + RADIUS * Math.cos(-Math.PI / 2),
    CENTER.y + RADIUS * Math.sin(-Math.PI / 2),
    CENTER.x + RADIUS * Math.cos(angle),
    CENTER.y + RADIUS * Math.sin(angle)
  );
  grad.addColorStop(0, "#67e7e7");
  grad.addColorStop(1, "#5397e7");
  ctx.strokeStyle = grad;
  ctx.lineWidth = 7.5;
  ctx.shadowColor = "#3a7be7";
  ctx.shadowBlur = 13;
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.restore();
}

function animateScore() {
  scoreEl.style.transform = "scale(1.26)";
  scoreEl.style.color = "#48e788";
  setTimeout(() => {
    scoreEl.style.transform = "scale(1)";
    scoreEl.style.color = "";
  }, 600);
}

function setGreeting(now) {
  let h = now.getHours();
  let greeting = "";
  if (h < 6) greeting = "မင်္ဂလာညနေခင်းပါ 🌙";
  else if (h < 12) greeting = "မင်္ဂလာနံနက်ခင်းပါ ☀️";
  else if (h < 17) greeting = "မင်္ဂလာနေ့လယ်ခင်းပါ 🌤";
  else if (h < 20) greeting = "မင်္ဂလာညနေခင်းပါ 🌆";
  else greeting = "အနားယူချိန်ဖြစ်နေပါပြီ 🌙";
  greetingEl.textContent = greeting;
}

// Theme toggling (premium)
themeBtn.onclick = () => {
  document.body.classList.toggle('dark');
};

drawClock();