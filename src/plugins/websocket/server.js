import { Events } from 'phaser';

import { DEBUG } from '../../utils/settings';

export default class WebSocketServer {
  events = new Events.EventEmitter();
  queue = [];

  constructor (scene, url) {
    this.scene = scene;
    this.url = url;
    this.ws = new globalThis.WebSocket(this.url);

    this.ws.addEventListener('open', this.onOpen.bind(this));
    this.ws.addEventListener('message', this.onMessage.bind(this));

    return this;
  }

  onOpen () {
    // eslint-disable-next-line no-console
    DEBUG && console.log('[WS] Connected');

    this.queue.forEach(q => this.ws.send(q));
    this.queue = [];
    this.events.emit('open');
  }

  onMessage (event) {
    // eslint-disable-next-line no-console
    DEBUG && console.log('[WS] Received ->', event.data);

    const { type, data } = JSON.parse(event.data);
    this.events.emit(type, data);
  }

  on (...args) {
    this.events.on(...args);

    return this;
  }

  once (...args) {
    this.events.once(...args);

    return this;
  }

  off (...args) {
    this.events.off(...args);

    return this;
  }

  send (type, data, { zone } = {}) {
    const message = JSON.stringify({ type, zone, data });

    // eslint-disable-next-line no-console
    DEBUG && console.log('[WS] Sending ->', message);

    if (this.ws.readyState === this.ws.OPEN) {
      this.ws.send(message);
    } else {
      this.queue.push(message);
    }

    return this;
  }
}
