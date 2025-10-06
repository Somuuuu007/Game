import { useEffect } from "react";
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";

export class Level16Scene extends BaseScene {
  constructor() {
    super("Level16");
    this.backgroundKey = "background16";
    this.groundPlatformHeight = 140; // Smaller height for this level
    this.platformColor = 0x212121; // Dark color for this level
    this.levelWidth = window.innerWidth; // Single screen width for this level
    this.doorX = window.innerWidth - 150; // Door near the end
  }

  loadLevelAssets() {
    // Load Level 16 specific background
    this.load.image("background16", "/background 1/orig_big16.png");
  }

  create() {
    super.create();
  }

  update() {
    super.update();
    
  }

  createPlatforms() {
    const wallThickness = 80;

    // Create two platforms on the right side of the screen (connected to the right edge)
    const platformWidth = 130;
    const platformHeight = 15;

    // First platform (lower)
    this.rightPlatform1 = this.createPlatform(
      window.innerWidth - platformWidth / 2,
      window.innerHeight - 250,
      platformWidth,
      platformHeight
    );

    // Second platform (higher, above the first one)
    this.rightPlatform2 = this.createPlatform(
      window.innerWidth - platformWidth / 2,
      window.innerHeight - 450,
      platformWidth,
      platformHeight
    );
  }

  onLevelComplete() {
    // Save next level to localStorage
    localStorage.setItem('currentLevel', 'Level17');
    // Go to Level 17 (or restart for now)
    this.scene.restart();
    // Later: this.scene.start("Level17");
  }
}

const Level16 = () => {
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
        scene: [Level16Scene],
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

export default Level16;
