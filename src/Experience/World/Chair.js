import Experience from "../Experience.js";

export default class Chair {
  constructor() {
    this.experience = new Experience(document.querySelector("canvas.webgl"));
    this.time = this.experience.time;
    this.room = this.experience.world?.room?.model;

    this.chairSeat = null;

    if (this.room) {
      this.setChair();
    } else {
      this.waitForModel();
    }
  }

  waitForModel() {
    const interval = setInterval(() => {
      if (this.experience.world?.room?.model) {
        clearInterval(interval);
        this.room = this.experience.world.room.model;
        this.setChair();
      }
    }, 100);
  }

  setChair() {
    this.chairSeat = this.room.getObjectByName("chair_Baked");

    if (!this.chairSeat) {
      console.error("Chair_Seat not found");
      return;
    }

    this.startRotationY = this.chairSeat.rotation.y;
  }

  update() {
    if (!this.chairSeat) return;

    const elapsed = this.time.elapsed * 0.001;

    this.chairSeat.rotation.y =
      this.startRotationY + Math.sin(elapsed * 0.8) * 0.25;
  }
}
