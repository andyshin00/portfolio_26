export default class EventEmitter {
  constructor() {
    this.callbacks = {};
  }

  on(eventName, callback) {
    if (!this.callbacks[eventName]) {
      this.callbacks[eventName] = [];
    }

    this.callbacks[eventName].push(callback);
  }

  trigger(eventName, ...args) {
    if (!this.callbacks[eventName]) {
      return;
    }

    for (const callback of this.callbacks[eventName]) {
      callback(...args);
    }
  }
}
