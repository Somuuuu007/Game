import { useEffect } from "react";
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";

export class Level9Scene extends BaseScene {
  constructor() {
    super("Level9");
    this.backgroundKey = "background9";
    this.groundPlatformHeight = 100;
    this.groundPlatformWidth = window.innerWidth - 650;
    this.platformColor = 0x212121;
    this.levelWidth = window.innerWidth;
    this.doorX = window.innerWidth - 150;
  }

  loadLevelAssets() {
    // Load Level 9 specific background
    this.load.image("background9", "/background 1/orig_big9.png");
  }

  create() {
    super.create();

    // Track if rolling object has been spawned
    this.rollingObjectSpawned = false;
    this.rollingObject = null;

    // Create right platform with same height
    const rightPlatformX = window.innerWidth - 200;
    this.createPlatform(rightPlatformX, window.innerHeight - this.groundPlatformHeight / 2, 400, this.groundPlatformHeight);

    // Create middle disappearing platform between left and right platforms
    const leftPlatformEnd = this.groundPlatformWidth;
    const rightPlatformStart = window.innerWidth - 200 - 200;
    const middlePlatformX = (leftPlatformEnd + rightPlatformStart) / 2;
    this.middlePlatform = this.createPlatform(middlePlatformX, window.innerHeight - this.groundPlatformHeight / 2, 250, this.groundPlatformHeight);

    // Track if middle platform has been stepped on
    this.middlePlatformStepped = false;
  }

  update() {
    super.update();

    // Check if player steps on middle platform and make it disappear
    if (!this.middlePlatformStepped && this.player.body.touching.down) {
      const playerBounds = this.player.getBounds();
      const middlePlatformBounds = this.middlePlatform.getBounds();

      if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, middlePlatformBounds)) {
        this.middlePlatformStepped = true;

        // Make platform disappear after a short delay
        this.time.delayedCall(100, () => {
          this.middlePlatform.destroy();
          this.platforms.remove(this.middlePlatform);
        });
      }
    }

    // Check if player reaches 1/4 of the screen and spawn rolling object
    if (!this.rollingObjectSpawned && !this.levelComplete) {
      if (this.player.x >= window.innerWidth / 4) {
        this.rollingObjectSpawned = true;

        // Create rolling circular object from left side of screen
        this.rollingObject = this.add.circle(-50, window.innerHeight - 150, 40, 0x000000);
        this.physics.add.existing(this.rollingObject);
        this.rollingObject.body.setVelocityX(450); // Roll speed to the right
        this.rollingObject.body.setAllowGravity(true);
        this.rollingObject.body.setBounce(0);
        this.rollingObject.setDepth(15);

        // Make it collide with platforms
        this.physics.add.collider(this.rollingObject, this.platforms);
      }
    }

    // Check collision between rolling object and player
    if (this.rollingObject && !this.levelComplete) {
      const distanceToPlayer = Phaser.Math.Distance.Between(
        this.rollingObject.x, this.rollingObject.y,
        this.player.x, this.player.y
      );

      // Kill player if they're within 60 pixels radius
      if (distanceToPlayer < 60) {
        this.handleRollingObjectCollision();
      }
    }
  }

  handleRollingObjectCollision() {
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
    // Add Level 9 specific platforms here if needed
  }

  onLevelComplete() {
    // Save next level to localStorage
    localStorage.setItem('currentLevel', 'Level10');
    // Go to Level 10 (or restart for now)
    this.scene.restart();
    // Later: this.scene.start("Level10");
  }
}

const Level9 = () => {
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
        scene: [Level9Scene],
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

export default Level9;
