import { useEffect } from "react";
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";

export class Level10Scene extends BaseScene {
  constructor() {
    super("Level10");
    this.backgroundKey = "background10";
    this.groundPlatformHeight = 300; // Much taller ground platform
    this.groundPlatformWidth = 200; // Much taller ground platform
    this.platformColor = 0x212121;
    this.levelWidth = window.innerWidth; // Single screen width like Level 1
    this.doorX = 1380; // Door on the last step

  }

  loadLevelAssets() {
    // Load Level 10 specific background
    this.load.image("background10", "/background 1/orig_big10.png");
    // Load spike image
    this.load.image("spike", "/Spike.png");
  }

  create() {
    super.create();

    // Adjust player spawn position
    this.player.y = window.innerHeight - 500;

    // Make door visible first - position it on screen
    this.door.x = window.innerWidth - 200;
    this.door.y = window.innerHeight - 200;

    // Create spike images below the floating steps
    const leftPlatformEnd = this.groundPlatformWidth;
    const rightPlatformStart = window.innerWidth - 200 - 200;
    const gapWidth = rightPlatformStart - leftPlatformEnd;
    const spikeWidth = 20; // Width of each spike image
    const spikeCount = Math.ceil(gapWidth / spikeWidth);

    // Add spike images
    for (let i = 0; i < spikeCount; i++) {
      const x = leftPlatformEnd + (i * spikeWidth);
      const spike = this.add.image(x, window.innerHeight, "spike");
      spike.setOrigin(0, 1);
      spike.setDepth(11);
    }

    // Create invisible collision rectangle for spikes
    this.spikeCollider = this.add.rectangle(leftPlatformEnd + gapWidth / 2, window.innerHeight - 10, gapWidth, 20);
    this.spikeCollider.setDepth(10);
    this.physics.add.existing(this.spikeCollider, true);

    // Add collision detection between player and spikes
    this.physics.add.overlap(this.player, this.spikeCollider, this.handleSpikeCollision, null, this);
  }

  handleSpikeCollision() {
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

  createPlatforms() {
    // Right platform (same height as left platform)
    this.createPlatform(window.innerWidth - 200, window.innerHeight - 100, 400, 200);

    // Four floating steps from left platform to right platform (all at same height)
    const leftPlatformEnd = this.groundPlatformWidth;
    const rightPlatformStart = window.innerWidth - 200 - 200;
    const gapWidth = rightPlatformStart - leftPlatformEnd;
    const stepSpacing = gapWidth / 4.5; // More spacing between steps
    const stepHeight = window.innerHeight - 300;
    const leftOffset = 50; // Shift all steps to the left

    // Step 1
    this.createPlatform(leftPlatformEnd + stepSpacing - leftOffset, stepHeight, 120, 20);

    // Step 2
    this.createPlatform(leftPlatformEnd + stepSpacing * 2 - leftOffset, stepHeight, 120, 20);

    // Step 3
    this.createPlatform(leftPlatformEnd + stepSpacing * 3 - leftOffset, stepHeight, 120, 20);

    // Step 4
    this.createPlatform(leftPlatformEnd + stepSpacing * 4 - leftOffset, stepHeight, 120, 20);
  }

  update() {
    // Override jump power for this level
    if (!this.levelComplete) {
      const speed = 250;
      const jumpPower = -450; // Increased jump power for this level

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

      // Jumping with increased power
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

  onLevelComplete() {
    // Go to next level (for now, restart)
    this.scene.restart();
    // Later: this.scene.start("Level11");
  }
}

const Level10 = () => {
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
        scene: [Level10Scene],
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

export default Level10;
