import { useEffect } from "react";
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";

export class Level19Scene extends BaseScene {
  constructor() {
    super("Level19");
    this.backgroundKey = "background19";
    this.groundPlatformHeight = null; // Disable automatic ground platform
    this.platformColor = 0x212121; // Dark color for this level
    this.levelWidth = window.innerWidth; // Single screen width for this level
    this.doorX = window.innerWidth - 250; // Door near the end
  }

  loadLevelAssets() {
    // Load Level 19 specific background
    this.load.image("background19", "/background 1/orig_big19.png");
  }

  create() {
    super.create();

    // Spawn player on the right side platform
    this.player.x = window.innerWidth - 150;
    this.player.y = window.innerHeight - 250;
  }

  update() {
    super.update();
  }

  createPlatforms() {
    // Right side platform where player spawns (300x150)
    const platformWidth = 300;
    const platformHeight = 150;

    // Bottom platform
    this.createPlatform(
      window.innerWidth - platformWidth / 2,
      window.innerHeight - platformHeight / 2,
      platformWidth,
      platformHeight
    );

    // Top platform - 200px above the bottom platform
    this.createPlatform(
      window.innerWidth - platformWidth / 2 ,
      window.innerHeight - platformHeight / 2 - 420,
      platformWidth + 700,
      platformHeight + 100
    );
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
