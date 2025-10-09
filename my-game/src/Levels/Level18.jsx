import { useEffect } from "react";
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";

export class Level18Scene extends BaseScene {
  constructor() {
    super("Level18");
    this.backgroundKey = "background18";
    this.groundPlatformHeight = 200; // Smaller height for this level
    this.groundPlatformWidth = 200; // Smaller width for this level
    this.platformColor = 0x212121; // Dark color for this level
    this.levelWidth = window.innerWidth; // Single screen width for this level
    this.doorX = window.innerWidth - 100; // Door near the end on right platform
  }

  loadLevelAssets() {
    // Load Level 18 specific background
    this.load.image("background18", "/background 1/orig_big18.png");
  }

  create() {
    super.create();
    this.player.x = 100;
    this.player.y = window.innerHeight - 300;

    // Move door to right platform (on top of the taller platform)
    const rightPlatformHeight = 400;
    this.door.x = window.innerWidth - 100;
    this.door.y = window.innerHeight - rightPlatformHeight;

    // Track jump delay
    this.jumpRequested = false;
    this.jumpTimer = null;
  }

  update() {
    // Override the update to add jump delay
    if (this.levelComplete) {
      return;
    }

    const speed = 300;
    const jumpPower = -400;

    this.isOnGround = this.player.body.touching.down || this.player.body.blocked.down;

    // Horizontal movement - arrow keys or WASD
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

    // Jump with 1 second delay
    if ((Phaser.Input.Keyboard.JustDown(this.spaceKey) || Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.wKey)) && this.isOnGround && !this.jumpRequested) {
      // Request jump with delay
      this.jumpRequested = true;

      // Clear any existing timer
      if (this.jumpTimer) {
        this.jumpTimer.remove();
      }

      // Set timer for 1 second delay
      this.jumpTimer = this.time.delayedCall(1000, () => {
        // Execute jump after 1 second if still on ground
        if (this.isOnGround && !this.levelComplete) {
          this.player.setVelocityY(jumpPower);
          this.player.play("jump");
        }
        this.jumpRequested = false;
        this.jumpTimer = null;
      });
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

    // Small platform between left platform and center square
    const middlePlatformWidth = 100;
    const middlePlatformHeight = 15;
    this.middlePlatform = this.createPlatform(
      (platformWidth * 2 + window.innerWidth / 2) / 2, // Halfway between left platform and square
      window.innerHeight -250,
      middlePlatformWidth,
      middlePlatformHeight
    );

    // Right platform - taller than left platform, door will be on this
    const rightPlatformWidth = 200;
    const rightPlatformHeight = 400; // Much taller than ground platform
    this.rightPlatform = this.createPlatform(
      window.innerWidth - rightPlatformWidth / 2,
      window.innerHeight - rightPlatformHeight / 2,
      rightPlatformWidth,
      rightPlatformHeight
    );

    // Second platform on right side (similar to left side) - top surfaces aligned
    const rightFrontPlatformWidth = 200;
    const rightFrontPlatformHeight = 20;

    this.rightFrontPlatform = this.createPlatform(
      window.innerWidth - rightPlatformWidth - rightFrontPlatformWidth / 2,
      window.innerHeight - rightPlatformHeight + rightFrontPlatformHeight / 2,
      rightFrontPlatformWidth,
      rightFrontPlatformHeight
    );

    // Small platform between right platform and center square
    const rightMiddlePlatformWidth = 100;
    const rightMiddlePlatformHeight = 15;
    this.rightMiddlePlatform = this.createPlatform(
      (window.innerWidth - rightPlatformWidth * 2 + window.innerWidth / 2) / 2, // Halfway between right platform and square
      window.innerHeight - 350,
      rightMiddlePlatformWidth,
      rightMiddlePlatformHeight
    );
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
