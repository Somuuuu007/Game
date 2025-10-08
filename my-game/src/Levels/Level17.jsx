import { useEffect } from "react";
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";

export class Level17Scene extends BaseScene {
  constructor() {
    super("Level17");
    this.backgroundKey = "background17";
    this.groundPlatformHeight = 180; // Smaller height for this level
    this.platformColor = 0x212121; // Dark color for this level
    this.levelWidth = window.innerWidth ; // Single screen width for this level
    this.doorX = window.innerWidth - 250; // Door near the end
  }

  loadLevelAssets() {
    // Load Level 17 specific background
    this.load.image("background17", "/background 1/orig_big17.png");

  }

  create() {
    super.create();
    this.player.x = 250;
    this.player.y = window.innerHeight - 300;

    // Move the default door (from BaseScene) to the left side and hide it initially
    this.door.x = 150 / 2;
    this.door.y = window.innerHeight - 180;
    this.door.setAlpha(0); // Hidden initially

    // Create a visible but non-functional door on the right side
    const rightDoorX = window.innerWidth - 250;
    const rightDoorY = window.innerHeight - 180;
    this.rightDoor = this.add.sprite(rightDoorX, rightDoorY, "door_17");
    this.rightDoor.setScale(0.3);
    this.rightDoor.setOrigin(0.5, 1);
    this.rightDoor.setDepth(0);
    this.rightDoor.play("door_closed");

    // Track rotation state
    this.rotationStarted = false;
    this.rotationComplete = false;
  }

  update() {
    super.update();

    // Start rotating the left wall clockwise when player reaches half of screen
    if (!this.rotationStarted && !this.levelComplete && this.player.x >= window.innerWidth / 2) {
      this.rotationStarted = true;

      // Rotate clockwise (positive angle) - 180 degrees rotation
      this.tweens.add({
        targets: this.leftWall,
        angle: 180,
        duration: 5000, // 12 seconds for full rotation
        ease: 'Linear',
        onComplete: () => {
          this.rotationComplete = true;
          // Gradually reveal the door as wall rotates
          this.door.setAlpha(1);
        }
      });

      // Gradually reveal the door during rotation
      this.tweens.add({
        targets: this.door,
        alpha: 1,
        duration: 18000,
        ease: 'Linear'
      });
    }
  }

  createPlatforms() {
    const boundaryWidth = 150;

    // Calculate diagonal length to cover entire screen when rotated
    // Multiply by 1.5 to ensure full coverage during rotation
    const diagonalLength = Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)) * 1.5;

    // Left boundary wall - will rotate clockwise
    // Set rotation origin lower than middle for challenging gameplay
    this.leftWall = this.add.rectangle(
      boundaryWidth / 2,
      window.innerHeight / 2,
      boundaryWidth,
      diagonalLength, // Use extended diagonal length
      this.platformColor
    );
    this.physics.add.existing(this.leftWall, true);
    this.platforms.add(this.leftWall);

    // Set origin to lower-right (right edge, 65% down from top)
    this.leftWall.setOrigin(1, 0.65);
    // Adjust position after changing origin
    this.leftWall.x = boundaryWidth;
    this.leftWall.y = window.innerHeight * 0.65;

    // Right boundary wall
    this.rightWall = this.createPlatform(
      window.innerWidth - boundaryWidth / 2,
      window.innerHeight / 2,
      boundaryWidth,
      window.innerHeight
    );

    // Top ceiling platform (same dimensions as ground)
    this.topCeiling = this.createPlatform(
      window.innerWidth / 2,
      180 / 2,
      window.innerWidth,
      180
    );
  }

  onLevelComplete() {
    // Save next level to localStorage
    localStorage.setItem('currentLevel', 'Level18');
    // Go to Level 18 (or restart for now)
    this.scene.restart();
    // Later: this.scene.start("Level18");
  }
}

const Level17 = () => {
  useEffect(() => {
    let game;

    const createGame = () => {
      const config = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        parent: "phaser-container",
        physics: {
          default: "arcade",
          arcade: {
            gravity: { y: 1000 },
            debug: false,
          },
        },
        scene: [Level17Scene],
      };

      game = new Phaser.Game(config);
    };

    createGame();

    return () => {
      if (game) game.destroy(true);
    };
  }, []);

  return <div id="phaser-container"></div>;
};

export default Level17;
