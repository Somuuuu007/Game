import { useEffect } from "react";
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";

export class Level6Scene extends BaseScene {
  constructor() {
    super("Level6");
    this.backgroundKey = "background6";
    this.groundPlatformHeight = 100; // Much taller ground platform
    this.groundPlatformWidth = 200; // Much taller ground platform
    this.platformColor = 0x212121;
    this.levelWidth = window.innerWidth; // Single screen width like Level 1
    this.doorX = 1300; // Door on the last step

  }

  loadLevelAssets() {
    // Load Level 6 specific background
    this.load.image("background6", "/background 1/orig_big6.png");
  }

  create() {
    super.create();

    // Adjust player spawn position for the taller ground
    this.player.y = window.innerHeight - 700;

    // Make door visible first - position it on screen
    this.door.x = 1300;
    this.door.y = window.innerHeight - 102;
  }

  createPlatforms() {
    // Create individual steps with custom properties

    // Step 1
    this.createPlatform(300, 650, 200, 200);

    // Step 2 - Disappearing step (trap)
    this.disappearingStep = this.add.rectangle(480, 600, 200, 280, 0x212121);
    this.physics.add.existing(this.disappearingStep, true);
    this.platforms.add(this.disappearingStep);

    this.createPlatform(680, 600, 200, 460);

    // Step 4 - Second disappearing step (trap)
    this.disappearingStep2 = this.add.rectangle(880, 600, 200, 620, 0x212121);
    this.physics.add.existing(this.disappearingStep2, true);
    this.platforms.add(this.disappearingStep2);

    this.createPlatform(1080, 600, 200, 780);
    this.createPlatform(1280, 600, 200, 920);

    // Track if steps have been touched
    this.stepTouched = false;
    this.step2Touched = false;
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

    // Check if player is standing on the first disappearing step
    if (!this.stepTouched && this.disappearingStep && this.player.body.touching.down) {
      // Check if player is overlapping with the disappearing step
      const playerBounds = this.player.getBounds();
      const stepBounds = this.disappearingStep.getBounds();

      if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, stepBounds)) {
        this.stepTouched = true;

        // Remove from platforms group and destroy
        this.platforms.remove(this.disappearingStep);
        this.disappearingStep.destroy();
      }
    }

    // Check if player is standing on the second disappearing step
    if (!this.step2Touched && this.disappearingStep2 && this.player.body.touching.down) {
      // Check if player is overlapping with the second disappearing step
      const playerBounds = this.player.getBounds();
      const stepBounds = this.disappearingStep2.getBounds();

      if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, stepBounds)) {
        this.step2Touched = true;

        // Remove from platforms group and destroy
        this.platforms.remove(this.disappearingStep2);
        this.disappearingStep2.destroy();
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
    // Later: this.scene.start("Level7");
  }
}

const Level6 = () => {
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
        scene: [Level6Scene],
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

export default Level6;
