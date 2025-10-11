import { useEffect } from "react";
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";

export class Level20Scene extends BaseScene {
  constructor() {
    super("Level20");
    this.backgroundKey = "background20";
    this.groundPlatformHeight = 80; // Smaller height for this level
    this.platformColor = 0x212121; // Dark color for this level
    this.levelWidth = window.innerWidth; // Single screen width for this level
    this.doorX = 150; // Door on the left side
  }

  loadLevelAssets() {
    // Load Level 20 specific background
    this.load.image("background20", "/background 1/orig_big20.png");
  }

  create() {
    super.create();

    // Move player to the right side
    this.player.x = window.innerWidth - 200;
    this.player.y = window.innerHeight - 200;
  }

  update() {
    super.update();
  }

  createPlatforms() {
    // Right side platform connected to the bottom platform
    const platformWidth = 200;
    const platformHeight = 80;

    // Create platform on the right side, connected to the ground
    this.rightPlatform = this.createPlatform(
      window.innerWidth - platformWidth / 2,
      window.innerHeight - this.groundPlatformHeight - platformHeight / 2,
      platformWidth,
      platformHeight
    );

    // Second platform to the left of the first platform
    const gap = 200; // Distance between platforms
    this.secondPlatform = this.createPlatform(
      window.innerWidth - platformWidth / 2 - platformWidth - gap,
      window.innerHeight - this.groundPlatformHeight - platformHeight / 2,
      platformWidth,
      platformHeight + 80
    );
  }

  onLevelComplete() {
    // Save next level to localStorage
    localStorage.setItem('currentLevel', 'Level21');
    // Go to Level 21 (or restart for now)
    this.scene.restart();
    // Later: this.scene.start("Level21");
  }
}

const Level20 = () => {
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
        scene: [Level20Scene],
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

export default Level20;
