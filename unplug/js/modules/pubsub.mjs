// Minimalist Pub Sub Pattern
export default class PubSub{

  static _instance;

  constructor() {
    if (PubSub._instance) {
      return PubSub._instance;
    }
    this.subscribers = new Map();
    PubSub._instance = this;
  }

  subscribe(chan, callback) {
    let subs = this.subscribers.has(chan) ? this.subscribers.get(chan) : [];
    subs.push(callback);
    this.subscribers.set(chan, subs);
  }

  publish(chan, data) {
    let subs = this.subscribers.has(chan) ? this.subscribers.get(chan) : [];
    subs.forEach(callback => callback(data));
  }

}