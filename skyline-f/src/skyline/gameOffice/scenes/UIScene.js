import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
    constructor(){
        super({key: "UIScene"});
        this.betInput = null;
        this.betButton = null;
        this.currentBet = 0;
    }

    create() {
    const { width } = this.cameras.main;

    // === BET INPUT FIELD ===
    this.betInput = this.add.dom(width / 2 - 60, 40, "input", {
      type: "number",
      placeholder: "Enter bet",
      style:
        "width:120px; height:28px; font-size:16px; padding:4px; text-align:center;",
    });

    // === PLACE BET BUTTON ===
    this.betButton = this.add.dom(width / 2 + 90, 40, "button", {
      innerText: "Place Bet",
      style:
        "background:#008CBA; color:white; font-size:16px; padding:6px 12px; border:none; cursor:pointer;",
    });

    // Listen for clicks
    this.betButton.addListener("click");
    this.betButton.on("click", () => this.handleBet());
  }

  handleBet() {
    const value = parseFloat(this.betInput.node.value);

    if (isNaN(value)) {
      alert("Please enter a number");
      return;
    }

    this.currentBet = value;
    console.log("Bet placed:", value);

    // (Later we’ll lock the input & send the bet to GameScene)
  }
}




