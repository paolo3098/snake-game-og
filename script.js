"use strict";

const gameCanvas = document.querySelector("#gameCanvas");

const context = gameCanvas.getContext("2d");

const foodSound = document.querySelector(`#eat`);

const gameOverSound = document.querySelector(`#gameOver`);

const intro = document.querySelector(`#intro`);

const colours = {
  BORDER_COLOUR_CANVAS: "#133e7c",

  BACKGROUND_COLOUR_CANVAS: "#091833",

  SNAKE_COLOUR: "#ea00d9",

  BORDER_COLOUR_SNAKE: "#711c91",

  FOOD_COLOUR: "#0abdc6",

  BORDER_COLOUR_FOOD: "white"
};

const snake = [{
  x: 150,
  y: 150
}, {
  x: 140,
  y: 150
}, {
  x: 130,
  y: 150
}, {
  x: 120,
  y: 150
}, {
  x: 110,
  y: 150
}];

const gameLogic = {
  gameSpeed: 100,

  changingDirection: false,

  score: 0,

  highScore: 0,

  dx: 10,

  dy: 0
};

const buttons = {
  startButton: document.querySelector(`#startButton`),

  resetButton: document.querySelector(`#resetButton`),

  easyButton: document.querySelector(`#easyButton`),

  normalButton: document.querySelector(`#normalButton`),

  hardButton: document.querySelector(`#hardButton`)
};

function selectDifficulty() {
  buttons.easyButton.addEventListener(`click`, function () {
    gameLogic.gameSpeed = 70;
  });

  buttons.normalButton.addEventListener(`click`, function () {
    gameLogic.gameSpeed = 30;
  });

  buttons.hardButton.addEventListener(`click`, function () {
    gameLogic.gameSpeed = 8;
  });
}

function updateHighScore() {
  const currHighScore = getHighScore();

  if (gameLogic.score > currHighScore) {
    localStorage.setItem(`highScore`, gameLogic.score);

    // document.querySelector('#highScore').textContent = gameLogic.score;
  }
}

function getHighScore() {
  return parseInt(localStorage.getItem("highScore")) || 0;
}

buttons.startButton.addEventListener(`click`, startGame);

selectDifficulty();

foodLocation();

// controls the movement of the snake

document.addEventListener("keydown", snakeControls);

document.querySelector("#highScore").textContent = `HIGH SCORE ${getHighScore()}`;

buttons.resetButton.addEventListener(`click`, function () {
  location.reload();
});

const gameLevels = document.querySelectorAll(".buttonEffect");

for (let i = 0; i < gameLevels.length; i++) {
  gameLevels[i].addEventListener("click", function () {
    let current = document.querySelectorAll(".active");

    current[0].className = current[0].className.replace(" active", "");

    this.className += " active";
  });
  console.log(this);
}

function startGame() {
  buttons.startButton.style.display = `none`;

  intro.style.display = `none`;

  if (isGameOver()) {
    context.font = "40px bold";

    context.fillStyle = `white`;

    context.fillText(`GAME OVER!`, 370, 200);

    gameOverSound.play();

    return;
  }

  setTimeout(function onTick() {
    gameLogic.changingDirection = false;

    drawCanvas();

    drawFood();

    advanceSnake();

    drawSnake();

    // Call game again

    startGame();
  }, gameLogic.gameSpeed);
}

function drawCanvas() {
  context.fillStyle = colours.BACKGROUND_COLOUR_CANVAS;

  context.strokeStyle = colours.BORDER_COLOUR_CANVAS;

  context.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

  context.strokeRect(0, 0, gameCanvas.width, gameCanvas.height);
}

function drawFood() {
  context.fillStyle = colours.FOOD_COLOUR;

  context.strokeStyle = colours.BORDER_COLOUR_FOOD;

  context.fillRect(gameLogic.foodX, gameLogic.foodY, 12, 12);

  context.strokeRect(gameLogic.foodX, gameLogic.foodY, 12, 12);
}

function advanceSnake() {
  // Create the new Snake's head

  const head = {
    x: snake[0].x + gameLogic.dx,
    y: snake[0].y + gameLogic.dy
  };

  // Add the new head to the beginning of snake body

  snake.unshift(head);

  const didEatFood = snake[0].x === gameLogic.foodX && snake[0].y === gameLogic.foodY;

  if (didEatFood) {
    foodSound.play();

    gameLogic.score += 10;

    updateHighScore();

    document.querySelector("#score").textContent = `Score ${gameLogic.score}`;

    // Generate new food location

    foodLocation();
  } else {
    // Remove the last part of snake body

    snake.pop();
  }
}

function isGameOver() {
  for (let i = 4; i < snake.length; i++) {
    // if snake hits itself

    if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
  }

  const hitLeftWall = snake[0].x < 0;

  const hitRightWall = snake[0].x > gameCanvas.width - 10;

  const hitTopWall = snake[0].y < 0;

  const hitBottomWall = snake[0].y > gameCanvas.height - 10;

  return hitLeftWall || hitRightWall || hitTopWall || hitBottomWall;
}

function randomLocation(min, max) {
  return Math.round((Math.random() * (max - min) + min) / 10) * 10;
}

// function that generates a random location for the food

function foodLocation() {
  gameLogic.foodX = randomLocation(0, gameCanvas.width - 14);

  gameLogic.foodY = randomLocation(0, gameCanvas.height - 14);

  if (gameLogic.foodX < 0) {
    gameLogic.foodX + 14;
  }
  if (gameLogic.foodY < 0) {
    gameLogic.foodY + 14;
  }

  // if the new food location is where the snake currently is, generate a new food location

  snake.map(function isFoodOnSnake(part) {
    const foodIsOnSnake = part.x === gameLogic.foodX && part.y === gameLogic.foodY;

    if (foodIsOnSnake) foodLocation();
  });
}

function drawSnake() {
  // loop through the snake object drawing each part on the canvas

  snake.map(drawSnakeParts);
}

function drawSnakeParts(snakePart) {
  context.fillStyle = colours.SNAKE_COLOUR;

  context.strokeStyle = colours.BORDER_COLOUR_SNAKE;

  context.fillRect(snakePart.x, snakePart.y, 12, 12);

  context.strokeRect(snakePart.x, snakePart.y, 12, 12);
}

/* prevents snake from reversing if keys are pressed

 before 100ms have lapsed */

function directionChange() {
  if (gameLogic.changingDirection) return;

  gameLogic.changingDirection = true;
}

function snakeControls(event) {
  directionChange();

  const goingUp = gameLogic.dy === -10;

  const goingDown = gameLogic.dy === 10;

  const goingRight = gameLogic.dx === 10;

  const goingLeft = gameLogic.dx === -10;

  if (event.key === `ArrowLeft` && !goingRight) {
    gameLogic.dx = -10;

    gameLogic.dy = 0;
  }

  if (event.key === `ArrowUp` && !goingDown) {
    gameLogic.dx = 0;

    gameLogic.dy = -10;
  }

  if (event.key === `ArrowRight` && !goingLeft) {
    gameLogic.dx = 10;

    gameLogic.dy = 0;
  }

  if (event.key === `ArrowDown` && !goingUp) {
    gameLogic.dx = 0;

    gameLogic.dy = 10;
  }
}