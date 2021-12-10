const { WebSocketServer } = require('ws');
const { v4: uuid } = require('uuid');

const Store = require('./store');

class Server {
  #ws = null;
  #stores = {};
  #routes = {};
  #events = {};

  addStore (name) {
    this.#stores[name] = new Store(name);

    return this;
  }

  addController (controller) {
    Object.assign(this.#routes, controller.routes || {});
    Object.entries(controller.on || {}).forEach(([event, handler]) => {
      this.#events[event] = this.#events[event] || [];
      this.#events[event].push(handler);
    });

    console.log(this.#events);

    return this;
  }

  #fireEvent (client, name) {
    const handlers = this.#events[name];
    if (!handlers) return;
    handlers.map(handler => handler(this.#createRequest({ client })));
  }

  #createRequest (params = {}) {
    return {
      ...params,
      zone: params.client?.zone,
      stores: this.#stores,
      broadcast: this.#broadcast.bind(this, params.client),
      send: this.#send.bind(this, params.client),
    };
  }

  #broadcast (client, type, data) {
    if (!client) return;

    const message = JSON.stringify({ type, data });

    // eslint-disable-next-line no-console
    console.log('[WS] Broadcasting ->', message);

    this.#ws.clients.forEach(c => {
      if (client.id !== c.id && c.readyState === c.OPEN) {
        c.send(message);
      }
    });
  }

  #send (client, type, data) {
    const message = JSON.stringify({ type, data });

    if (client.readyState === client.OPEN) {
      // eslint-disable-next-line no-console
      console.log('[WS] Sending ->', message);

      client.send(message);
    }
  }

  #handleMessage (client, type, data) {
    const route = this.#routes[type];

    if (!route) return;

    // eslint-disable-next-line no-console
    console.log('[WS] Requesting ->', type, JSON.stringify(data));

    route(this.#createRequest({
      client,
      data,
      type,
      zone: client.zone,
    }));
  }

  start ({ port } = {}) {
    this.#ws = new WebSocketServer({ port }, () => {
      // eslint-disable-next-line no-console
      console.log('Websocket server listening on port', port);
    });

    this.#ws.on('connection', client => {
      client.id = uuid();

      client.on('message', message => {
        const { zone, type, data } = JSON.parse(message) || {};
        client.zone = zone;
        this.#handleMessage(client, type, data);
      });

      client.on('close', () => {
        this.#fireEvent(client, 'disconnect');
        // eslint-disable-next-line no-console
        console.log('[WS] Client disconnected ->', client.id);
      });

      // eslint-disable-next-line no-console
      console.log('Client connected', client.id);
    });

    return this;
  }
}

module.exports = Server;
