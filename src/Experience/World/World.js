import Experience from "../Experience.js";

import Environment from "./Environment.js";
import Room from "./Room.js";
import Monitor from "./Monitor.js";
import DisplacementText from "./DisplacementText.js";
import Chair from "./Chair.js";
import MonitorFocus from "./MonitorFocus.js";
import ButtonConfetti from "./ButtonConfetti.js";
import Drawer from "./Drawer.js";

export default class World {
  constructor() {
    this.experience = new Experience(document.querySelector("canvas.webgl"));

    this.environment = new Environment();
    this.room = new Room();
    this.monitor = new Monitor();
    this.chair = new Chair();
    this.monitorFocus = new MonitorFocus();
    this.buttonConfetti = new ButtonConfetti();
    this.drawer = new Drawer();

    this.displacementText = new DisplacementText();
  }

  update() {
    if (this.room) this.room.update();
    if (this.monitor) this.monitor.update();
    if (this.displacementText) this.displacementText.update();
    if (this.chair) this.chair.update();
    if (this.monitorFocus) this.monitorFocus.update();
    if (this.buttonConfetti) this.buttonConfetti.update();
    if (this.drawer) this.drawer.update();
  }
}
