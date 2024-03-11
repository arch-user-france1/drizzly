const timeElement = document.getElementById("time");
const scoreElement = document.getElementById("score");
let time = 0;
let score = 0;
let invincible = true;
let gameFinished = false;
let scoreUpdateInterval;
let speedMultiplicator =
  ((window.innerHeight / 515) * window.innerHeight) / 515; // too easy to play on large screens
const obstacleAmount =
  (Math.floor((15 * window.innerHeight) / 515) + speedMultiplicator) / 2;

function triggerVincible() {
  invincible = false;
  player.style.animation = "";
}

function updateScore() {
  time++;
  timeElement.textContent = (time / 10).toFixed();
  if (!invincible) {
    score += 1;
    scoreElement.textContent = score;
  }
}

const player = document.getElementById("player");

function updatePlayerPosition(event) {
  const playerBoundingRect = player.getBoundingClientRect();
  const x = event.clientX;
  const y = event.clientY;

  player.style.transform = `translate(${x - playerBoundingRect.width / 2}px, ${y - playerBoundingRect.height / 2}px)`;
}

let obstacles = [];

function createObstacles() {
  for (let i = 0; i < obstacleAmount; i++) {
    const obstacle = document.createElement("div");
    obstacle.className = "obstacle";
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * -200;
    obstacle.style.transform = "translate(" + x + "px" + y + "px)";
    document.body.append(obstacle);
    obstacles.push([obstacle, x, y]);
  }
}

let fallAnimation;
function animationStep() {
  const playerBoundingRect = player.getBoundingClientRect();
  for (const obstacle of obstacles) {
    const obstacleBoundingRect = obstacle[0].getBoundingClientRect();
    const element = obstacle[0];
    obstacle[2] += (2 + time / 2000) * speedMultiplicator;
    element.style.transform =
      "translate(" + obstacle[1] + "px, " + obstacle[2] + "px)";

    // check if the rectangle has trespassed the bottom of the window
    if (obstacle[2] > window.innerHeight) {
      obstacle[2] = Math.random() * -200;
      obstacle[1] = Math.random() * window.innerWidth;
    }

    // check if the player was hit
    const playerLeft = playerBoundingRect.x;
    const playerRight = playerBoundingRect.x + playerBoundingRect.width;
    const playerTop = playerBoundingRect.y;
    const playerBottom = playerBoundingRect.y + playerBoundingRect.height;

    const obstacleLeft = obstacleBoundingRect.x;
    const obstacleRight = obstacleBoundingRect.x + obstacleBoundingRect.width;
    const obstacleTop = obstacleBoundingRect.y;
    const obstacleBottom = obstacleBoundingRect.y + obstacleBoundingRect.height;

    if (
      playerRight > obstacleLeft &&
      playerLeft < obstacleRight &&
      playerBottom > obstacleTop &&
      playerTop < obstacleBottom &&
      !invincible
    ) {
      GameOver();
    }
  }
}

function magnet() {
  const playerBoundingRect = player.getBoundingClientRect();
  for (const obstacle of obstacles) {
    const x = obstacle[1];
    const y = obstacle[2];
    if (x > playerBoundingRect.x) {
      obstacle[1] -= speedMultiplicator;
    } else if (x < playerBoundingRect.x) {
      obstacle[1] += speedMultiplicator;
    }
    if (y > playerBoundingRect.y) {
      obstacle[2] -= speedMultiplicator;
    } else if (y < playerBoundingRect.y) {
      obstacle[2] += speedMultiplicator;
    }
  }
}
function blink() {
  for (const obstacle of obstacles) {
    obstacle[0].style.opacity = "0";
    setTimeout(() => (obstacle[0].style.opacity = "1"), 500);
  }
}
const filter = document.getElementById("filter");
const effects = [
  () => {
    filter.style.backdropFilter = "blur(8px)";
    filter.style.webkitBackdropFilter = "blur(8px)";
    vignette.classList.add("vignette-black");
    setTimeout(() => vignette.classList.remove("vignette-black"));
    return () => {
      filter.style.backdropFilter = "";
      filter.style.webkitBackdropFilter = "";
    };
  },
  () => {
    filter.style.backdropFilter = "grayscale(100%)";
    filter.style.webkitBackdropFilter = "grayscale(100%)";
    vignette.classList.add("vignette-red");
    return () => {
      filter.style.backdropFilter = "";
      filter.style.webkitBackdropFilter = "";
      vignette.classList.remove("vignette-red");
    };
  },
  () => {
    player.style.width = "1rem";
    player.style.height = "1rem";
    filter.style.animation = "rotateColours 1s infinite";
    for (const obstacle of obstacles) {
      obstacle[0].style.width = "7rem";
      obstacle[0].style.height = "7rem";
    }
    return () => {
      player.style.width = "5rem";
      player.style.height = "5rem";
      for (const obstacle of obstacles) {
        obstacle[0].style.width = "5rem";
        obstacle[0].style.height = "5rem";
      }
      filter.style.animation = "";
    };
  },
  () => {
    const magnetInterval = setInterval(magnet, 120);
    return () => clearInterval(magnetInterval);
  },
  () => {
    const blinkInterval = setInterval(blink, 1000);
    return () => {
      clearInterval(blinkInterval);
      for (const obstacle of obstacles) {
        obstacle[0].style.opacity = "1";
      }
    };
  },
];
let effectTimeout;
let randomEffectInterval;
let cleanup;
const vignette = document.getElementById("vignette");
function randomEffect() {
  effectTimeout = setTimeout(
    () => {
      const effectIdx = Math.floor(Math.random() * effects.length);
      const effect = effects[effectIdx];
      cleanup = effect();
      setTimeout(
        () => {
          if (typeof cleanup === "function") cleanup();
        },
        (8 + Math.random() * 4) * 1000,
      );
    },
    (Math.random() * 10 + 5) * 1000,
  );
}

function initialise() {
  gameFinished = false;
  invincible = true;
  for (const obstacle of obstacles) {
    obstacle[0].remove();
  }
  score = 0;
  scoreElement.textContent = "0";
  time = 0;
  obstacles = [];

  createObstacles();
  scoreUpdateInterval = setInterval(updateScore, 100);
  fallAnimation = setInterval(animationStep, 1);
  setTimeout(triggerVincible, 5000);
  document.addEventListener("mousemove", updatePlayerPosition);
  const gameover = document.getElementById("gameover");
  gameover.style.opacity = "0";
  document.documentElement.style.cursor = "none";
  player.style.animation = ".5s linear 0s 10 running invincible";

  randomEffectInterval = setInterval(randomEffect, 27000);
  randomEffect();
}

initialise();

function GameOver() {
  clearInterval(randomEffectInterval);
  clearTimeout(effectTimeout);

  document.documentElement.style.cursor = "";
  clearInterval(fallAnimation);
  clearInterval(scoreUpdateInterval);
  document.removeEventListener("mousemove", updatePlayerPosition);

  const gameover = document.getElementById("gameover");
  gameover.style.opacity = "1";

  const finalScore = document.getElementById("finalScore");
  finalScore.textContent = score;

  gameFinished = true;

  if (typeof cleanup === "function") {
    cleanup();
    cleanup = undefined;
  }
}

function RestartGame() {
  if (gameFinished) {
    initialise();
  }
}
window.addEventListener("click", RestartGame);
