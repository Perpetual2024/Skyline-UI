import Phaser from "phaser";
import BootScene from "./skyline/gameOffice/scenes/Bootscene";
import GameScene from "./skyline/gameOffice/scenes/GameScene";

// -------------------
// 1) PHASER CONFIG
// -------------------
const config = {
  type: Phaser.AUTO,
  parent: "game-container",
  backgroundColor: "#000",
  scene: [BootScene, GameScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY, // Changed from CENTER_BOTH
    width: 800,
    height: 500, 
  },
};

const game = new Phaser.Game(config);

// Get HTML elements
const controlsPanel = document.getElementById("controls-panel");
const betInput = document.getElementById("betAmount");
const autoCashoutInput = document.getElementById("autoCashout");
const balanceSpan = document.getElementById("player-balance");
const placeBtn = document.getElementById("placeBet");
const cashOutBtn = document.getElementById("cashOut");
const feedback = document.getElementById("feedback");

// Hide panel initially ← THIS WAS MISSING!
controlsPanel.style.display = "none";

// State
let currentBet = 0;
let roundActive = false;

// Wait for GameScene to be ready
game.events.once("ready", () => {
  const scene = game.scene.getScene("GameScene");
  
  scene.events.once("create", () => {
    // Show panel when GameScene is ready
    controlsPanel.style.display = "block";
    
    // Set up event listeners (only once!)
    scene.events.on("player-cashout", (win) => {
      const bal = parseFloat(balanceSpan.textContent);
      balanceSpan.textContent = (bal + win).toFixed(2);
      feedback.textContent = `🎉 Won $${win.toFixed(2)}!`;
    });

    scene.events.on("round-end", resetUI);
  });
});

// Place Bet Handler
placeBtn.addEventListener("click", () => {
  const bet = parseFloat(betInput.value);
  const auto = parseFloat(autoCashoutInput.value);
  const balance = parseFloat(balanceSpan.textContent);

  if (isNaN(bet) || bet < 1) {
    feedback.textContent = "❌ Enter a valid bet amount";
    return;
  }
  if (bet > balance) {
    feedback.textContent = "❌ Insufficient balance";
    return;
  }

  currentBet = bet;
  roundActive = true;
  balanceSpan.textContent = (balance - bet).toFixed(2);
  feedback.textContent = `✅ Bet placed: $${bet}${!isNaN(auto) ? ` (Auto @ ${auto}x)` : ""}`;

  placeBtn.disabled = true;
  betInput.disabled = true;
  autoCashoutInput.disabled = true;
  cashOutBtn.disabled = false;

  const scene = game.scene.keys["GameScene"];
  scene.startRound(currentBet, auto);
});

// Cash Out Handler
cashOutBtn.addEventListener("click", () => {
  if (!roundActive) return;
  const scene = game.scene.keys["GameScene"];
  scene.cashOut();
});

// Reset UI after round
function resetUI() {
  roundActive = false;
  currentBet = 0;
  placeBtn.disabled = false;
  betInput.disabled = false;
  autoCashoutInput.disabled = false;
  cashOutBtn.disabled = true;
}

// Listen to GameScene events
game.scene.getScene("GameScene").events.once("create", () => {
  const scene = game.scene.getScene("GameScene");

  scene.events.on("player-cashout", (win) => {
    const bal = parseFloat(balanceSpan.textContent);
    balanceSpan.textContent = (bal + win).toFixed(2);
    feedback.textContent = `🎉 Won $${win.toFixed(2)}!`;
  });

  scene.events.on("round-end", resetUI);
});