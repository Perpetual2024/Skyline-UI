export default class GameEngine {
  constructor() {
    this.state = "WAITING";
    this.multiplier = 1;
    this.crashPoint = 0;
    this.growthRate = 0.00015;

    this.countdown = 5;
    this.countdownTimer = null;

    this.listeners = {};
  }

  startRound() {
    if (this.state !== "WAITING") return;
    this.state = "RUNNING";
    this.multiplier = 1;
    this.crashPoint = 1.2 + Math.random() * 9;

    this.emit("round-start");
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

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  emit(event, data){
    if(this.listeners[event]){
      this.listeners[event].forEach(cb => cb(data));
        
      };
    }
  startWaitingCountdown(){
    this.state = "WAITING";
    this.countdown = 5;
    this.emit("countdown", this.countdown);

    this.countdownTimer = setInterval(() => {
      this.countdown--;

      this.emit("countdown", this.countdown);

      if(this.countdown <= 0){
        clearInterval(this.countdownTimer);
        this.startRound();
      }
    }, 1000);
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