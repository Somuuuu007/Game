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
    this.doorX = window.innerWidth - 200; // Temporary position, will be updated in create()
  }

  loadLevelAssets() {
    // Load Level 16 specific background
    this.load.image("background16", "/background 1/orig_big16.png");
    // Load spike image
    this.load.image("spike", "/Spike.png");
  }

  create() {
    super.create();

    // Track spike trap state
    this.spikeTrapTriggered = false;

    // Track ball state
    this.ballSpawned = false;
    this.ball = null;

    // Move door to platform 4 position (stored in createPlatforms)
    this.door.x = this.platform4X;
    this.door.y = this.platform4Y - 7.5;
  }

  update() {
    // Spawn ball when player reaches 1/4 of screen
    if (!this.ballSpawned && !this.levelComplete && this.player.x >= window.innerWidth / 4) {
      this.ballSpawned = true;
      this.spawnBall();
    }

    // Destroy ball if it goes off screen
    if (this.ball && this.ball.x > window.innerWidth + 100) {
      this.ball.destroy();
      this.ball = null;
    }

    // Check if player jumps from platform 1 to trigger spikes on platform 2
    if (!this.spikeTrapTriggered && !this.levelComplete) {
      const isOnPlatform1 = Math.abs(this.player.x - this.platform1X) < 65;
      const isJumping = !this.player.body.touching.down;
      const movingLeft = this.player.body.velocity.x < 0;

      // Trigger when player jumps from platform 1 moving left
      if (isOnPlatform1 && isJumping && movingLeft) {
        this.spikeTrapTriggered = true;

        // Show spikes immediately
        this.platform2Spikes.forEach(spike => spike.setAlpha(1));

        // Enable collision
        this.platform2SpikeColliders.forEach(collider => {
          this.physics.add.overlap(this.player, collider, this.handleSpikeCollision, null, this);
        });

        // Hide spikes and disable collision after 1 second
        this.time.delayedCall(1000, () => {
          this.platform2Spikes.forEach(spike => spike.setAlpha(0));
          this.platform2SpikeColliders.forEach(collider => {
            this.physics.world.disable(collider);
          });
        });
      }
    }

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
    const platform2X = window.innerWidth - platformWidth / 2 - horizontalGap;
    const platform2Y = window.innerHeight - 350;
    this.rightPlatform2 = this.createPlatform(
      platform2X,
      platform2Y,
      platformWidth,
      platformHeight
    );

    // Support column for second platform (from top to platform)
    const supportWidth = 20;
    const supportHeight = platform2Y - platformHeight / 2;
    this.support2 = this.createPlatform(
      platform2X - platformWidth / 2 + supportWidth / 2,
      supportHeight / 2,
      supportWidth,
      supportHeight
    );

    // Create invisible spikes on platform 2 (more towards the right side)
    this.platform2Spikes = [];
    this.platform2SpikeColliders = [];
    const spikeSpacing = 20;
    const numSpikes = Math.floor(platformWidth / spikeSpacing) - 1; // Remove last spike for symmetry
    const startOffset = platformWidth / 4; // Start spikes from 1/4 of the platform (more to the right)

    for (let i = 0; i < numSpikes; i++) {
      const spikeX = platform2X - platformWidth / 2 + startOffset + (i * spikeSpacing);
      const spikeY = platform2Y - platformHeight / 2;

      const spike = this.add.image(spikeX, spikeY, "spike");
      spike.setOrigin(0.5, 1);
      spike.setAngle(0);
      spike.setDepth(11);
      spike.setAlpha(0); // Invisible initially
      this.platform2Spikes.push(spike);

      const collider = this.add.rectangle(spikeX, spikeY - 10, 15, 15);
      collider.setDepth(10);
      this.physics.add.existing(collider, true);
      this.platform2SpikeColliders.push(collider);
    }

    // Store platform positions for detection
    this.platform1X = window.innerWidth - platformWidth / 2;
    this.platform2X = platform2X;

    // Third platform (upper - back to the right edge)
    this.rightPlatform3 = this.createPlatform(
      window.innerWidth - platformWidth / 2,
      window.innerHeight - 450,
      platformWidth,
      platformHeight
    );

    // Fourth platform (top - slightly to the left again)
    const platform4X = window.innerWidth - platformWidth / 2 - horizontalGap;
    const platform4Y = window.innerHeight - 550;
    this.rightPlatform4 = this.createPlatform(
      platform4X,
      platform4Y,
      platformWidth,
      platformHeight
    );

    // Support column for fourth platform (from top to platform)
    const support4Height = platform4Y - platformHeight / 2;
    this.support4 = this.createPlatform(
      platform4X - platformWidth / 2 + supportWidth / 2,
      support4Height / 2,
      supportWidth,
      support4Height
    );

    // Store platform 4 position for door placement
    this.platform4X = platform4X;
    this.platform4Y = platform4Y;
  }

  spawnBall() {
    const groundY = window.innerHeight - 140; // Ground level
    const ballRadius = 40; // Increased size

    // Spawn ball from the left side
    this.ball = this.add.circle(-100, groundY - ballRadius - 70, ballRadius, 0x212121);
    this.physics.add.existing(this.ball);
    this.ball.body.setBounce(0, 0); // No bouncing
    this.ball.body.setCollideWorldBounds(false);
    this.ball.body.setVelocityX(420); // Roll right
    this.ball.body.setAllowGravity(true);

    // Add collision with platforms
    this.physics.add.collider(this.ball, this.platforms);

    // Add collision with player
    this.physics.add.overlap(this.player, this.ball, this.handleBallCollision, null, this);
  }

  handleBallCollision() {
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
