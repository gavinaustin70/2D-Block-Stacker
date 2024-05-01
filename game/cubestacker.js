// File Title: cubestacker.js
// Author: Gavin Austin

// data fields

const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");

// audio from the ../sounds folder
const placeSound = new Audio("../sounds/placeblocksound.mp3");

// constant block width and height
const BLOCK_WIDTH = 100;
const BLOCK_HEIGHT = 600.0 / 35.0;

// game variables
let gameOver = false;
let win = false;
let score = 0;
let lifeCount = 2;
let currBlock;
let penaltyCount = 0;
let currPower = "None";
let doubleBlock = false;
let doublePoints = false;
let autoPlace = false;
let extraLife = false;
let doublePointCount = 0;

// keep track of the number of blocks placed (useful for calculating
// what side the next block should be placed on)
let blocksPlaced = 0;

// arrays to store blocks and particles
let blocks = [];
let particles = [];

//change background color
canvas.style.backgroundColor = "black";

/**
 * Block class
 *
 * Represents a block in the game
 *
 * @param {string} color - the color of the block
 * @param {number} width - the width of the block
 * @param {number} height - the height of the block
 * @param {number} x - the x position of the block
 * @param {number} y - the y position of the block
 * @param {number} speed - the speed of the block
 * @param {boolean} stop - whether the block should stop moving
 * @param {Block} prevBlock - the previous block
 * @param {number} nextWidth - the width of the next block
 */
class Block {
  constructor() {
    this.color = getRandomColor();
    this.nextWidth = BLOCK_WIDTH;
    this.prevBlock = blocks[blocks.length - 1];

    // if there is a previous block, set the width to the overlap of the
    // last 2 blocks
    if (this.prevBlock) {
      this.width = this.prevBlock.nextWidth;

      // double the width of the block if the doubleBlock power-up is active
      if (doubleBlock) {
        this.width *= 2;
      }

      // if the penalty count is 7, halve the width of the block
      // if the penalty count is 10, subtract a life
      if (penaltyCount == 7) {
        this.width *= 0.5;
      } else if (penaltyCount == 10) {
        lifeCount--;
      }
    } else {
      this.width = BLOCK_WIDTH;
    }
    this.height = BLOCK_HEIGHT;

    // set the y position of the block based on the number of blocks placed
    this.y = canvas.height - BLOCK_HEIGHT - blocksPlaced * BLOCK_HEIGHT;
    blocksPlaced++;
    this.stop = false;

    // set the speed of the block based on the width
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

    // set the x position of the block based on the number of blocks placed
    if (blocksPlaced % 2 == 0) {
      this.x = canvas.width / 4 + this.width;
      this.speed *= 1;
    } else {
      // if the width of the block is greater than 100, set the x position to the right
      if (this.width > 100) {
        this.x = canvas.width / 1.5;
      } else {
        this.x = canvas.width - canvas.width / 4 - this.width;
      }

      this.speed *= -1;
    }
  }

  // draw the block
  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  // update / move the block
  update() {
    if (!this.stop) {
      moveBlock(this);
    }
  }

  // generate particles when the block is placed
  generateParticles() {
    const numParticles = 250;
    const particleSize = 4.0;

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

/**
 * getRandomColor Method
 *
 * Generates a random color
 *
 * @returns a random color
 */
function getRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

  return `rgb(${r},${g},${b})`;
}

/**
 * addBlock Method
 *
 * Adds a new block to the game
 */
function addBlock() {
  // if the game is over, return
  if (gameOver) return;

  // create a new block and add it to the blocks array
  let block = new Block();
  blocks.push(block);
  currBlock = block;
}

/**
 * animate Method
 *
 * The main animation loop
 *
 * Clears the canvas, draws the blocks, updates the blocks, and draws the score.
 *
 * If the game is over, display "Game Over" on the screen.
 * If the player wins, display "You Win!" on the screen.
 *
 */
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

  // draw particles
  animateParticles();

  requestAnimationFrame(animate);
}

/**
 * animateParticles Method
 * 
 * Animates the particles when a block is placed
 * 
 * The particles are drawn as circles with random x and y positions
 * 
 */
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

/**
 * move Block Method
 *
 * Moves the block left and right based on colliding with the canvas
 *
 * @param {Block} block - the block to move
 */
function moveBlock(block) {
  // if the block is at the edge of the canvas, reverse the speed
  if (block.x + block.width >= canvas.width || block.x <= 0) {
    block.speed *= -1;
  }

  // move the block based on speed
  block.x += block.speed;
}

/**
 * calculateOverlap Method
 *
 * Calculates the overlap of the last 2 blocks to determine the width of the next block
 *
 * @returns the overlap of the last 2 blocks
 */
function calculateOverlap() {
  // determine the last 2 blocks
  let block = blocks[blocks.length - 1];
  let prevBlock = blocks[blocks.length - 2];

  // if there is no previous block, return the block width
  if (!prevBlock) return BLOCK_WIDTH;

  // calculate the overlap of the last 2 blocks
  let overlap =
    Math.min(block.x + block.width, prevBlock.x + prevBlock.width) -
    Math.max(block.x, prevBlock.x);

  // return the overlap
  return overlap;
}

/**
 * checkPowerUp Method
 *
 * Checks if a power-up should be activated
 *
 * If the score is a multiple of 5, a power-up is activated
 * The power-up is chosen randomly from the following:
 * - Double Points
 * - Double Block
 * - Auto Place
 * - Extra Life
 */
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

/**
 * playAudio Method
 *
 * Plays the place block sound
 *
 * This method is called when a block is placed
 */
function playAudio() {
  // pause the sound and reset the time to 0
  placeSound.pause();
  placeSound.currentTime = 0;

  // play the sound
  placeSound.play();
}

/**
 * placePerfect Method
 *
 * Places the current block perfectly on top of the previous block
 *
 * @param {Block} block - the block to place perfectly
 */
function placePerfect(block) {
  // set the x position and width of the block to the previous block
  block.x = block.prevBlock.x;
  block.width = block.prevBlock.width;

  // stop the block from moving
  block.stop = true;

  // set the next width of the block to the width of the previous block
  block.nextWidth = block.width;

  // set the power-up to none
  currPower = "None";
}

/**
 * scoreControl Method
 *
 * Increases the score when a block is placed and checks for perfectly placed blocks
 * to determine if a penalty should be applied
 *
 * @param {double} overlap - the overlap of the last 2 blocks
 */
function scoreControl(overlap) {
  // double the score if the doublePoints power-up is active
  if (doublePoints) {
    if (doublePointCount <= 3) {
      score++;
      score++;
      doublePointCount++;
    } else {
      // reset the double points power-up
      doublePointCount = 0;
      doublePoints = false;
      currPower = "None";
    }
  } else {
    // increase the score by 1 if the doublePoints power-up is not active
    score++;
  }

  // check and count perfectly placed blocks (with a bit of tolerance)
  if (overlap <= currBlock.width + 0.9 && overlap >= currBlock.width - 0.9) {
    penaltyCount = 0;
  } else {
    penaltyCount++;
  }

  // if the score is greater than or equal to 35, the player wins
  if (score >= 35) {
    win = true;
  }
}

/**
 * startOver Method
 *
 * Restarts the game
 *
 * Resets all game variables and adds a new block
 */
function startOver() {
  gameOver = false;
  win = false;
  score = 0;
  blocksPlaced = 0;
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

// add the first block
addBlock();

// start the animation loop
animate();

// listen for a keydown action
document.addEventListener("keydown", (event) => {
  // if too many lives are lost, game over
  if (lifeCount <= 0) {
    startOver();
    return;
  }

  // if the player wins, restart the game when space is clicked next
  if (win) {
    startOver();
    return;
  }

  // if the keydown is the space bar, then place the block
  if (event.key === " ") {
    // if the doubleBlock power-up is active, reset the power-up
    if (doubleBlock) {
      currPower = "None";
      doubleBlock = false;
    }

    // calculate the overlap of the last 2 blocks
    let overlap = calculateOverlap();

    // if the overlap is positive, set the next block's width to the overlap
    // and add a new block
    // or game over if the overlap is negative

    // if the autoPlace power-up is active, place the block perfectly
    // and add a new block
    if (autoPlace) {
      placePerfect(currBlock);
      currBlock.generateParticles();
      playAudio();
      autoPlace = false;
      scoreControl(overlap);
      checkPowerUp();
      addBlock();

      // if the overlap is positive, set the next block's width to the overlap
    } else if (overlap >= 0) {
      currBlock.nextWidth = overlap;
      currBlock.stop = true;
      playAudio();
      scoreControl(overlap);
      checkPowerUp();
      currBlock.generateParticles();
      addBlock();
    } else {
      // if the extraLife power-up is active, reset the power-up
      if (extraLife) {
        lifeCount++;
        extraLife = false;
        currPower = "None";
      }

      // if the overlap is negative, subtract a life
      lifeCount--;
    }
  }
});
