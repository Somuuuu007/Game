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
    this.doorX = 1380; // Door on the last step

  }

  loadLevelAssets() {
    // Load Level 2 specific background
    this.load.image("background2", "/background 1/orig_big2.png"); // Change this when you have Level 2 background
  }

  create() {
    super.create();

    // Adjust player spawn position for the taller ground
    this.player.y = window.innerHeight - 700;

    // Make door visible first - position it on screen
    this.door.x = 1300;
    this.door.y = window.innerHeight - 102;
  }

  createPlatforms() {
    // Create individual steps with custom properties

    // Step 1
    this.createPlatform(0, 400, 200, window.innerHeight - 280);
    this.createPlatform(280, 500, 200, window.innerHeight - 150);
    this.createPlatform(480, 600, 200, window.innerHeight - 120);
    this.createPlatform(680, 700, 200, window.innerHeight - 90);
    this.createPlatform(880, 800, 200, window.innerHeight - 60);
    this.createPlatform(1080, 900, 200, window.innerHeight - 30);
    this.createPlatform(1280, 1000, 200, window.innerHeight - 0);
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
