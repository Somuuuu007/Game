import { useEffect } from "react";
import Phaser from "phaser";
import { BaseScene } from "./BaseScene";

export class Level19Scene extends BaseScene {
  constructor() {
    super("Level19");
    this.backgroundKey = "background19";
    this.groundPlatformHeight = null; // Disable automatic ground platform
    this.platformColor = 0x212121; // Dark color for this level
    this.levelWidth = window.innerWidth; // Single screen width for this level
    this.doorX = window.innerWidth - 250; // Door near the end
  }

  loadLevelAssets() {
    // Load Level 19 specific background
    this.load.image("background19", "/background 1/orig_big19.png");
    // Load spike image
    this.load.image("spike", "/Spike.png");
  }

  create() {
    super.create();

    // Spawn player on the right side platform
    this.player.x = window.innerWidth - 150;
    this.player.y = window.innerHeight - 250;

    // Move door to the top platform
    const topPlatformY = window.innerHeight - 150 / 2 - 420;
    this.door.x = window.innerWidth - 250;
    this.door.y = topPlatformY - 250 / 2;
  }

  update() {
    super.update();
  }

  createPlatforms() {
    // Right side platform where player spawns (300x150)
    const platformWidth = 300;
    const platformHeight = 150;

    // Right bottom platform
    this.createPlatform(
      window.innerWidth - platformWidth / 2,
      window.innerHeight - platformHeight / 2,
      platformWidth,
      platformHeight
    );

    // Right top platform - 420px above the bottom platform
    this.createPlatform(
      window.innerWidth - platformWidth / 2 ,
      window.innerHeight - platformHeight / 2 - 420,
      platformWidth + 700,
      platformHeight + 100
    );

    // Platform to the left of right bottom platform
    const middlePlatformX = window.innerWidth - platformWidth / 2 - platformWidth - 400;
    const middlePlatformY = window.innerHeight - platformHeight / 2 - 50;
    const middlePlatformWidth = platformWidth - 50;
    const middlePlatformHeight = platformHeight - 20;

    this.createPlatform(
      middlePlatformX,
      middlePlatformY,
      middlePlatformWidth,
      middlePlatformHeight
    );

    // Create spikes on all sides of the middle platform
    this.middlePlatformSpikes = [];
    this.middlePlatformSpikeColliders = [];

    const spikeSpacing = 20;
    const cornerOffset = 20; // Offset to avoid corner overlaps

    // Top spikes (excluding corners)
    const topSpikeCount = Math.floor((middlePlatformWidth - 2 * cornerOffset) / spikeSpacing);
    for (let i = 0; i < topSpikeCount; i++) {
      const spikeX = middlePlatformX - middlePlatformWidth / 2 + cornerOffset + (i * spikeSpacing) + spikeSpacing / 2;
      const spikeY = middlePlatformY - middlePlatformHeight / 2;

      const spike = this.add.image(spikeX, spikeY, "spike");
      spike.setOrigin(0.5, 1);
      spike.setAngle(0);
      spike.setDepth(11);
      this.middlePlatformSpikes.push(spike);

      const collider = this.add.rectangle(spikeX, spikeY - 10, 10, 7);
      collider.setDepth(10);
      this.physics.add.existing(collider, true);
      this.middlePlatformSpikeColliders.push(collider);
    }

    // Bottom spikes (excluding corners)
    const bottomSpikeCount = Math.floor((middlePlatformWidth - 2 * cornerOffset) / spikeSpacing);
    for (let i = 0; i < bottomSpikeCount; i++) {
      const spikeX = middlePlatformX - middlePlatformWidth / 2 + cornerOffset + (i * spikeSpacing) + spikeSpacing / 2;
      const spikeY = middlePlatformY + middlePlatformHeight / 2;

      const spike = this.add.image(spikeX, spikeY, "spike");
      spike.setOrigin(0.5, 1); // Changed from (0.5, 0) to (0.5, 1) to align at border
      spike.setAngle(180);
      spike.setDepth(11);
      this.middlePlatformSpikes.push(spike);

      const collider = this.add.rectangle(spikeX, spikeY + 10, 10, 7);
      collider.setDepth(10);
      this.physics.add.existing(collider, true);
      this.middlePlatformSpikeColliders.push(collider);
    }

    // Left spikes (including full height) - rotated 180 degrees from original
    const leftSpikeCount = Math.floor(middlePlatformHeight / spikeSpacing);
    for (let i = 0; i < leftSpikeCount; i++) {
      const spikeX = middlePlatformX - middlePlatformWidth / 2;
      const spikeY = middlePlatformY - middlePlatformHeight / 2 + (i * spikeSpacing) + spikeSpacing / 2;

      const spike = this.add.image(spikeX, spikeY, "spike");
      spike.setOrigin(0.7, 1); // Changed to (0, 0.5) so spikes point inward
      spike.setAngle(-90);
      spike.setDepth(11);
      this.middlePlatformSpikes.push(spike);

      const collider = this.add.rectangle(spikeX - 10, spikeY, 7, 10);
      collider.setDepth(10);
      this.physics.add.existing(collider, true);
      this.middlePlatformSpikeColliders.push(collider);
    }

    // Right spikes (including full height) - rotated 180 degrees from original
    const rightSpikeCount = Math.floor(middlePlatformHeight / spikeSpacing);
    for (let i = 0; i < rightSpikeCount; i++) {
      const spikeX = middlePlatformX + middlePlatformWidth / 2;
      const spikeY = middlePlatformY - middlePlatformHeight / 2 + (i * spikeSpacing) + spikeSpacing / 2;

      const spike = this.add.image(spikeX, spikeY, "spike");
      spike.setOrigin(0.2, 1); // Changed to (0, 0.5) so spikes point inward
      spike.setAngle(90);
      spike.setDepth(11);
      this.middlePlatformSpikes.push(spike);

      const collider = this.add.rectangle(spikeX + 10, spikeY, 7, 10);
      collider.setDepth(10);
      this.physics.add.existing(collider, true);
      this.middlePlatformSpikeColliders.push(collider);
    }

    // Add collision detection for all spike colliders
    this.middlePlatformSpikeColliders.forEach(collider => {
      this.physics.add.overlap(this.player, collider, this.handleSpikeCollision, null, this);
    });

    // Left top platform (same as right top)
    this.createPlatform(
      platformWidth / 2 ,
      window.innerHeight - platformHeight / 2 - 420,
      platformWidth + 300,
      platformHeight + 400
    );
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
    localStorage.setItem('currentLevel', 'Level20');
    // Go to Level 20 (or restart for now)
    this.scene.restart();
    // Later: this.scene.start("Level20");
  }
}

const Level19 = () => {
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
        scene: [Level19Scene],
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

export default Level19;
