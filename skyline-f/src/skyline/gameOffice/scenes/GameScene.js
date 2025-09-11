import Phaser from 'phaser'

export default class GameScene extends Phaser.Scene{
    constructor (){
        super ({key : 'GameScene'});
    }

    create() {
  const { width, height } = this.cameras.main;

  // Add background
  this.add.image(width / 2, height / 2, "background")
    .setOrigin(0.5)
    .setDisplaySize(width, height);

  // Add the bike
  this.bike = this.add.sprite(width / 2, height - 10, "hoverbike")
    .setOrigin(0.5)
    .setScale(0.5);

  // Add UI
  this.multiplierText = this.add.text(20, 20, "x1.00", {
    font: "24px monospace",
    fill: "#00ffd6"
  });

  this.windMeter = this.add.image(width - 80, 40, "windmeter")
    .setScale(0.4);

  // Inputs
  this.cursors = this.input.keyboard.createCursorKeys();
}

    update(time, delta){
        const speed = 300;

        if (this.cursors.left.isDown){
            this.bike.x -= speed * (delta/1000);

        }else if (this.cursors.right.isDown) {
            this.bike.x += speed * (delta/ 1000)
        }

    }


}