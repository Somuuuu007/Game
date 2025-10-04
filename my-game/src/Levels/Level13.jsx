import { useEffect } from "react";
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";

export class Level13Scene extends BaseScene {
  constructor() {
    super("Level13");
    this.backgroundKey = "background13";
    this.groundPlatformHeight = 120; // Smaller height for this level
    this.platformColor = 0x212121; // Dark blue color for this level
    this.levelWidth = window.innerWidth; // Single screen width for this level
    this.doorX = window.innerWidth - 150; // Door near the end
  }

  loadLevelAssets() {
    // Load Level 13 specific background
    this.load.image("background13", "/background 1/orig_big13.png");
    // Load spike image
    this.load.image("spike", "/Spike.png");
  }

  create() {
    super.create();

    // Create T-shaped pole at 1/4 of screen
    const poleX = window.innerWidth / 4;
    const poleColor = 0x212121; // Brown color for the pole
    const groundTop = window.innerHeight - 120; // Top of the ground platform
    const poleHeight = 200;

    // Vertical part of the T (pole) - slim
    const verticalPole = this.add.rectangle(poleX, groundTop - poleHeight / 2, 12, poleHeight, poleColor);
    verticalPole.setDepth(10);

    // Horizontal part of the T (top) - longer and slim
    const horizontalPole = this.add.rectangle(poleX, groundTop - poleHeight, 100, 10, poleColor);
    horizontalPole.setDepth(10);

    // Add spikes on each end of horizontal pole
    const spikeLeftX = poleX - 40; // Left end of horizontal pole
    const spikeRightX = poleX + 40; // Right end of horizontal pole
    const spikeY = groundTop - poleHeight + 21; // At the bottom edge of horizontal bar

    // Left spike
    const leftSpike = this.add.image(spikeLeftX, spikeY, "spike");
    leftSpike.setOrigin(0.5, 0);
    leftSpike.setAngle(180); // Point downward
    leftSpike.setDepth(11);

    // Right spike
    const rightSpike = this.add.image(spikeRightX, spikeY, "spike");
    rightSpike.setOrigin(0.5, 0);
    rightSpike.setAngle(180); // Point downward
    rightSpike.setDepth(11);
  }

  update() {
    // Override speed for this level to make it more difficult
    if (!this.levelComplete) {
      const speed = 300; // Reduced speed from default 300
      const jumpPower = -400;

      this.isOnGround = this.player.body.touching.down || this.player.body.blocked.down;

      // Horizontal movement
      if (this.cursors.left.isDown || this.aKey.isDown) {
        this.player.setVelocityX(-speed);
        this.player.setFlipX(true);

        if (this.isOnGround && this.player.anims.currentAnim.key !== "run") {
          this.player.play("run");
        }
      } else if (this.cursors.right.isDown || this.dKey.isDown) {
        this.player.setVelocityX(speed);
        this.player.setFlipX(false);

        if (this.isOnGround && this.player.anims.currentAnim.key !== "run") {
          this.player.play("run");
        }
      } else {
        this.player.setVelocityX(0);

        if (this.isOnGround && this.player.anims.currentAnim.key !== "idle") {
          this.player.play("idle");
        }
      }

      // Jumping
      if ((Phaser.Input.Keyboard.JustDown(this.spaceKey) || Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.wKey)) && this.isOnGround) {
        this.player.setVelocityY(jumpPower);
        this.player.play("jump");
      }

      if (!this.isOnGround && this.player.anims.currentAnim.key !== "jump") {
        this.player.play("jump");
      }

      // Door logic
      const distanceToDoor = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        this.door.x, this.door.y
      );

      if (distanceToDoor < 200 && !this.doorOpen) {
        this.doorOpen = true;
        this.door.play("door_opening");
        this.door.once("animationcomplete", () => {
          this.door.play("door_open");
        });
      }

      if (Math.abs(this.player.x - this.door.x) < 10 && distanceToDoor < 40 && this.doorOpen && !this.levelComplete) {
        this.levelComplete = true;
        this.player.body.setVelocity(0, 0);
        this.player.body.setAllowGravity(false);
        this.player.setFlipX(false);
        this.player.stop();
        this.player.play("walkup", true);

        this.player.once("animationcomplete", () => {
          this.cameras.main.fadeOut(500, 0, 0, 0);
          this.cameras.main.once("camerafadeoutcomplete", () => {
            this.onLevelComplete();
          });
        });
      }
    }
  }

  createPlatforms() {
    // Add Level 13 specific platforms here
  }

  onLevelComplete() {
    // Save next level to localStorage
    localStorage.setItem('currentLevel', 'Level14');
    // Go to Level 14 (or restart for now)
    this.scene.restart();
    // Later: this.scene.start("Level14");
  }
}

const Level13 = () => {
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
        scene: [Level13Scene],
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

export default Level13;
