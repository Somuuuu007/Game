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
    // Load spike image
    this.load.image("spike", "/Spike.png");
  }

  create() {
    super.create();

    // Move player to spawn in top left corner room
    this.player.x = 100;
    this.player.y = 100;

    // Track spike trigger state
    this.wallSpikesTriggered = false;
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
    this.createPlatform(roomX + 230, wallHeight / 2, 20, wallHeight);

    // Small platform at the right end of the floor (touching it)
    const smallPlatformWidth = 80;
    const smallPlatformX = roomX + (roomWidth / 2) - smallPlatformWidth / 2;
    this.createPlatform(smallPlatformX, floorY - 20, smallPlatformWidth, 45);

    // Create 2 spikes at bottom left of right wall (invisible by default)
    const wallX = roomX + 230;
    const wallBottomY = floorY;
    const spikeSpacing = 15;

    this.wallSpike1 = this.add.image(wallX - 18, wallBottomY + 10, "spike");
    this.wallSpike1.setOrigin(0.5, 0.5);
    this.wallSpike1.setAngle(-90); // Point left
    this.wallSpike1.setDepth(11);
    this.wallSpike1.setAlpha(0); // Invisible by default

    this.wallSpike2 = this.add.image(wallX - 18, wallBottomY + 10 + spikeSpacing, "spike");
    this.wallSpike2.setOrigin(0.5, 0.5);
    this.wallSpike2.setAngle(-90); // Point left
    this.wallSpike2.setDepth(11);
    this.wallSpike2.setAlpha(0); // Invisible by default

    // Create collision rectangles for the spikes
    this.wallSpikeCollider1 = this.add.rectangle(wallX - 18, wallBottomY + 10, 40, 40);
    this.wallSpikeCollider1.setDepth(10);
    this.physics.add.existing(this.wallSpikeCollider1, true);

    this.wallSpikeCollider2 = this.add.rectangle(wallX - 18, wallBottomY + 10 + spikeSpacing, 40, 40);
    this.wallSpikeCollider2.setDepth(10);
    this.physics.add.existing(this.wallSpikeCollider2, true);

  }

  update() {
    super.update();

    // Check if player touches the wall spike area to make them visible
    if (!this.wallSpikesTriggered && !this.levelComplete) {
      const distanceToSpike1 = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        this.wallSpikeCollider1.x, this.wallSpikeCollider1.y
      );

      const distanceToSpike2 = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        this.wallSpikeCollider2.x, this.wallSpikeCollider2.y
      );

      // Trigger when player is close to either spike
      if (distanceToSpike1 < 40 || distanceToSpike2 < 40) {
        this.wallSpikesTriggered = true;

        // Make spikes visible
        this.wallSpike1.setAlpha(1);
        this.wallSpike2.setAlpha(1);

        // Add collision detection
        this.physics.add.overlap(this.player, this.wallSpikeCollider1, this.handleWallSpikeCollision, null, this);
        this.physics.add.overlap(this.player, this.wallSpikeCollider2, this.handleWallSpikeCollision, null, this);
      }
    }
  }

  handleWallSpikeCollision() {
    if (!this.levelComplete) {
      this.levelComplete = true;
      this.player.play("death");
      this.player.body.setVelocity(0, 0);
      this.player.body.setAllowGravity(false);

      // Restart level after death animation
      this.player.once("animationcomplete", () => {
        this.scene.restart();
      });
    }
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
