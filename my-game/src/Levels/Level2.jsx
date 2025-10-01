import { useEffect } from "react";
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";

export class Level2Scene extends BaseScene {
  constructor() {
    super("Level2");
    this.backgroundKey = "background2";
    this.groundPlatformHeight = 80;
    this.platformColor = 0x000000;
    this.levelWidth = window.innerWidth; // Single screen width like Level 1
    this.doorX = window.innerWidth - 150; // Door near the end
  }

  loadLevelAssets() {
    // Load Level 2 specific background
    this.load.image("background2", "/background 1/orig_big.png"); // Change this when you have Level 2 background
  }

  createPlatforms() {
    // Add Level 2 specific platforms here
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
