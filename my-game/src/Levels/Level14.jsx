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

    // Move player to spawn in top left corner room
    this.player.x = 100;
    this.player.y = 100;
  }

  createPlatforms() {
    // Create a room in the top left corner
    const roomWidth = 250;
    const roomX = 100;
    const roomY = 100;
    const floorY = roomY + 75;

    // Floor of the room
    this.createPlatform(roomX, floorY, roomWidth, 20);

    // Right wall (moved to the right with gap, extends to top of screen)
    const wallHeight = roomY + 75 + 50; // Height from top to below floor
    this.createPlatform(roomX + 200, wallHeight / 2, 20, wallHeight);

    // Small platform at the right end of the floor (touching it)
    const smallPlatformWidth = 80;
    const smallPlatformX = roomX + (roomWidth / 2) - smallPlatformWidth / 2;
    this.createPlatform(smallPlatformX, floorY - 15, smallPlatformWidth, 15);

  }

  update() {
    super.update();
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
