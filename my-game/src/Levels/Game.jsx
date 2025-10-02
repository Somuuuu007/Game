import { useEffect } from "react";
import Phaser from "phaser";
import { Level1Scene } from "./Level1";
import { Level2Scene } from "./Level2";
import { Level3Scene } from "./Level3";
import { Level4Scene } from "./Level4";
import { Level5Scene } from "./Level5";
import { Level6Scene } from "./Level6";

const Game = () => {
  useEffect(() => {
    let game;

    const createGame = () => {
      // Get current level from localStorage, default to Level1
      const currentLevel = localStorage.getItem('currentLevel') || 'Level1';

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
        scene: [Level1Scene, Level2Scene, Level3Scene, Level4Scene, Level5Scene, Level6Scene],
      };

      game = new Phaser.Game(config);

      // Start the saved level
      game.scene.start(currentLevel);
    };

    createGame();

    return () => {
      if (game) game.destroy(true);
    };
  }, []);

  return <div id="phaser-container"></div>;
};

export default Game;
