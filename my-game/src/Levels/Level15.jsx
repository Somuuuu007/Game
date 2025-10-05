import { useEffect } from "react";
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";

export class Level15Scene extends BaseScene {
  constructor() {
    super("Level15");
    this.backgroundKey = "background15";
    this.groundPlatformHeight = 80; // Smaller height for this level
    this.platformColor = 0x212121; // Dark blue color for this level
    this.levelWidth = window.innerWidth; // Single screen width for this level
    this.doorX = window.innerWidth - 180; // Door near the end
  }

  loadLevelAssets() {
    // Load Level 15 specific background
    this.load.image("background15", "/background 1/orig_big15.png");
    // Load spike image
    this.load.image("spike", "/Spike.png");
  }

  create() {
    super.create();

    // Move player spawn position a bit to the right
    this.player.x = 150;

    // Create spikes on the left wall (only in playable area)
    const wallThickness = 88;
    const spikeSpacing = 15;
    const leftWallX = wallThickness;

    // Calculate playable area (between ceiling and floor)
    const topWallHeight = 80; // Same as groundPlatformHeight
    const bottomWallHeight = 80;
    const playableTop = topWallHeight;
    const playableBottom = window.innerHeight - bottomWallHeight;
    const playableHeight = playableBottom - playableTop;

    const numSpikes = Math.floor(playableHeight / spikeSpacing);

    this.leftSpikes = [];
    for (let i = 0; i < numSpikes; i++) {
      const spike = this.add.image(leftWallX, playableTop + (i * spikeSpacing), "spike");
      spike.setOrigin(0, 0.5);
      spike.setAngle(90); // Point right
      spike.setDepth(11);
      this.leftSpikes.push(spike);
    }

    // Create collision area for left wall spikes
    this.leftSpikeCollider = this.add.rectangle(
      wallThickness + 20,
      playableTop + (playableHeight / 2),
      40,
      playableHeight
    );
    this.leftSpikeCollider.setDepth(10);
    this.physics.add.existing(this.leftSpikeCollider, true);
    this.physics.add.overlap(this.player, this.leftSpikeCollider, this.handleSpikeCollision, null, this);
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

  update() {
    // Override with swapped controls for this level
    if (!this.levelComplete) {
      const speed = 300;
      const jumpPower = -400;

      this.isOnGround = this.player.body.touching.down || this.player.body.blocked.down;

      // Swapped horizontal movement (A/Left goes right, D/Right goes left)
      if (this.cursors.left.isDown || this.aKey.isDown) {
        this.player.setVelocityX(speed); // Moving RIGHT with left/A key
        this.player.setFlipX(false);

        if (this.isOnGround && this.player.anims.currentAnim.key !== "run") {
          this.player.play("run");
        }
      } else if (this.cursors.right.isDown || this.dKey.isDown) {
        this.player.setVelocityX(-speed); // Moving LEFT with right/D key
        this.player.setFlipX(true);

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
    // Create a closed room structure with walls on all sides
    const wallThickness = 80; // Same as ground platform height

    // Left wall
    this.createPlatform(
      wallThickness / 2,
      window.innerHeight / 2,
      wallThickness,
      window.innerHeight
    );

    // Right wall
    this.createPlatform(
      window.innerWidth - wallThickness / 2,
      window.innerHeight / 2,
      wallThickness,
      window.innerHeight
    );

    // Top wall (ceiling)
    this.createPlatform(
      window.innerWidth / 2,
      wallThickness / 2,
      window.innerWidth,
      wallThickness
    );
  }

  onLevelComplete() {
    // Save next level to localStorage
    localStorage.setItem('currentLevel', 'Level16');
    // Go to Level 16 (or restart for now)
    this.scene.restart();
    // Later: this.scene.start("Level16");
  }
}

const Level15 = () => {
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
        scene: [Level15Scene],
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

export default Level15;
