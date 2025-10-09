import { useEffect } from "react";
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";

export class Level19Scene extends BaseScene {
  constructor() {
    super("Level19");
    this.backgroundKey = "background19";
    this.groundPlatformHeight = 80; // Smaller height for this level
    this.platformColor = 0x212121; // Dark color for this level
    this.levelWidth = window.innerWidth; // Single screen width for this level
    this.doorX = window.innerWidth - 150; // Door near the end
  }

  loadLevelAssets() {
    // Load Level 19 specific background
    this.load.image("background19", "/background 1/orig_big19.png");
  }

  create() {
    super.create();
  }

  update() {
    super.update();
  }

  createPlatforms() {
    // Add Level 19 specific platforms here
  }

  onLevelComplete() {
    // Save next level to localStorage
    localStorage.setItem('currentLevel', 'Level20');
    // Go to Level 20 (or restart for now)
    this.scene.restart();
    // Later: this.scene.start("Level20");
  }
}

const Level19 = () => {
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
        scene: [Level19Scene],
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

export default Level19;
