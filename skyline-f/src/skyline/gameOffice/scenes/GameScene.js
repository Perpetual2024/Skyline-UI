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
    this.windBarBg = null;
    this.windLabel = null;
    this.windBarFill = null;
    this.lastWindUpdate = 0;
    this.currentWindIntensity = 0.5;

    this.winText = null;
    this.countdownText = null;
    this.countdownValue=5; 
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

    // === Trail ===
    this.trailGraphics = this.add.graphics().setDepth(0);

    // === Bike ===
    this.bike = this.add
      .sprite(width / 2, this.GROUND_Y, "hoverbike")
      .setOrigin(0.5)
      .setScale(0.5);

    // === Sounds ===
    this.engineSfx = this.sound.add("engine", { loop: true, volume: 0.6 });
    this.crashSfx = this.sound.add("crash", { volume: 0.8 });

    // === Multiplier text ===
    this.multiplierText = this.add.text(20, 20, "x1.00", {
      font: "24px monospace",
      fill: "#00ffd6",
    });
    // Countdown text (hidden at start)
this.countdownText = this.add.text(
  this.gameWidth / 2, 
  this.gameHeight / 2, 
  "", 
  {
    font: "48px monospace",
    fill: "#00ffd6",
    stroke: "#000",
    strokeThickness: 4
  }
).setOrigin(0.5).setVisible(false);

    // === Win message ===
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

    // === Countdown Text ===
    this.countdownText = this.add
      .text(width / 2, height / 2 - 100, "", {
        font: "40px monospace",
        fill: "#ffffff",
        stroke: "#000",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(10)
      .setVisible(false);

    // === Wind bar ===
    this.windLabel = this.add.text(20, 70, "Wind Resistance", {
      font: "14px monospace",
      fill: "#00ffd6",
    });

    this.windBarBg = this.add.graphics();
    this.windBarBg.fillStyle(0x000000, 0.6);
    this.windBarBg.fillRect(20, 90, 200, 20);

    this.windBarFill = this.add.graphics();
  }

  
 

  // ---------- Start round ----------
  startRound(bet, autoCashValue) {
  if (this.engine.state !== "WAITING") return;

  this.currentBet = bet;
  this.autoCashValue = parseFloat(autoCashValue) || null;

  // Start countdown immediately
  this.countdownValue = 5;
  this.countdownText.setVisible(true);
  
  this.time.addEvent({
    delay: 1000,
    repeat: 5,
    callback: () => {
      if (this.countdownValue > 0) {
        this.countdownText.setText(this.countdownValue);
        this.countdownValue--;
      } else {
        this.countdownText.setText("GO!").setScale(1.5);
        
        // Hide GO after 500ms and start game
        this.time.delayedCall(500, () => {
          this.countdownText.setVisible(false);
          this.countdownText.setScale(1);
          
          // Actually start the round
          this.engine.startRound();
          this.trailPoints = [];
          this.trailGraphics.clear();
          this.bike.clearTint().setY(this.GROUND_Y).setScale(0.5);
          this.engineSfx.play();
        });
      }
    }
  });
}

  // ---------- Cash out ----------
  cashOut() {
  if (this.engine.state !== "RUNNING") return;

  const multiplier = this.engine.cashOut();
  this.engineSfx.stop();

  const win = this.currentBet * multiplier;

  // Camera effects for celebration
  this.cameras.main.flash(200, 0, 255, 200, 0.3); // Green flash
  
  // Scale up bike briefly
  this.tweens.add({
    targets: this.bike,
    scale: this.bike.scale * 1.3,
    duration: 200,
    yoyo: true,
    ease: 'Quad.easeOut'
  });

  // Update balance
  this.events.emit("player-cashout", win);

  // Enhanced win message
  this.winText
    .setText(`🎉 YOU WON! 🎉\n$${win.toFixed(2)}\n(x${multiplier.toFixed(2)})`)
    .setVisible(true)
    .setAlpha(0)
    .setScale(0.5);

  // Animate win text with bounce
  this.tweens.add({
    targets: this.winText,
    alpha: 1,
    scale: 1,
    duration: 400,
    ease: "Back.easeOut"
  });

  this.finishRound();
}

  // ---------- Crash ----------
  crash() {
  // Screen shake
  this.cameras.main.shake(300, 0.01);
  
  // Flash screen red
  this.cameras.main.flash(200, 255, 0, 0);
  
  // Bike effects
  this.bike.setTint(0xff0000);
  this.bike.setScale(this.bike.scale * 1.5); // Bigger on crash
  
  // Stop sounds and play crash
  this.engineSfx.stop();
  this.crashSfx.play();

  this.finishRound(`Crashed @ x${this.engine.multiplier.toFixed(2)} - Try again!`);
  this.events.emit("round-end", { crashed: true });
}

  // ---------- Round end ----------
  finishRound(message) {
  if (message) {
    this.multiplierText.setText(message);
  }
  
  // Fade out trail
  this.tweens.add({
    targets: this.trailGraphics,
    alpha: 0,
    duration: 500,
    onComplete: () => {
      this.trailGraphics.clear();
      this.trailGraphics.setAlpha(1);
    }
  });
  
  // Move bike back with animation
  this.tweens.add({
    targets: this.bike,
    y: this.GROUND_Y,
    scale: 0.5,
    duration: 800,
    ease: 'Quad.easeInOut',
    onComplete: () => {
      this.bike.clearTint();
    }
  });

  // Reset after 2 seconds
  this.time.delayedCall(2000, () => {
    this.engine.reset();
    this.multiplierText.setText("x1.00");

    // Fade out win text if visible
    if (this.winText.visible) {
      this.tweens.add({
        targets: this.winText,
        alpha: 0,
        scale: 0.8,
        duration: 400,
        onComplete: () => {
          this.winText.setVisible(false).setText("");
        }
      });
    }

    this.events.emit("round-end", { crashed: false });
  });
}
  // ---------- UPDATE ----------
  update(time, delta) {
    const mult = this.engine.update(delta);
    this.multiplierText.setText(`x${mult.toFixed(2)}`);

    if (this.engine.state === "CRASHED") {
      this.crash();
      return;
    }

    if (
      this.engine.state === "RUNNING" &&
      this.autoCashValue !== null &&
      mult >= this.autoCashValue
    ) {
      this.cashOut();
    }

    if (this.engine.state === "RUNNING") {
      const moveSpeed = 60 * (delta / 1000);
      this.bike.y -= moveSpeed;
      this.bike.scale = Math.max(this.bike.scale - 0.0003 * delta, 0.3);

      const trackY = this.bike.y + this.bike.displayHeight * 0.4;
      this.trailPoints.push({ x: this.bike.x, y: trackY });

      this.trailGraphics.clear();

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

    if (time - this.lastWindUpdate > 100) {
      this.currentWindIntensity = Math.random() * 0.7 + 0.3;
      this.lastWindUpdate = time;
    }

    const fillWidth = 200 * this.currentWindIntensity;
    this.windBarFill.clear();
    this.windBarFill.fillStyle(0x00ffd6, 0.8);
    this.windBarFill.fillRect(20, 90, fillWidth, 20);
  }
}
