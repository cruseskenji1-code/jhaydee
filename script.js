const heartsLayer = document.querySelector("#heartsLayer");
const introScene = document.querySelector("#introScene");
const videoScene = document.querySelector("#videoScene");
const finalScene = document.querySelector("#finalScene");
const messageModal = document.querySelector("#messageModal");
const openMessageBtn = document.querySelector("#openMessageBtn");
const openVideoBtn = document.querySelector("#openVideoBtn");
const closeModalBtn = document.querySelector("#closeModalBtn");
const openLastBtn = document.querySelector("#openLastBtn");
const loveVideo = document.querySelector("#loveVideo");
const progressFill = document.querySelector("#progressFill");
const slides = [...document.querySelectorAll("[data-slide]")];
const noBtn = document.querySelector("#noBtn");
const yesBtn = document.querySelector("#yesBtn");
const yesMessage = document.querySelector("#yesMessage");

const heartColors = ["#ff6f9f", "#ff8fb2", "#6aa9ff", "#9ed8ff", "#ffb4ca"];
const heartCount = Math.min(34, Math.max(20, Math.floor(window.innerWidth / 34)));

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function createFloatingHeart(index) {
  const heart = document.createElement("span");
  const size = randomBetween(18, 44);

  heart.className = "floating-heart";
  heart.style.setProperty("--size", `${size}px`);
  heart.style.setProperty("--duration", `${randomBetween(8, 18)}s`);
  heart.style.setProperty("--color", heartColors[index % heartColors.length]);
  heart.style.left = `${randomBetween(0, 100)}vw`;
  heart.style.animationDelay = `${randomBetween(-18, 0)}s`;
  heart.style.opacity = randomBetween(0.45, 0.95).toFixed(2);

  heart.addEventListener("pointerenter", () => dodgeHeart(heart));
  heart.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    dodgeHeart(heart);
  });

  heartsLayer.appendChild(heart);
}

function dodgeHeart(heart) {
  heart.style.setProperty("--run-x", `${randomBetween(-160, 160)}px`);
  heart.style.setProperty("--run-y", `${randomBetween(-140, 120)}px`);
  heart.classList.add("evade");

  setTimeout(() => {
    heart.classList.remove("evade");
  }, 420);
}

function showScene(scene) {
  [introScene, videoScene, finalScene].forEach((item) => {
    item.classList.toggle("is-active", item === scene);
  });
}

function openModal() {
  messageModal.showModal();
}

function closeModal() {
  messageModal.close();
}

function playPresentation() {
  let currentSlide = 0;
  const totalTime = 14200;
  const slideLength = totalTime / slides.length;
  const startTime = performance.now();

  openLastBtn.classList.add("hidden");
  slides.forEach((slide, index) => slide.classList.toggle("is-showing", index === 0));
  progressFill.style.width = "0%";

  const timer = setInterval(() => {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / totalTime, 1);
    progressFill.style.width = `${progress * 100}%`;

    const nextSlide = Math.min(slides.length - 1, Math.floor(elapsed / slideLength));

    if (nextSlide !== currentSlide) {
      currentSlide = nextSlide;
      slides.forEach((slide, index) => {
        slide.classList.toggle("is-showing", index === currentSlide);
      });
    }

    if (progress >= 1) {
      clearInterval(timer);
      openLastBtn.classList.remove("hidden");
      openLastBtn.focus();
    }
  }, 80);
}

function playVideoOrFallback() {
  openLastBtn.classList.add("hidden");
  loveVideo.classList.remove("hidden");
  loveVideo.currentTime = 0;

  const playAttempt = loveVideo.play();

  if (playAttempt) {
    playAttempt.catch(() => {
      loveVideo.classList.add("hidden");
      playPresentation();
    });
  }
}

function moveNoButton(event) {
  const buttonRect = noBtn.getBoundingClientRect();
  const sceneRect = finalScene.getBoundingClientRect();
  const padding = 18;
  const maxX = Math.max(padding, sceneRect.width - buttonRect.width - padding);
  const maxY = Math.max(padding, sceneRect.height - buttonRect.height - padding);

  let nextX = randomBetween(padding, maxX);
  let nextY = randomBetween(sceneRect.height * 0.52, maxY);

  if (event) {
    const cursorX = event.clientX - sceneRect.left;
    const cursorY = event.clientY - sceneRect.top;

    if (Math.abs(nextX - cursorX) < 120) {
      nextX = cursorX > sceneRect.width / 2 ? padding : maxX;
    }

    if (Math.abs(nextY - cursorY) < 80) {
      nextY = cursorY > sceneRect.height / 2 ? padding : maxY;
    }
  }

  noBtn.style.position = "absolute";
  noBtn.style.left = `${nextX}px`;
  noBtn.style.top = `${nextY}px`;
}

for (let index = 0; index < heartCount; index++) {
  createFloatingHeart(index);
}

openMessageBtn.addEventListener("click", openModal);

closeModalBtn.addEventListener("click", closeModal);

messageModal.addEventListener("click", (event) => {
  if (event.target === messageModal) closeModal();
});

openVideoBtn.addEventListener("click", () => {
  closeModal();
  showScene(videoScene);
  playVideoOrFallback();
});

loveVideo.addEventListener("ended", () => {
  openLastBtn.classList.remove("hidden");
  openLastBtn.focus();
});

loveVideo.addEventListener("error", () => {
  loveVideo.classList.add("hidden");
  playPresentation();
});

openLastBtn.addEventListener("click", () => {
  showScene(finalScene);
});

noBtn.addEventListener("pointerenter", moveNoButton);
noBtn.addEventListener("pointermove", moveNoButton);
noBtn.addEventListener("focus", moveNoButton);
noBtn.addEventListener("click", (event) => {
  event.preventDefault();
  moveNoButton(event);
});

yesBtn.addEventListener("click", () => {
  yesMessage.classList.remove("hidden");
  yesBtn.textContent = "Yes \u{1F499}";
  noBtn.classList.add("hidden");
});

window.addEventListener("resize", () => {
  if (finalScene.classList.contains("is-active")) {
    noBtn.removeAttribute("style");
  }
});