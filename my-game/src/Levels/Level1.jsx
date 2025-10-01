import { useEffect } from "react";
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";

class Level1Scene extends BaseScene {
  constructor() {
    super("Level1");
    this.backgroundKey = "background1";
    this.groundPlatformHeight = 80; // Smaller height for this level
    this.platformColor = 0x000000; // Dark blue color for this level
  }

  loadLevelAssets() {
    // Load Level 1 specific background - using the complete image
    this.load.image("background1", "/background 1/orig_big.png");
  }

  create() {
    super.create();

    // Adjust door position for this level's ground height
    this.door.y = window.innerHeight - 80;
  }

  createPlatforms() {
    // Add Level 1 specific platforms here
  }

  onLevelComplete() {
    // Go to next level (for now, restart)
    this.scene.restart();
    // Later: this.scene.start("Level2");
  }
}

const Level1 = () => {
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
        scene: [Level1Scene],
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

export default Level1;
