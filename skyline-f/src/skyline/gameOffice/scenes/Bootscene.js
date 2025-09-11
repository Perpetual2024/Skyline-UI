import Phaser from "phaser";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    // --- Load assets ---
    this.load.image("hoverbike1", "assets/hoverbike1.png");
    this.load.image("windmeter", "assets/images/windmeter.png");
    this.load.image("background", "assets/images/background.png");
    this.load.image("hoverbike", "assets/images/bikeasset.png");
    this.load.audio("engine", "assets/accelerate.mp3");
    this.load.audio("crash", "assets/bikecrash.wav");
    


    const { width, height } = this.cameras.main;

    // background box
    const box = this.add.graphics();
    box.fillStyle(0x000000, 0.6);
    box.fillRoundedRect(width / 2 - 170, height / 2 - 30, 340, 60, 8);

    // progress bar
    const progressBar = this.add.graphics();

    // texts
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 55,
      text: "Loading...",
      style: { font: "18px monospace", fill: "#00ffd6" }
    }).setOrigin(0.5);

    const percentText = this.make.text({
      x: width / 2,
      y: height / 2 - 6,
      text: "0%",
      style: { font: "16px monospace", fill: "#ffffff" }
    }).setOrigin(0.5);

    const assetText = this.make.text({
      x: width / 2,
      y: height / 2 + 22,
      text: "",
      style: { font: "12px monospace", fill: "#aaaaaa" }
    }).setOrigin(0.5);

    // progress bar updates
    this.load.on("progress", (value) => {
      percentText.setText(Math.round(value * 100) + "%");
      progressBar.clear();
      progressBar.fillStyle(0x00ffd6, 1);
      progressBar.fillRoundedRect(
        width / 2 - 150,
        height / 2 - 15,
        300 * value,
        30,
        6
      );
    });

    this.load.on("fileprogress", (file) => {
      assetText.setText(`Loading asset: ${file.key}`);
    });

    this.load.on("complete", () => {
      // clear bar + texts
      progressBar.destroy();
      box.destroy();
      loadingText.destroy();
      percentText.destroy();
      assetText.destroy();

      // ✅ Now add hoverbike after it’s fully loaded
      this.add.image(width / 2, height / 2 - 120, "hoverbike1").setScale(0.5);

      // Stay on this scene longer before moving on
      this.time.delayedCall(500, () => {
        this.scene.start("GameScene");
      });
    });
  }

  create() {
    // empty, everything is handled in preload()
  }
}
