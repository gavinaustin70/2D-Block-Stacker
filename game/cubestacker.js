const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
const placeSound = new Audio("../sounds/placeblocksound.mp3");
const BLOCK_WIDTH = 100;
const BLOCK_HEIGHT = 600.0 / 35.0;
let gameOver = false;
let win = false;
let score = 0;
let lifeCount = 2;
let blocks = [];
let currBlock;
let penaltyCount = 0;
let currPower = "None";
let doubleBlock = false;
let doublePoints = false;
let autoPlace = false;
let extraLife = false;
let doublePointCount = 0;
let count = 0;
let particles = [];

//change background color
canvas.style.backgroundColor = "black";

class Block {
  constructor() {
    this.color = getRandomColor();
    this.nextWidth = BLOCK_WIDTH;
    this.prevBlock = blocks[blocks.length - 1];

    // if there is a previous block, set the width to the overlap of the
    // last 2 blocks
    if (this.prevBlock) {
      this.width = this.prevBlock.nextWidth;

      if (doubleBlock) {
        this.width *= 2;
      }

      if (penaltyCount == 7) {
        this.width *= 0.5;
      } else if (penaltyCount == 10) {
        lifeCount--;
      }
    } else {
      this.width = BLOCK_WIDTH;
    }
    this.height = BLOCK_HEIGHT;

    this.y = canvas.height - BLOCK_HEIGHT - count * BLOCK_HEIGHT;
    count++;
    this.stop = false;

    if (this.width >= 90) {
      this.speed = 2.3;
    } else if (this.width >= 80) {
      this.speed = 2.5;
    } else if (this.width >= 70) {
      this.speed = 2.7;
    } else if (this.width >= 60) {
      this.speed = 2.9;
    } else if (this.width >= 50) {
      this.speed = 3.3;
    } else if (this.width >= 40) {
      this.speed = 3.5;
    } else if (this.width >= 30) {
      this.speed = 3.8;
    } else if (this.width >= 20) {
      this.speed = 4.6;
    } else if (this.width >= 10) {
      this.speed = 4.9;
    } else {
      this.speed = 5.3;
    }

    if (count % 2 == 0) {
      this.x = canvas.width / 4 + this.width;
      this.speed *= 1;
    } else {
      if (this.width > 100) {
        this.x = canvas.width / 2;
      } else {
        this.x = canvas.width - canvas.width / 4 - this.width;
      }

      this.speed *= -1;
    }
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    if (!this.stop) {
      moveBlock(this);
    }
  }

  generateParticles() {
    const numParticles = 250;
    const particleSize = 4.0;
    const randomColor = getRandomColor();

    for (let i = 0; i < numParticles; i++) {
      const particleX = this.x + this.width / 2;
      const particleY = this.y + this.height;
      const randomX = Math.random() * this.width - this.width / 2;
      const randomY = Math.random() * this.height - this.height / 2;

      particles.push({
        x: particleX + randomX,
        y: particleY,
        size: particleSize,
        color: this.color,
      });
    }
  }
}

function getRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

  return `rgb(${r},${g},${b})`;
}

function addBlock() {
  if (gameOver) return;
  let block = new Block();
  blocks.push(block);
  currBlock = block;
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (lifeCount <= 0) {
    ctx.fillStyle = "red";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 75, canvas.height / 2);
    ctx.fillText(
      "(Press space to restart)",
      canvas.width / 2 - 150,
      canvas.height / 2 + 40
    );
  } else if (win) {
    ctx.fillStyle = "green";
    ctx.font = "30px Arial";
    ctx.fillText("You Win!", canvas.width / 2 - 65, canvas.height / 2);
    ctx.fillText(
      "(Press space to restart)",
      canvas.width / 2 - 150,
      canvas.height / 2 + 40
    );
  } else {
    blocks.forEach((block) => {
      block.draw();
      block.update();
    });
  }
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Score: " + score, 10, 30);
  ctx.fillText("Lives: " + lifeCount, 10, 60);

  // current power-up
  ctx.fillText("Power-Up: " + currPower, 10, 90);

  animateParticles();

  requestAnimationFrame(animate);
}

function moveBlock(block) {
  if (block.x + block.width >= canvas.width || block.x <= 0) {
    block.speed *= -1;
  }
  block.x += block.speed;
}

function calculateOverlap() {
  let block = blocks[blocks.length - 1];
  let prevBlock = blocks[blocks.length - 2];
  if (!prevBlock) return BLOCK_WIDTH;
  let overlap =
    Math.min(block.x + block.width, prevBlock.x + prevBlock.width) -
    Math.max(block.x, prevBlock.x);
  return overlap;
}

function checkPowerUp() {
  if (score % 5 == 0) {
    let powerUp = Math.floor(Math.random() * 4);

    if (powerUp == 0) {
      doublePoints = true;
      currPower = "Double Points";
    } else if (powerUp == 1) {
      doubleBlock = true;
      currPower = "Double Block";
    } else if (powerUp == 2) {
      autoPlace = true;
      currPower = "Auto Place";
    } else {
      extraLife = true;
      currPower = "Extra life";
    }
  }
}
function playAudio() {
  placeSound.pause();
  placeSound.currentTime = 0;
  placeSound.play();
}

function placePerfect(block) {
  // place the current block perfectly on top of the previous block
  block.x = block.prevBlock.x;
  block.width = block.prevBlock.width;
  block.stop = true;
  block.nextWidth = block.width;
  currPower = "None";
}

function scoreControl(overlap) {
  if (doublePoints) {
    if (doublePointCount <= 3) {
      score++;
      score++;
      doublePointCount++;
    } else {
      doublePointCount = 0;
      doublePoints = false;
      currPower = "None";
    }
  } else {
    score++;
  }

  // check and count perfectly placed blocks
  if (overlap <= currBlock.width + 0.9 && overlap >= currBlock.width - 0.9) {
    penaltyCount = 0;
  } else {
    penaltyCount++;
  }

  if (score >= 35) {
    win = true;
  }
}

function animateParticles() {
  particles.forEach((particle, index) => {
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    if (index % 2 === 0) particles.splice(index, 1);
  });
}

function makeHeart(x, y, isAlive) {
  let heart = new Path2D();

  if (isAlive) {
    ctx.fillStyle = "red";
  } else {
    ctx.fillStyle = "red";
  }
  heart.moveTo(x, y);
  heart.bezierCurveTo(x, y + 20, x - 20, y + 20, x - 20, y);
  heart.bezierCurveTo(x - 20, y - 30, x, y - 50, x, y - 50);
  heart.bezierCurveTo(x + 20, y - 50, x + 20, y - 30, x + 20, y);
  heart.bezierCurveTo(x + 20, y + 20, x, y + 20, x, y);

  ctx.fill(heart);
}

function startOver() {
  gameOver = false;
  win = false;
  score = 0;
  count = 0;
  lifeCount = 2;
  blocks = [];
  currBlock = null;
  penaltyCount = 0;
  currPower = "None";
  doubleBlock = false;
  doublePoints = false;
  autoPlace = false;
  extraLife = false;
  addBlock();
}

addBlock();
animate();

document.addEventListener("keydown", (event) => {
  if (lifeCount <= 0) {
    startOver();
    return;
  }

  if (win) {
    startOver();
    return;
  }

  if (event.key === " ") {
    if (doubleBlock) {
      currPower = "None";
      doubleBlock = false;
    }

    let overlap = calculateOverlap();

    // if the overlap is positive, set the next block's width to the overlap
    // and add a new block
    // or game over if the overlap is negative
    if (autoPlace) {
      placePerfect(currBlock);
      currBlock.generateParticles();
      playAudio();
      autoPlace = false;
      scoreControl(overlap);
      checkPowerUp();
      addBlock();
    } else if (overlap >= 0) {
      currBlock.nextWidth = overlap;
      currBlock.stop = true;
      playAudio();
      scoreControl(overlap);
      checkPowerUp();
      currBlock.generateParticles();
      addBlock();
    } else {
      if (extraLife) {
        lifeCount++;
        extraLife = false;
        currPower = "None";
      }

      lifeCount--;
    }
  }
});
