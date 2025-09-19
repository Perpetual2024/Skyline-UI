export default class GameEngine {
  constructor() {
    this.state = "WAITING";
    this.multiplier = 1;
    this.crashPoint = 0;
    this.growthRate = 0.00015;
  }

  startRound() {
    if (this.state !== "WAITING") return;
    this.state = "RUNNING";
    this.multiplier = 1;
    this.crashPoint = 1.2 + Math.random() * 9;
    console.log("[GameEngine] crashPoint", this.crashPoint)
  }

  cashOut() {
    if (this.state === "RUNNING") {
      this.state = "CASHED";
      return this.multiplier;
    }
    
  }

  crash() {
    this.state = "CRASHED";
    return this.multiplier;
  }

  update(dt) {
    if (this.state !== "RUNNING") return this.multiplier;

    this.multiplier += this.multiplier * this.growthRate * dt;
    if (this.multiplier >= this.crashPoint) {
      this.crash();
    }
    return this.multiplier;
  }

  
}