import { useEffect } from "react";
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";

export class Level2Scene extends BaseScene {
  constructor() {
    super("Level2");
    this.backgroundKey = "background2";
    this.groundPlatformHeight = 600; // Much taller ground platform
    this.groundPlatformWidth = 200; // Much taller ground platform
    this.platformColor = 0x212121;
    this.levelWidth = window.innerWidth; // Single screen width like Level 1
    this.doorX = window.innerWidth - 150; // Door near the end
    
  }

  loadLevelAssets() {
    // Load Level 2 specific background
    this.load.image("background2", "/background 1/orig_big2.png"); // Change this when you have Level 2 background
  }

  create() {
    super.create();

    // Adjust player spawn position for the taller ground
    this.player.y = window.innerHeight - 700;
  }

  createPlatforms() {
    // Create descending steps from player position to door
    const stepWidth = 200;
    const stepHeight = 100;
    const verticalGap = 80; // Distance between each step vertically
    const horizontalGap = 200; // Distance between each step horizontally

    const startX = 100; // Starting position for first step
    const startY = 200; // Just below player spawn
    const numSteps = 7; // Number of steps to reach the door

    // Create descending steps
    for (let i = 0; i < numSteps; i++) {
      const stepX = startX + (i * horizontalGap);
      const stepY = startY + (i * verticalGap);

      this.createPlatform(stepX, stepY, stepWidth, stepHeight);
    }
  }

  onLevelComplete() {
    // Go to next level (for now, restart)
    this.scene.restart();
    // Later: this.scene.start("Level3");
  }
}

const Level2 = () => {
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
        scene: [Level2Scene],
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

export default Level2;
