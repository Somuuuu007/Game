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
            this.load.spritesheet("WalkUp", "/walk_Up.png", {
              frameWidth: 48,
              frameHeight: 64,
            });

            // Load door sprites
            for (let i = 0; i <= 40; i++) {
              const frameNum = i.toString().padStart(2, '0');
              this.load.image(`door_${i}`, `/Door/sprite_${frameNum}.png`);
            }

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
            createPlatform(1200, window.innerHeight - 75, 2400, 150);

            // Create player
            this.player = this.physics.add.sprite(100, window.innerHeight - 200, "Idle");
            this.player.setScale(2);
            this.player.setCollideWorldBounds(true);
            this.player.body.setSize(20, 28, true);
            this.player.setDepth(10); // Player in front of door

            // Create door at the end of level
            this.door = this.add.sprite(2200, window.innerHeight - 150, "door_17");
            this.door.setScale(0.3);
            this.door.setOrigin(0.5, 1); // Set origin to bottom center
            this.door.setDepth(0); // Door behind player
            this.door.play("door_closed");

            // Camera follows player
            this.cameras.main.setBounds(0, 0, 2400, window.innerHeight);
            this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

            // Player collides with platforms
            this.physics.add.collider(this.player, this.platforms);

            // Track door state
            this.doorOpen = false;
            this.levelComplete = false;

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

            this.anims.create({
              key: "walkup",
              frames: this.anims.generateFrameNumbers("WalkUp", { start: 0, end: 7 }),
              frameRate: 15,
              repeat: 0,
            });

            // Door animations using individual sprite files
            this.anims.create({
              key: "door_closed",
              frames: [{ key: "door_17" }],
              frameRate: 10,
            });

            this.anims.create({
              key: "door_opening",
              frames: Array.from({ length: 24 }, (_, i) => ({ key: `door_${i + 17}` })),
              frameRate: 20,
              repeat: 0,
            });

            this.anims.create({
              key: "door_open",
              frames: [{ key: "door_40" }],
              frameRate: 10,
            });

            // Start with idle animation
            this.player.play("idle");
            this.cursors = this.input.keyboard.createCursorKeys();
            this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

            // Track if player is on ground
            this.isOnGround = false;
          },
          update: function () {
            // Skip update if level is complete
            if (this.levelComplete) {
              return;
            }

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

            // Jumping - only on key press, not hold
            if ((Phaser.Input.Keyboard.JustDown(this.spaceKey) || Phaser.Input.Keyboard.JustDown(this.cursors.up)) && this.isOnGround) {
              this.player.setVelocityY(jumpPower);
              this.player.play("jump");
            }

            // If in air and not already playing jump animation
            if (!this.isOnGround && this.player.anims.currentAnim.key !== "jump") {
              this.player.play("jump");
            }

            // Check if player is near door
            const distanceToDoor = Phaser.Math.Distance.Between(
              this.player.x, this.player.y,
              this.door.x, this.door.y
            );

            // Open door when player is near
            if (distanceToDoor < 200 && !this.doorOpen) {
              this.doorOpen = true;
              this.door.play("door_opening");
              this.door.once("animationcomplete", () => {
                this.door.play("door_open");
              });
            }

            // Enter door to complete level
            if (Math.abs(this.player.x - this.door.x) < 10 && distanceToDoor < 40 && this.doorOpen && !this.levelComplete) {
              this.levelComplete = true;

              // Disable player controls and physics
              this.player.body.setVelocity(0, 0);
              this.player.body.setAllowGravity(false);
              this.player.setFlipX(false);

              // Stop any current animation and play walk up
              this.player.stop();
              this.player.play("walkup", true);

              // When walk up animation completes, fade out and restart level
              this.player.once("animationcomplete", () => {
                this.cameras.main.fadeOut(500, 0, 0, 0);

                this.cameras.main.once("camerafadeoutcomplete", () => {
                  this.scene.restart();
                });
              });
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
