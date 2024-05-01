# 2D Block Stacker

2D Block Stacker is a browser-based game where you stack blocks to reach the top. The game features dynamic block sizes, power-ups, and particle effects.

## Technologies Used

- HTML5 Canvas
- JavaScript

## How to Play

1. Open `index.html` in a web browser.
2. Press the spacebar to place blocks.
3. Stack blocks as high as you can to earn points.
4. Try to stack blocks on top of each other so that they overlap "perfectly"
5. Power-ups may appear as you play every 5 points, providing benefits such as double points, double block width, extra lives, and auto-placement of blocks.

## How to Win
- Achieve a score of 35 points to win

## Features

- Dynamic block sizes: Blocks vary in width and speed as the game progresses.
- Power-ups: Random power-ups appear during gameplay, providing various benefits.
- Penalties: Making mistakes, such as not placing a block "perfectly" every 7 blocks or failing to place a "perfect" block within 10 blocks, incurs penalties, such as reduced block sizes and loss of lives.
- Particle effects: Particle effects enhance the visual experience when placing blocks.
- Score tracking: Keep track of your score as you stack blocks higher.

## Game Controls

- Spacebar: Place blocks

## Development

The game is developed using HTML5 Canvas for rendering and JavaScript for game logic.

### Code Structure

- `index.html`: HTML file containing the game canvas and necessary scripts.
- `sounds/placeblocksound.mp3`: Audio file for block placement sound effect.
- `libs`: Developed by the CS559 course staff. It contains various helper methods for UI and input
- `cubestacker.js`: Main JS file containing all animation and game logic

## Credits

- This game is inspired by various block-stacking games and was authored by Gavin Austin.

## Attribution
- Credit to the CS559 course staff for the screenshot and record button in index.html as well as everything in the /libs folder


