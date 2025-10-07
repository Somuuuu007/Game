import { useEffect } from "react";
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";

export class Level17Scene extends BaseScene {
  constructor() {
    super("Level17");
    this.backgroundKey = "background17";
    this.groundPlatformHeight = 80; // Smaller height for this level
    this.platformColor = 0x000000; // Dark color for this level
    this.levelWidth = window.innerWidth; // Single screen width for this level
    this.doorX = window.innerWidth - 150; // Door near the end
  }

  loadLevelAssets() {
    // Load Level 17 specific background
    this.load.image("background17", "/background 1/orig_big17.png");
  }

  create() {
    super.create();
  }

  update() {
    super.update();
  }

  createPlatforms() {
    // Add Level 17 specific platforms here
  }

  onLevelComplete() {
    // Save next level to localStorage
    localStorage.setItem('currentLevel', 'Level18');
    // Go to Level 18 (or restart for now)
    this.scene.restart();
    // Later: this.scene.start("Level18");
  }
}

const Level17 = () => {
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
        scene: [Level17Scene],
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

export default Level17;
