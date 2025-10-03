import { useEffect } from "react";
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";

export class Level11Scene extends BaseScene {
  constructor() {
    super("Level11");
    this.backgroundKey = "background11";
    this.groundPlatformHeight = 80; // Smaller height for this level
    this.platformColor = 0x000000; // Dark blue color for this level
    this.levelWidth = window.innerWidth; // Single screen width for this level
    this.doorX = window.innerWidth - 150; // Door near the end
  }

  loadLevelAssets() {
    // Load Level 11 specific background - using the complete image
    this.load.image("background11", "/background 1/orig_big11.png");
    // Load rock sprite
    this.load.image("rock", "/rock.png");
  }

  create() {
    super.create();

    // Add rock above the ground platform with physics
    this.rock = this.physics.add.sprite(window.innerWidth / 3, window.innerHeight - 95, "rock");
    this.rock.setScale(2);
    this.rock.setDepth(5);
    this.rock.body.setAllowGravity(false);
    this.rock.body.setImmovable(true);

    // Add overlap detection between player and rock
    this.physics.add.overlap(this.player, this.rock, this.checkRockCollision, null, this);

    // Track if rock should follow player
    this.rockActivated = false;
  }

  checkRockCollision(player, rock) {
    // Only kill player if they are moving left (backing into the rock)
    if (player.body.velocity.x < 0 && !this.levelComplete) {
      this.levelComplete = true;
      player.play("death");
      player.body.setVelocity(0, 0);
      player.body.setAllowGravity(false);

      // Restart level after death animation
      player.once("animationcomplete", () => {
        this.scene.restart();
      });
    }
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

      // Rock moves horizontally towards player only when moving right and player is ahead by 60px
      if (this.player.body.velocity.x > 0 && this.player.x > this.rock.x + 60) {
        // Player is moving right and is ahead, rock follows
        this.rock.x += speed;
      }
      // When player stops or moves left, rock stops
    }
  }

  createPlatforms() {
    // Add Level 11 specific platforms here
  }

  onLevelComplete() {
    // Save next level to localStorage
    localStorage.setItem('currentLevel', 'Level12');
    // Go to Level 12 (or restart for now)
    this.scene.restart();
    // Later: this.scene.start("Level12");
  }
}

const Level11 = () => {
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
        scene: [Level11Scene],
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

export default Level11;
