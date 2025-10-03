import { useEffect } from "react";
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";

export class Level8Scene extends BaseScene {
  constructor() {
    super("Level8");
    this.backgroundKey = "background8";
    this.groundPlatformHeight = 200; // Much taller ground platform
    this.groundPlatformWidth = 400; // Much taller ground platform
    this.platformColor = 0x212121;
    this.levelWidth = window.innerWidth; // Single screen width like Level 1
    this.doorX = 1380; // Door on the last step

  }

  loadLevelAssets() {
    // Load Level 8 specific background
    this.load.image("background8", "/background 1/orig_big8.png");
  }

  create() {
    super.create();

    // Adjust player spawn position for the taller ground
    this.player.y = window.innerHeight - 700;

    // Make door visible first - position it on screen (above right platform)
    this.door.x = window.innerWidth - 200;
    this.door.y = window.innerHeight - 200;

    // Create spike graphics for the gap between platforms
    this.spikes = this.add.graphics();
    this.spikes.fillStyle(0x212121, 1);
    this.spikes.setDepth(11);

    // Draw small triangular spikes in the gap at the bottom
    const spikeWidth = 20;
    const spikeHeight = 25;
    const gapStart = 400; // End of left platform
    const gapEnd = window.innerWidth - 400; // Start of right platform
    const spikeCount = Math.ceil((gapEnd - gapStart) / spikeHeight);

    for (let i = 0; i < spikeCount; i++) {
      const x = gapStart + (i * spikeHeight);
      this.spikes.fillTriangle(
        x, window.innerHeight,                    // Left bottom point
        x + spikeHeight, window.innerHeight,      // Right bottom point
        x + spikeHeight / 2, window.innerHeight - spikeWidth // Top point (tip of spike)
      );
    }

    // Create invisible collision rectangle for spikes
    const gapWidth = gapEnd - gapStart;
    this.spikeCollider = this.add.rectangle(gapStart + gapWidth / 2, window.innerHeight - 10, gapWidth, 20);
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
    // Create matching platforms on left and right sides

    // Left platform
    this.createPlatform(200, window.innerHeight - 100, 400, 200);

    // Right platform (same height and width as left)
    this.createPlatform(window.innerWidth - 200, window.innerHeight - 100, 400, 200);
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
    // Later: this.scene.start("Level9");
  }
}

const Level8 = () => {
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
        scene: [Level8Scene],
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

export default Level8;
