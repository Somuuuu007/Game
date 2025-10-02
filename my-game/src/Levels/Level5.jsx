import { useEffect } from "react";
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";

export class Level5Scene extends BaseScene {
  constructor() {
    super("Level5");
    this.backgroundKey = "background5";
    this.groundPlatformHeight = 80;
    this.platformColor = 0x212121;
    this.levelWidth = window.innerWidth; // Single screen width for this level
    this.doorX = window.innerWidth - 150; // Door near the end
  }

  loadLevelAssets() {
    // Load Level 5 specific background
    this.load.image("background5", "/background 1/orig_big5.png");
  }

  create() {
    super.create();

    // Create spike graphics for all boundaries (death zones)
    this.spikes = this.add.graphics();
    this.spikes.fillStyle(0x212121, 1);
    this.spikes.setDepth(11);

    const spikeWidth = 30;
    const spikeHeight = 40;

    // Left boundary spikes
    const leftSpikeCount = Math.ceil(window.innerHeight / spikeHeight);
    for (let i = 0; i < leftSpikeCount; i++) {
      const y = i * spikeHeight;
      this.spikes.fillTriangle(
        0, y,                           // Top left point
        0, y + spikeHeight,             // Bottom left point
        spikeWidth, y + spikeHeight / 2 // Right point (tip of spike)
      );
    }

    // Right boundary spikes
    const rightSpikeCount = Math.ceil(window.innerHeight / spikeHeight);
    for (let i = 0; i < rightSpikeCount; i++) {
      const y = i * spikeHeight;
      this.spikes.fillTriangle(
        window.innerWidth, y,                    // Top right point
        window.innerWidth, y + spikeHeight,      // Bottom right point
        window.innerWidth - spikeWidth, y + spikeHeight / 2 // Left point (tip of spike)
      );
    }

    // Top boundary spikes
    const topSpikeCount = Math.ceil(window.innerWidth / spikeHeight);
    for (let i = 0; i < topSpikeCount; i++) {
      const x = i * spikeHeight;
      this.spikes.fillTriangle(
        x, 0,                           // Left top point
        x + spikeHeight, 0,             // Right top point
        x + spikeHeight / 2, spikeWidth // Bottom point (tip of spike)
      );
    }

    // Create invisible collision rectangles for all spike boundaries
    // Left boundary
    this.leftSpikeCollider = this.add.rectangle(15, window.innerHeight / 2, 30, window.innerHeight);
    this.leftSpikeCollider.setDepth(10);
    this.physics.add.existing(this.leftSpikeCollider, true);
    this.physics.add.overlap(this.player, this.leftSpikeCollider, this.handleBoundaryCollision, null, this);

    // Right boundary
    this.rightSpikeCollider = this.add.rectangle(window.innerWidth - 15, window.innerHeight / 2, 30, window.innerHeight);
    this.rightSpikeCollider.setDepth(10);
    this.physics.add.existing(this.rightSpikeCollider, true);
    this.physics.add.overlap(this.player, this.rightSpikeCollider, this.handleBoundaryCollision, null, this);

    // Top boundary
    this.topSpikeCollider = this.add.rectangle(window.innerWidth / 2, 15, window.innerWidth, 30);
    this.topSpikeCollider.setDepth(10);
    this.physics.add.existing(this.topSpikeCollider, true);
    this.physics.add.overlap(this.player, this.topSpikeCollider, this.handleBoundaryCollision, null, this);
  }

  handleBoundaryCollision() {
    if (!this.levelComplete) {
      this.handleDeath();
    }
  }

  update() {
    if (!this.levelComplete) {
      const speed = 300;

      this.isOnGround = this.player.body.touching.down || this.player.body.blocked.down;

      // Normal horizontal movement
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
        this.player.setVelocityY(-400);
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
            // Reset death count when level is completed
            localStorage.removeItem('level5Deaths');
            this.onLevelComplete();
          });
        });
      }
    }

    // Check if player falls off the world (death)
    if (this.player.y >= window.innerHeight && !this.levelComplete) {
      this.handleDeath();
    }

    // Check if player touches any boundary (death zone)
    if (this.player.x <= 10 && !this.levelComplete) {
      this.handleDeath();
    }

    if (this.player.x >= window.innerWidth - 10 && !this.levelComplete) {
      this.handleDeath();
    }

    if (this.player.y <= 10 && !this.levelComplete) {
      this.handleDeath();
    }
  }

  handleDeath() {
    this.levelComplete = true;

    // Increment death count
    const currentDeaths = parseInt(localStorage.getItem('level5Deaths') || '0');
    localStorage.setItem('level5Deaths', (currentDeaths + 1).toString());

    this.player.play("death");
    this.player.body.setVelocity(0, 0);
    this.player.body.setAllowGravity(false);

    // Restart level after death animation
    this.player.once("animationcomplete", () => {
      this.scene.restart();
    });
  }

  createPlatforms() {
    // Add Level 5 specific platforms here
  }

  onLevelComplete() {
    // Go to next level (for now, restart)
    this.scene.restart();
    // Later: this.scene.start("Level6");
  }
}

const Level5 = () => {
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
        scene: [Level5Scene],
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

export default Level5;
