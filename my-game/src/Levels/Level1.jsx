import { useEffect } from "react";
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";

class Level1Scene extends BaseScene {
  constructor() {
    super("Level1");
    this.backgroundKey = "background1";
  }

  loadLevelAssets() {
    // Load Level 1 specific background
    this.load.image("background1", "/background.png");
  }

  createPlatforms() {
    // Add Level 1 specific platforms here
    // Customize these for your level design
    this.createPlatform(400, window.innerHeight - 200, 150, 20);
    this.createPlatform(700, window.innerHeight - 300, 150, 20);
    this.createPlatform(1000, window.innerHeight - 400, 150, 20);
    this.createPlatform(1400, window.innerHeight - 350, 150, 20);
    this.createPlatform(1800, window.innerHeight - 250, 150, 20);
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
