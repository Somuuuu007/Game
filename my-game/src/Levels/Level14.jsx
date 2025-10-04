import { useEffect } from "react";
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";

export class Level14Scene extends BaseScene {
  constructor() {
    super("Level14");
    this.backgroundKey = "background14";
    this.groundPlatformHeight = 20; // Smaller height for this level
    this.platformColor = 0x212121; // Dark blue color for this level
    this.levelWidth = window.innerWidth; // Single screen width for this level
    this.doorX = window.innerWidth - 150; // Door near the end
  }

  loadLevelAssets() {
    // Load Level 14 specific background
    this.load.image("background14", "/background 1/orig_big14.png");
  }

  create() {
    super.create();
  }

  update() {
    super.update();
  }

  createPlatforms() {
    // Add Level 14 specific platforms here
  }

  onLevelComplete() {
    // Save next level to localStorage
    localStorage.setItem('currentLevel', 'Level15');
    // Go to Level 15 (or restart for now)
    this.scene.restart();
    // Later: this.scene.start("Level15");
  }
}

const Level14 = () => {
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
        scene: [Level14Scene],
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

export default Level14;
