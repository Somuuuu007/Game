import { useEffect } from "react";
import Phaser from "phaser";

const Game = () => {
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
        scene: {
          preload: function () {
            this.load.spritesheet("Idle", "/Idle.png", {
              frameWidth: 48,
              frameHeight: 64,
            });
            this.load.spritesheet("Run", "/Walk.png", {
              frameWidth: 48,
              frameHeight: 64,
            });
            this.load.spritesheet("Jump", "/Jump.png", {
              frameWidth: 48,
              frameHeight: 64,
            });
            this.load.spritesheet("Death", "/Death.png", {
              frameWidth: 48,
              frameHeight: 64,
            });

            // No external tileset needed - using simple rectangles
          },
          create: function () {
            // Set background color - dark gray for minimalist look
            this.cameras.main.setBackgroundColor('#1a1a1a');

            // Set world bounds
            this.physics.world.setBounds(0, 0, 2400, window.innerHeight);

            // Create platforms group
            this.platforms = this.physics.add.staticGroup();

            // Helper function to create black tile platform
            const createPlatform = (x, y, width, height) => {
              const platform = this.add.rectangle(x, y, width, height, 0x000000);
              this.physics.add.existing(platform, true);
              this.platforms.add(platform);
              return platform;
            };

            // Ground platform - taller base
            createPlatform(1200, window.innerHeight - 50, 2400, 100);

            // Floating platforms - simple level layout
            createPlatform(400, window.innerHeight - 120, 150, 20);
            createPlatform(450, window.innerHeight - 200, 120, 20);
            createPlatform(700, window.innerHeight - 160, 100, 20);
            createPlatform(950, window.innerHeight - 280, 140, 20);
            createPlatform(1250, window.innerHeight - 220, 130, 20);
            createPlatform(1500, window.innerHeight - 300, 110, 20);
            createPlatform(1800, window.innerHeight - 240, 150, 20);
            createPlatform(2100, window.innerHeight - 180, 120, 20);

            // Create player
            this.player = this.physics.add.sprite(100, window.innerHeight - 200, "Idle");
            this.player.setScale(2);
            this.player.setCollideWorldBounds(true);
            this.player.body.setSize(20, 28, true);

            // Camera follows player
            this.cameras.main.setBounds(0, 0, 2400, window.innerHeight);
            this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

            // Player collides with platforms
            this.physics.add.collider(this.player, this.platforms);

            // Create animations with proper frame counts
            this.anims.create({
              key: "idle",
              frames: this.anims.generateFrameNumbers("Idle", { start: 0, end: 7 }),
              frameRate: 10,
              repeat: -1,
            });

            this.anims.create({
              key: "run",
              frames: this.anims.generateFrameNumbers("Run", { start: 0, end: 7 }),
              frameRate: 20,
              repeat: -1,
            });

            this.anims.create({
              key: "jump",
              frames: this.anims.generateFrameNumbers("Jump", { start: 0, end: 1 }),
              frameRate: 5,
              repeat: 0,
            });

            this.anims.create({
              key: "death",
              frames: this.anims.generateFrameNumbers("Death", { start: 0, end: 7 }),
              frameRate: 10,
              repeat: 0,
            });

            // Start with idle animation
            this.player.play("idle");
            this.cursors = this.input.keyboard.createCursorKeys();
            this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

            // Track if player is on ground
            this.isOnGround = false;
          },
          update: function () {
            const speed = 300;
            const jumpPower = -400;

            // Check if player is on ground
            this.isOnGround = this.player.body.touching.down || this.player.body.blocked.down;

            // Horizontal movement
            if (this.cursors.left.isDown) {
              this.player.setVelocityX(-speed);
              this.player.setFlipX(true);

              if (this.isOnGround && this.player.anims.currentAnim.key !== "run") {
                this.player.play("run");
              }
            } else if (this.cursors.right.isDown) {
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
            if ((this.spaceKey.isDown || this.cursors.up.isDown) && this.isOnGround) {
              this.player.setVelocityY(jumpPower);
              this.player.play("jump");
            }

            // If in air and not already playing jump animation
            if (!this.isOnGround && this.player.anims.currentAnim.key !== "jump") {
              this.player.play("jump");
            }
          },
        },
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

export default Game;
