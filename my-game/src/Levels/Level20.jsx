import { useEffect } from "react";
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";

export class Level20Scene extends BaseScene {
  constructor() {
    super("Level20");
    this.backgroundKey = "background20";
    this.groundPlatformHeight = 80; // Smaller height for this level
    this.platformColor = 0x212121; // Dark color for this level
    this.levelWidth = window.innerWidth; // Single screen width for this level
    this.doorX = 150; // Door on the left side
  }

  loadLevelAssets() {
    // Load Level 20 specific background
    this.load.image("background20", "/background 1/orig_big20.png");
    // Load spike image
    this.load.image("spike", "/Spike.png");
  }

  create() {
    super.create();

    // Move player to the right side
    this.player.x = window.innerWidth - 250;
    this.player.y = window.innerHeight - 130;

    // Track if spikes are visible
    this.spikesVisible = false;
    // Track if platform is moving
    this.platformMoving = false;
    // Track falling balls
    this.ballsTriggered = false;
    this.fallingBalls = [];
  }

  update() {
    super.update();

    // Check if player is near the gap and trigger balls
    if (!this.ballsTriggered && this.thirdPlatform && this.secondPlatform) {
      const platformWidth = 200;
      const gapStart = this.thirdPlatform.x + platformWidth / 2 + 50;
      const gapEnd = this.secondPlatform.x - platformWidth / 2 - 50;
      const gapCenter = (gapStart + gapEnd) / 2;

      // Trigger balls when player is near the center of the gap
      if (Math.abs(this.player.x - gapCenter) < 50) {
        this.ballsTriggered = true;
        this.createFallingBalls();
      }
    }

    // Check if player is close to the second platform and make spikes visible
    if (!this.spikesVisible && this.secondPlatform) {
      const distanceToPlatform = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        this.secondPlatform.x, this.secondPlatform.y
      );

      // Check if player is in air (not on ground platform)
      const isInAir = this.player.y < window.innerHeight - this.groundPlatformHeight - 50;

      // Make spikes visible when player is within 250 pixels AND in air
      if (distanceToPlatform < 200 && isInAir) {
        this.spikesVisible = true;

        // Make all spikes visible
        this.spikes.forEach(spike => {
          spike.setAlpha(1);
        });

        this.spikeColliders.forEach(collider => {
          collider.setAlpha(1);
        });

        // Add collision detection with spikes
        this.spikeColliders.forEach(collider => {
          this.physics.add.overlap(this.player, collider, this.handleSpikeCollision, null, this);
        });

        // Start timer to move platform after 5 seconds
        this.time.delayedCall(1500, () => {
          this.movePlatformToRight();
        });
      }
    }
  }

  movePlatformToRight() {
    if (this.platformMoving) return;
    this.platformMoving = true;

    // Calculate target position (attach to left side of right platform)
    const platformWidth = 200;
    const rightPlatformX = window.innerWidth - platformWidth / 2;
    const targetX = rightPlatformX - platformWidth; // Position at left side of right platform

    // Store original position for spike movement
    this.secondPlatformOriginalX = this.secondPlatform.x;

    // Animate platform moving to the right
    this.tweens.add({
      targets: this.secondPlatform,
      x: targetX,
      duration: 100, // 0.1 second
      ease: 'Linear',
      onUpdate: () => {
        // Update physics body position
        if (this.secondPlatform.body) {
          this.secondPlatform.body.updateFromGameObject();
        }

        // Update spike positions to follow platform
        const deltaX = this.secondPlatform.x - this.secondPlatformOriginalX;

        this.spikes.forEach((spike, index) => {
          spike.x = this.spikeOriginalPositions[index].x + deltaX;
        });

        this.spikeColliders.forEach((collider, index) => {
          collider.x = this.spikeColliderOriginalPositions[index].x + deltaX;
          if (collider.body) {
            collider.body.updateFromGameObject();
          }
        });

        // Check if platform hits player during movement
        if (!this.levelComplete) {
          const playerBounds = this.player.getBounds();
          const platformBounds = this.secondPlatform.getBounds();

          if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, platformBounds)) {
            this.handlePlatformCollision();
          }
        }
      },
      onComplete: () => {
        // After sliding is complete, wait 1 second then remove spikes
        this.time.delayedCall(1000, () => {
          this.removeSpikes();
        });
      }
    });
  }

  handlePlatformCollision() {
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

  removeSpikes() {
    // Make all spikes disappear
    this.spikes.forEach(spike => {
      spike.destroy();
    });

    // Destroy spike colliders and remove collision
    this.spikeColliders.forEach(collider => {
      collider.destroy();
    });

    // Clear arrays
    this.spikes = [];
    this.spikeColliders = [];
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
    // Right side platform connected to the bottom platform
    const platformWidth = 200;
    const platformHeight = 70;

    // Create platform on the right side, connected to the ground
    this.rightPlatform = this.createPlatform(
      window.innerWidth - platformWidth / 2,
      window.innerHeight - this.groundPlatformHeight - platformHeight / 2,
      platformWidth,
      platformHeight
    );

    // Second platform to the left of the first platform
    const gap = 200; // Distance between platforms
    const secondPlatformHeight = platformHeight + 30; // Reduced height
    const secondPlatformX = window.innerWidth - platformWidth / 2 - platformWidth - gap;
    const secondPlatformY = window.innerHeight - this.groundPlatformHeight - secondPlatformHeight / 2;

    this.secondPlatform = this.createPlatform(
      secondPlatformX,
      secondPlatformY,
      platformWidth,
      secondPlatformHeight
    );

    // Third platform to the left of the second platform (same gap)
    const thirdPlatformX = secondPlatformX - platformWidth - gap;
    this.thirdPlatform = this.createPlatform(
      thirdPlatformX,
      secondPlatformY,
      platformWidth,
      secondPlatformHeight
    );

    // Create spikes above the second platform (invisible by default)
    this.spikes = [];
    this.spikeColliders = [];
    this.spikeOriginalPositions = [];
    this.spikeColliderOriginalPositions = [];

    const spikeSpacing = 25;
    const spikeCount = Math.floor(platformWidth / spikeSpacing);
    const spikeY = secondPlatformY - secondPlatformHeight / 2;

    for (let i = 0; i < spikeCount; i++) {
      const spikeX = secondPlatformX - platformWidth / 2 + (i * spikeSpacing) + spikeSpacing / 2;

      const spike = this.add.image(spikeX, spikeY, "spike");
      spike.setOrigin(0.5, 1);
      spike.setAngle(0);
      spike.setDepth(11);
      spike.setAlpha(0); // Invisible by default
      this.spikes.push(spike);
      this.spikeOriginalPositions.push({ x: spikeX, y: spikeY });

      const collider = this.add.rectangle(spikeX, spikeY - 10, 10, 7);
      collider.setDepth(10);
      collider.setAlpha(0); // Invisible by default
      this.physics.add.existing(collider, true);
      this.spikeColliders.push(collider);
      this.spikeColliderOriginalPositions.push({ x: spikeX, y: spikeY - 10 });
    }

    // Store gap position for ball creation
    this.gapX = thirdPlatformX + platformWidth / 2 + gap / 2;
  }

  createFallingBalls() {
    const ballRadius = 25;
    const ballSpacing = 60;

    // Ball 1 - center
    const ball1 = this.add.circle(this.gapX, 0, ballRadius, 0x212121);
    this.physics.add.existing(ball1);
    ball1.body.setVelocityY(300);
    ball1.body.setBounce(0.6);
    ball1.body.setCollideWorldBounds(true);
    ball1.setDepth(9);
    ball1.bounceCount = 0;
    ball1.isStable = false;
    this.physics.add.collider(ball1, this.platforms, () => {
      ball1.bounceCount++;
      if (ball1.bounceCount >= 4) {
        ball1.body.setBounce(0);
        ball1.body.setVelocity(0, 0);
        ball1.body.setAllowGravity(false);
        ball1.body.setImmovable(true);
        ball1.isStable = true;
      }
    });

    // Overlap to kill player (only when bouncing)
    this.physics.add.overlap(this.player, ball1, () => {
      if (ball1.bounceCount < 4) {
        this.handleBallCollision();
      }
    });

    // Add collider with player when stable
    this.physics.add.collider(this.player, ball1, null, () => {
      return ball1.isStable;
    });

    this.fallingBalls.push(ball1);

    // Ball 2 - left
    const ball2 = this.add.circle(this.gapX - ballSpacing, 0, ballRadius, 0x212121);
    this.physics.add.existing(ball2);
    ball2.body.setVelocityY(350);
    ball2.body.setBounce(0.6);
    ball2.body.setCollideWorldBounds(true);
    ball2.setDepth(9);
    ball2.bounceCount = 0;
    ball2.isStable = false;
    this.physics.add.collider(ball2, this.platforms, () => {
      ball2.bounceCount++;
      if (ball2.bounceCount >= 4) {
        ball2.body.setBounce(0);
        ball2.body.setVelocity(0, 0);
        ball2.body.setAllowGravity(false);
        ball2.body.setImmovable(true);
        ball2.isStable = true;
      }
    });

    // Overlap to kill player (only when bouncing)
    this.physics.add.overlap(this.player, ball2, () => {
      if (ball2.bounceCount < 4) {
        this.handleBallCollision();
      }
    });

    // Add collider with player when stable
    this.physics.add.collider(this.player, ball2, null, () => {
      return ball2.isStable;
    });

    this.fallingBalls.push(ball2);

    // Ball 3 - right
    const ball3 = this.add.circle(this.gapX + ballSpacing, 0, ballRadius, 0x212121);
    this.physics.add.existing(ball3);
    ball3.body.setVelocityY(400);
    ball3.body.setBounce(0.6);
    ball3.body.setCollideWorldBounds(true);
    ball3.setDepth(9);
    ball3.bounceCount = 0;
    ball3.isStable = false;
    this.physics.add.collider(ball3, this.platforms, () => {
      ball3.bounceCount++;
      if (ball3.bounceCount >= 4) {
        ball3.body.setBounce(0);
        ball3.body.setVelocity(0, 0);
        ball3.body.setAllowGravity(false);
        ball3.body.setImmovable(true);
        ball3.isStable = true;
      }
    });

    // Overlap to kill player (only when bouncing)
    this.physics.add.overlap(this.player, ball3, () => {
      if (ball3.bounceCount < 4) {
        this.handleBallCollision();
      }
    });

    // Add collider with player when stable
    this.physics.add.collider(this.player, ball3, null, () => {
      return ball3.isStable;
    });

    this.fallingBalls.push(ball3);
  }

  handleBallCollision() {
    if (!this.levelComplete) {
      this.levelComplete = true;
      this.player.play("death");
      this.player.body.setVelocity(0, 0);
      this.player.body.setAllowGravity(false);

      this.player.once("animationcomplete", () => {
        this.scene.restart();
      });
    }
  }

  onLevelComplete() {
    // Save next level to localStorage
    localStorage.setItem('currentLevel', 'Level21');
    // Go to Level 21 (or restart for now)
    this.scene.restart();
    // Later: this.scene.start("Level21");
  }
}

const Level20 = () => {
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
        scene: [Level20Scene],
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

export default Level20;
