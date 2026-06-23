// src/Experience/World/World.js

import Experience from "../Experience.js";

import Room from "./Room.js";
import Monitor from "./Monitor.js";
import Chair from "./Chair.js";
import MonitorFocus from "./MonitorFocus.js";
import LEDBoard from "./LEDBoard.js";
import Backdrop from "./Backdrop.js";
import Silk from "./Silk.js";
import KeyClick from "./KeyClick.js";
import HoverScale from "./HoverScale.js";

export default class World {
  constructor() {
    this.experience = new Experience(document.querySelector("canvas.webgl"));

    this.room = null;
    this.monitor = null;
    this.chair = null;
    this.monitorFocus = null;
    this.backdrop = null;
    this.ledBoard = null;
    this.silk = null;
    this.keyClick = null;
    this.hoverScale = null;

    window.addEventListener("room-loaded", this.onRoomLoaded);

    this.room = new Room();
    this.monitor = new Monitor();
    this.chair = new Chair();
    this.monitorFocus = new MonitorFocus();
    this.backdrop = new Backdrop();
    this.ledBoard = new LEDBoard();
    this.silk = new Silk();
    this.keyClick = new KeyClick();
  }

  onRoomLoaded = (event) => {
    const roomModel = event.detail?.model || this.room?.model;

    console.log("World: room loaded, creating HoverScale:", roomModel);

    if (!roomModel) {
      console.warn("World: room-loaded fired, but no room model was found.");
      return;
    }

    if (!this.hoverScale) {
      this.hoverScale = new HoverScale(roomModel);
    }
  };

  update() {
    if (this.room) this.room.update();
    if (this.monitor) this.monitor.update();
    if (this.chair) this.chair.update();
    if (this.monitorFocus) this.monitorFocus.update();
    if (this.ledBoard) this.ledBoard.update();
    if (this.silk) this.silk.update();
    if (this.keyClick) this.keyClick.update();
    if (this.coffeeSteam) this.coffeeSteam.update();
    if (this.hoverScale) this.hoverScale.update();
  }
}
