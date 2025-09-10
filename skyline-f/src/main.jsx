import Phaser from "phaser";
import BootScene from "./skyline/gameOffice/scenes/Bootscene";

const config = {
  type: Phaser.AUTO,
  backgroundColor: "#121212",
  scene: [BootScene]
};

const game = new Phaser.Game(config);