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
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600,
  },
};

const game = new Phaser.Game(config);

// ----- Controls panel -----
const betPanel = document.getElementById("bet-panel");
// Hide by default
betPanel.classList.add("hidden");

// Wait for Phaser to boot, then hook into GameScene events
game.events.on("ready", () => {
  const scene = game.scene.getScene("GameScene");

  // When GameScene creates → show panel
  scene.events.on("create", () => {
    betPanel.classList.remove("hidden");
  });

  // When GameScene shuts down → hide panel
  scene.events.on("shutdown", () => {
    betPanel.classList.add("hidden");
  });
});

// -------------------
// 2) HTML ELEMENTS
// -------------------
const betInput = document.getElementById("betAmount");
const autoCashoutInput = document.getElementById("autoCashout");
const balanceSpan = document.getElementById("player-balance");
const placeBtn = document.getElementById("placeBet");
const cashOutBtn = document.getElementById("cashOut");
const feedback = document.getElementById("bet-feedback");

// -------------------
// 3) BET STATE
// -------------------
let currentBet = 0;
let roundActive = false;

// -------------------
// 4) PLACE BET
// -------------------
placeBtn.addEventListener("click", () => {
  const bet = parseFloat(betInput.value);
  const auto = parseFloat(autoCashoutInput.value);
  const balance = parseFloat(balanceSpan.textContent);

  // --- Validate ---
  if (isNaN(bet) || bet < 1) {
    feedback.textContent = "Enter a valid bet.";
    return;
  }
  if (bet > balance) {
    feedback.textContent = "Not enough balance.";
    return;
  }

  // --- Update UI state ---
  currentBet = bet;
  roundActive = true;
  balanceSpan.textContent = (balance - bet).toFixed(2);
  feedback.textContent = `Bet ${bet} placed${
    !isNaN(auto) ? ` (Auto @ ${auto}x)` : ""
  }`;

  placeBtn.disabled = true;
  betInput.disabled = true;
  autoCashoutInput.disabled = true;
  cashOutBtn.disabled = false;

  // --- Tell GameScene to start ---
  const scene = game.scene.keys["GameScene"];
  scene.startRound(currentBet, auto);
});

// -------------------
// 5) CASH OUT
// -------------------
cashOutBtn.addEventListener("click", () => {
  if (!roundActive) return;

  const scene = game.scene.keys["GameScene"];
  scene.cashOut(); // real cash out inside the scene
});

// -------------------
// 6) END ROUND RESET
// -------------------
function endRoundUI() {
  roundActive = false;
  currentBet = 0;

  placeBtn.disabled = false;
  betInput.disabled = false;
  autoCashoutInput.disabled = false;
  cashOutBtn.disabled = true;
}

// -------------------
// 7) LISTEN FOR SCENE EVENTS
// -------------------

game.scene.getScene("GameScene").events.once('create', () => {
  const scene = game.scene.getScene("GameScene");

  scene.events.on("player-cashout", (win) => {
    const bal = parseFloat(balanceSpan.textContent);
    balanceSpan.textContent = (bal + win).toFixed(2);
    feedback.textContent = `+${win.toFixed(2)} added to balance`;
  });

  scene.events.on("round-end", endRoundUI);
});
