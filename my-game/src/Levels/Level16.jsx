import { useEffect } from "react";
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";

export class Level16Scene extends BaseScene {
  constructor() {
    super("Level16");
    this.backgroundKey = "background16";
    this.groundPlatformHeight = 140; // Smaller height for this level
    this.platformColor = 0x212121; // Dark color for this level
    this.levelWidth = window.innerWidth; // Single screen width for this level
    this.doorX = window.innerWidth - 150; // Door near the end
  }

  loadLevelAssets() {
    // Load Level 16 specific background
    this.load.image("background16", "/background 1/orig_big16.png");
  }

  create() {
    super.create();
  }

  update() {
    // Override with increased jump power for this level
    if (!this.levelComplete) {
      const speed = 300;
      const jumpPower = -500; // Increased jump power for this level

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

  createPlatforms() {
    const wallThickness = 80;

    // Create platforms on the right side in a staircase pattern
    const platformWidth = 130;
    const platformHeight = 15;
    const horizontalGap = 200; // Distance between platforms horizontally

    // First platform (lower right - connected to edge)
    this.rightPlatform1 = this.createPlatform(
      window.innerWidth - platformWidth / 2,
      window.innerHeight - 250,
      platformWidth,
      platformHeight
    );

    // Second platform (middle - slightly to the left of first)
    this.rightPlatform2 = this.createPlatform(
      window.innerWidth - platformWidth / 2 - horizontalGap,
      window.innerHeight - 350,
      platformWidth,
      platformHeight
    );

    // Third platform (upper - back to the right edge)
    this.rightPlatform3 = this.createPlatform(
      window.innerWidth - platformWidth / 2,
      window.innerHeight - 450,
      platformWidth,
      platformHeight
    );

    // Fourth platform (top - slightly to the left again)
    this.rightPlatform4 = this.createPlatform(
      window.innerWidth - platformWidth / 2 - horizontalGap,
      window.innerHeight - 550,
      platformWidth,
      platformHeight
    );
  }

  onLevelComplete() {
    // Save next level to localStorage
    localStorage.setItem('currentLevel', 'Level17');
    // Go to Level 17 (or restart for now)
    this.scene.restart();
    // Later: this.scene.start("Level17");
  }
}

const Level16 = () => {
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
        scene: [Level16Scene],
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

export default Level16;
