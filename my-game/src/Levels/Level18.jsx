import { useEffect } from "react";
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";

export class Level18Scene extends BaseScene {
  constructor() {
    super("Level18");
    this.backgroundKey = "background18";
    this.groundPlatformHeight = 200; // Smaller height for this level
    this.groundPlatformWidth = 200; // Smaller height for this level
    this.platformColor = 0x212121; // Dark color for this level
    this.levelWidth = window.innerWidth; // Single screen width for this level
    this.doorX = window.innerWidth - 150; // Door near the end
  }

  loadLevelAssets() {
    // Load Level 18 specific background
    this.load.image("background18", "/background 1/orig_big18.png");
  }

  create() {
    super.create();
    this.player.x = 100;
    this.player.y = window.innerHeight - 300;
  }

  update() {
    super.update();
  }

  createPlatforms() {
    // Second platform in front of the ground platform (top surfaces aligned)
    const platformWidth = 200;
    const platformHeight = 20;
    const groundPlatformHeight = 200;

    // Ground platform top surface is at: window.innerHeight - groundPlatformHeight
    // Front platform should have its top at the same position
    // So its center Y should be: topSurface + platformHeight/2
    this.frontPlatform = this.createPlatform(
      platformWidth + platformWidth / 2,
      window.innerHeight - groundPlatformHeight + platformHeight / 2,
      platformWidth,
      platformHeight
    );

    // Create a square obstacle at the center of the level (will move up/down later)
    const squareSize = 150;
    this.centerSquare = this.add.rectangle(
      window.innerWidth / 2,
      window.innerHeight - 250,
      squareSize,
      squareSize,
      this.platformColor
    );
    this.physics.add.existing(this.centerSquare, true); // Static body
    this.platforms.add(this.centerSquare);
  }

  onLevelComplete() {
    // Save next level to localStorage
    localStorage.setItem('currentLevel', 'Level19');
    // Go to Level 19 (or restart for now)
    this.scene.restart();
    // Later: this.scene.start("Level19");
  }
}

const Level18 = () => {
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
        scene: [Level18Scene],
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

export default Level18;
