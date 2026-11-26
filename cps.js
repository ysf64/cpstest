const buttons = document.querySelectorAll(".btn");
const testTitle = document.getElementById("t-text");
const timerText = document.getElementById("timer");
const scoreText = document.getElementById("score");
const cpsText = document.getElementById("cps");
const placehold = document.getElementById("placehold");

const modal = document.getElementById("result-modal");
const rankPic = document.getElementById("rank-pic");
const rankName = document.getElementById("rank-name");
const rankStars = document.getElementById("rank-stars");
const rankCps = document.getElementById("rank-cps");
const rankDetail = document.getElementById("rank-detail");
const rankList = document.getElementById("rank-list");

const RANKS = [
  { name: "Slow", min: 0, range: "< 4", emoji: "🐢", img: "icons/slow.png" },
  { name: "Average", min: 4, range: "4 - 6", emoji: "🚶", img: "icons/average.png" },
  { name: "Good", min: 6, range: "6 - 8", emoji: "👍", img: "icons/good.png" },
  { name: "Fast", min: 8, range: "8 - 10", emoji: "⚡", img: "icons/fast.png" },
  { name: "Very Fast", min: 10, range: "10 - 14", emoji: "🚀", img: "icons/very-fast.png" },
  { name: "Extreme", min: 14, range: "> 14", emoji: "🔥", img: "icons/extreme.png" },
];

let score = 0;
let duration = 1;
let startTime = null;
let timerId = null;
let finished = false;
let popupTimeout = null;

function getRankIndex(cps) {
  let idx = 0;
  RANKS.forEach((r, i) => {
    if (cps >= r.min) idx = i;
  });
  return idx;
}

function makePic(rank) {
  const img = document.createElement("img");
  img.src = rank.img;
  img.alt = rank.name;
  img.onerror = () => img.replaceWith(document.createTextNode(rank.emoji));
  return img;
}

function buildRankList() {
  RANKS.forEach((rank) => {
    const row = document.createElement("div");
    row.className = "rank-row";

    const pic = document.createElement("div");
    pic.className = "row-pic";
    pic.appendChild(makePic(rank));

    const name = document.createElement("span");
    name.className = "row-name";
    name.innerText = rank.name;

    const range = document.createElement("span");
    range.className = "row-range";
    range.innerText = `${rank.range} CPS`;

    row.append(pic, name, range);
    rankList.appendChild(row);
  });
}

function showResult() {
  const cps = score / duration;
  const idx = getRankIndex(cps);
  const rank = RANKS[idx];

  rankName.innerText = rank.name;
  rankStars.innerText = "★".repeat(idx + 1) + "☆".repeat(RANKS.length - idx - 1);
  rankCps.innerText = cps.toFixed(1);
  rankDetail.innerText = `${score} Clicks in ${duration} Second${duration === 1 ? "" : "s"}`;
  rankPic.replaceChildren(makePic(rank));

  [...rankList.children].forEach((row, i) => row.classList.toggle("active", i === idx));

  modal.hidden = false;
}

function closeModal() {
  modal.hidden = true;
  resetTest();
}

document.getElementById("modal-close").addEventListener("click", closeModal);
document.getElementById("try-again").addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

function resetTest() {
  clearInterval(timerId);
  clearTimeout(popupTimeout);
  timerId = null;
  startTime = null;
  finished = false;
  score = 0;
  scoreText.innerText = 0;
  cpsText.innerText = "0.00";
  timerText.innerText = duration.toFixed(1);
  placehold.innerText = "CLICK HERE TO START";
}

function updateCps(elapsed) {
  if (elapsed < 0.1) return;
  cpsText.innerText = (score / elapsed).toFixed(2);
}

function finishTest() {
  finished = true;
  clearInterval(timerId);
  timerId = null;
  timerText.innerText = "0.0";
  updateCps(duration);

  popupTimeout = setTimeout(showResult, 400);
}

function tick() {
  const elapsed = (performance.now() - startTime) / 1000;
  const remaining = Math.max(duration - elapsed, 0);
  timerText.innerText = remaining.toFixed(1);
  updateCps(Math.min(elapsed, duration));

  if (remaining <= 0) finishTest();
}

document.addEventListener("DOMContentLoaded", () => {
  buildRankList();
  resetTest();
  document.querySelector(".game").addEventListener("contextmenu", (e) => e.preventDefault());
});

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    buttons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    duration = parseFloat(btn.getAttribute("value"));
    testTitle.innerText = `${btn.innerText} Click Test`;

    resetTest();
  });
});

function addScore(e) {
  if (startTime === null) {
    startTime = performance.now();
    timerId = setInterval(tick, 100);
  }

  if (!finished && (performance.now() - startTime) / 1000 >= duration) {
    finishTest();
  }

  if (!finished) {
    score++;
    scoreText.innerText = score;
    placehold.innerText = "";
    updateCps(Math.min((performance.now() - startTime) / 1000, duration));
  }

  const gameArea = document.querySelector(".game");
  const ripple = document.createElement("span");
  ripple.classList.add("ripple");
  gameArea.appendChild(ripple);

  const rect = gameArea.getBoundingClientRect();
  const rippleSize = 50;
  ripple.style.left = `${e.clientX - rect.left - rippleSize / 2}px`;
  ripple.style.top = `${e.clientY - rect.top - rippleSize / 2}px`;

  ripple.addEventListener("animationend", () => ripple.remove());
}
