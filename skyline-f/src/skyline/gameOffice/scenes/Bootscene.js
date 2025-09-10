import Phaser from "phaser";

export default class BootScene extends Phaser.Scene {
    constructor() {
        super ({key : "BootScene"});
    }

    preload() {
        this.load.image('hoverbike1', 'assets/hoverbike1.png');

    }

}