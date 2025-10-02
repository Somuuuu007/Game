import { useEffect } from "react";
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";

export class Level2Scene extends BaseScene {
  constructor() {
    super("Level2");
    this.backgroundKey = "background2";
    this.groundPlatformHeight = 600; // Much taller ground platform
    this.groundPlatformWidth = 200; // Much taller ground platform
    this.platformColor = 0x212121;
    this.levelWidth = window.innerWidth; // Single screen width like Level 1
    this.doorX = 1380; // Door on the last step

  }

  loadLevelAssets() {
    // Load Level 2 specific background
    this.load.image("background2", "/background 1/orig_big2.png"); // Change this when you have Level 2 background
  }

  create() {
    super.create();

    // Adjust player spawn position for the taller ground
    this.player.y = window.innerHeight - 700;

    // Make door visible first - position it on screen
    this.door.x = 1300;
    this.door.y = window.innerHeight - 102;
  }

  createPlatforms() {
    // Create individual steps with custom properties

    // Step 1
    this.createPlatform(280, 500, 200, window.innerHeight - 150);

    // Step 2 - Disappearing step (trap)
    this.disappearingStep = this.add.rectangle(480, 600, 200, window.innerHeight - 120, 0x212121);
    this.physics.add.existing(this.disappearingStep, true);
    this.platforms.add(this.disappearingStep);

    this.createPlatform(680, 700, 200, window.innerHeight - 90);
    this.createPlatform(880, 800, 200, window.innerHeight - 60);
    this.createPlatform(1080, 900, 200, window.innerHeight - 30);
    this.createPlatform(1280, 1000, 200, window.innerHeight - 0);

    // Track if step has been touched
    this.stepTouched = false;
  }

  update() {
    super.update();

    // Check if player is standing on the disappearing step
    if (!this.stepTouched && this.disappearingStep && this.player.body.touching.down) {
      // Check if player is overlapping with the disappearing step
      const playerBounds = this.player.getBounds();
      const stepBounds = this.disappearingStep.getBounds();

      if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, stepBounds)) {
        this.stepTouched = true;

        // Remove from platforms group and destroy
        this.platforms.remove(this.disappearingStep);
        this.disappearingStep.destroy();
      }
    }

    // Check if player has fallen to the bottom ground (death zone)
    if (this.player.y >= window.innerHeight - 50 && !this.levelComplete) {
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
