const { WebSocketServer } = require('ws');
const { v4: uuid } = require('uuid');

const { version } = require('../../package.json');
const Store = require('./store');

class Server {
  #ws = null;
  #stores = {};
  #routes = {};
  #events = {};

  constructor ({ port, name, debug = false, verbose = false } = {}) {
    this.port = port;
    this.name = name;
    this.debug = debug;
    this.verbose = verbose;

    this.addController({
      routes: {
        ping: ({ req }) => req.send('pong'),
        info: ({ req }) => req.send({
          name: this.name,
          port: this.port,
          version,
        }),
      },
    });
  }

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
      server: this,
      zone: params.client?.zone,
      stores: this.#stores,
      broadcast: this.#broadcast.bind(this, params.client),
      send: this.#send.bind(this, params.client),
    };
  }

  #getClient (id) {
    for (const client of this.#ws.clients) {
      if (client.id === id) {
        return client;
      }
    }
  }

  #broadcast (client, type, data, { exclude = [] } = {}) {
    if (!client) return;

    const message = JSON.stringify({ type, data });

    // eslint-disable-next-line no-console
    this.verbose && console.log('[WS] Broadcasting ->', message);

    this.#ws.clients.forEach(c => {
      if (
        client.id !== c.id &&
        c.readyState === c.OPEN &&
        !exclude.includes(c.id)
      ) {
        c.send(message);
      }
    });
  }

  #send (client, type, data, { to } = {}) {
    const message = JSON.stringify({ type, data });

    if (to) {
      client = this.#getClient(to);

      if (!client) {
        return false;
      }
    }

    if (client.readyState === client.OPEN) {
      // eslint-disable-next-line no-console
      this.verbose && console.log('[WS] Sending ->', message);

      client.send(message);
    }
  }

  #handleMessage (client, type, data) {
    const route = this.#routes[type];

    if (!route) return;

    // eslint-disable-next-line no-console
    this.verbose && console.log(
      '[WS] Requesting ->', type, JSON.stringify(data));

    route(this.#createRequest({
      client,
      data,
      type,
      zone: client.zone,
    }));
  }

  start () {
    this.#ws = new WebSocketServer({ port: this.port }, () => {
      // eslint-disable-next-line no-console
      this.debug && console.log('[WS] Server listening on port', this.port);
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
        this.debug && console.log('[WS] Client disconnected ->', client.id);
      });

      // eslint-disable-next-line no-console
      this.debug && console.log('[WS] Client connected ->', client.id);
    });

    return this;
  }
}

module.exports = Server;
