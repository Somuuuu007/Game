import { useEffect } from "react";
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";

class Level1Scene extends BaseScene {
  constructor() {
    super("Level1");
    this.backgroundKey = "background1";
    this.groundPlatformHeight = 80; // Smaller height for this level
    this.platformColor = 0x000000; // Dark blue color for this level
    this.levelWidth = window.innerWidth; // Single screen width for this level
    this.doorX = window.innerWidth - 150; // Door near the end
  }

  loadLevelAssets() {
    // Load Level 1 specific background - using the complete image
    this.load.image("background1", "/background 1/orig_big.png");
    // Load rock sprite
    this.load.image("rock", "/rock.png");
  }

  create() {
    super.create();

    // Add rock above the ground platform
    this.rock = this.add.image(window.innerWidth / 3, window.innerHeight - 95, "rock");
    this.rock.setScale(2);
    this.rock.setDepth(5);

    // Track if rock should follow player
    this.rockActivated = false;
  }

  update() {
    super.update();

    // Check if player has passed the rock by 50 pixels
    if (!this.rockActivated && this.player.x > this.rock.x + 60) {
      this.rockActivated = true;
    }

    // If rock is activated, make it follow the player
    if (this.rockActivated) {
      const speed = 2.5;

      // Rock moves horizontally towards player
      if (this.player.body.velocity.x !== 0) {
        // Player is moving, rock follows
        if (this.rock.x < this.player.x) {
          this.rock.x += speed;
        }
      }
      // When player stops, rock stops too (no movement needed)
    }
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
