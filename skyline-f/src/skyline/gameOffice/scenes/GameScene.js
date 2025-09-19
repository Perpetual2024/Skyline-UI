import Phaser from "phaser";
import GameEngine from "../../config/GameEngine";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });

    this.engine = null;
    this.trailGraphics = null;
    this.trailPoints = [];
    this.bike = null;
    this.engineSfx = null;
    this.crashSfx = null;
    this.autoCashValue = null;
    this.currentBet = 0;

    this.winText = null; // message when player wins
  }

  create() {
    const { width, height } = this.cameras.main;
    this.engine = new GameEngine();

    this.gameWidth = width;
    this.gameHeight = height;
    this.GROUND_Y = height - 50;

    // === Background ===
    this.add
      .image(width / 2, height / 2, "background")
      .setOrigin(0.5)
      .setDisplaySize(width, height);

    // === Trail graphics ===
    this.trailGraphics = this.add.graphics().setDepth(0);

    // === Bike ===
    this.bike = this.add
      .sprite(width / 2, this.GROUND_Y, "hoverbike")
      .setOrigin(0.5, 0.5)
      .setScale(0.5);

    // === Sounds ===
    this.engineSfx = this.sound.add("engine", { loop: true, volume: 0.6 });
    this.crashSfx = this.sound.add("crash", { volume: 0.8 });

    // === Multiplier text ===
    this.multiplierText = this.add.text(20, 20, "x1.00", {
      font: "24px monospace",
      fill: "#00ffd6",
    });

    // === Win message (hidden by default) ===
    this.winText = this.add
      .text(width / 2, height / 2, "", {
        font: "28px monospace",
        fill: "#00ff88",
        stroke: "#000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(5)
      .setVisible(false)
      .setAlpha(0);
  }

  // ---------- Start a new round ----------
  startRound(bet, autoCashValue) {
    if (this.engine.state !== "WAITING") return;

    this.currentBet = bet;
    this.autoCashValue = autoCashValue;

    this.engine.startRound();
    this.trailPoints = [];
    this.trailGraphics.clear();

    this.bike.clearTint().setY(this.GROUND_Y).setScale(0.5);
    this.engineSfx.play();
  }

  // ---------- Cash out ----------
  cashOut() {
    if (this.engine.state !== "RUNNING") return;

    const multiplier = this.engine.cashOut();
    this.engineSfx.stop();

    const win = this.currentBet * multiplier;

    // update balance externally
    this.events.emit("player-cashout", win);

    // show win message with fade-in
    this.winText
      .setText(`You won ${win.toFixed(2)}\n(x${multiplier.toFixed(2)})`)
      .setVisible(true)
      .setAlpha(0);

    this.tweens.add({
      targets: this.winText,
      alpha: 1,
      duration: 300,
      ease: "Power2",
    });

    this.finishRound();
  }

  // ---------- Crash ----------
  crash() {
    this.bike.setTint(0xff0000);
    this.engineSfx.stop();
    this.crashSfx.play();

    this.finishRound(`Crashed @ x${this.engine.multiplier.toFixed(2)}`);
    this.events.emit("round-end", { crashed: true });
  }

  // ---------- Cleanup after round ----------
  finishRound(message) {
    if (message) {
      this.multiplierText.setText(message);
    }
    this.trailGraphics.clear();
    this.bike
      .setPosition(this.gameWidth / 2, this.GROUND_Y)
      .setScale(0.5)
      .clearTint();

    // after 2s reset round and hide win message
    this.time.delayedCall(2000, () => {
      this.engine.reset();
      this.multiplierText.setText("x1.00");

      // fade-out winText if visible
      if (this.winText.visible) {
        this.tweens.add({
          targets: this.winText,
          alpha: 0,
          duration: 400,
          onComplete: () => {
            this.winText.setVisible(false).setText("");
          },
        });
      }

      this.events.emit("round-end", { crashed: false });
    });
  }

  // ---------- UPDATE LOOP ----------
  update(time, delta) {
    const mult = this.engine.update(delta);
    this.multiplierText.setText(`x${mult.toFixed(2)}`);

    // Auto cash-out
    if (
      this.engine.state === "RUNNING" &&
      this.autoCashValue &&
      mult >= this.autoCashValue
    ) {
      this.cashOut();
    }

    if (this.engine.state === "CRASHED") {
      this.crash();
      return;
    }

    // === Bike + trail (only when running) ===
    if (this.engine.state === "RUNNING") {
      const moveSpeed = 60 * (delta / 1000);
      this.bike.y -= moveSpeed;
      this.bike.scale = Math.max(this.bike.scale - 0.0003 * delta, 0.3);

      const trackY = this.bike.y + this.bike.displayHeight * 0.4;
      this.trailPoints.push({ x: this.bike.x, y: trackY });

      this.trailGraphics.clear();

      // glow
      this.trailGraphics.lineStyle(12, 0x00fff0, 0.15);
      this.trailGraphics.beginPath();
      this.trailPoints.forEach((p, i) =>
        i === 0
          ? this.trailGraphics.moveTo(p.x, p.y)
          : this.trailGraphics.lineTo(p.x, p.y)
      );
      this.trailGraphics.strokePath();

      this.trailGraphics.lineStyle(6, 0x00ff88, 0.9);
      this.trailGraphics.beginPath();
      this.trailPoints.forEach((p, i) =>
        i === 0
          ? this.trailGraphics.moveTo(p.x, p.y)
          : this.trailGraphics.lineTo(p.x, p.y)
      );
      this.trailGraphics.strokePath();
    }
  }
}
