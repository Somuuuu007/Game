import { useEffect } from "react";
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";

export class Level15Scene extends BaseScene {
  constructor() {
    super("Level15");
    this.backgroundKey = "background15";
    this.groundPlatformHeight = 80; // Smaller height for this level
    this.platformColor = 0x212121; // Dark blue color for this level
    this.levelWidth = window.innerWidth; // Single screen width for this level
    this.doorX = window.innerWidth - 150; // Door near the end
  }

  loadLevelAssets() {
    // Load Level 15 specific background
    this.load.image("background15", "/background 1/orig_big15.png");
  }

  create() {
    super.create();
  }

  update() {
    super.update();
  }

  createPlatforms() {
    // Add Level 15 specific platforms here
  }

  onLevelComplete() {
    // Save next level to localStorage
    localStorage.setItem('currentLevel', 'Level16');
    // Go to Level 16 (or restart for now)
    this.scene.restart();
    // Later: this.scene.start("Level16");
  }
}

const Level15 = () => {
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
        scene: [Level15Scene],
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

export default Level15;
