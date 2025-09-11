import Phaser from "phaser";
import BootScene from "./skyline/gameOffice/scenes/Bootscene";
import GameScene from "./skyline/gameOffice/scenes/GameScene";

const config = {
  type: Phaser.AUTO,
  scene: [BootScene, GameScene]
};

const game = new Phaser.Game(config);