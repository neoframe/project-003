class Store {
  #data = {
    default: new Map(),
  };

  constructor (name) {
    this.name = name;
  }

  #getZone (opts) {
    opts.zone = (opts.zone || 'default').toString();

    let zone = this.#data[opts.zone];

    if (!zone) {
      zone = this.#data[opts.zone] = new Map();
    }

    return zone;
  }

  get (key, opts = {}) {
    return this.#getZone(opts).get(key);
  }

  set (key, value, opts = {}) {
    this.#getZone(opts).set(key, value);
  }

  patch (key, value, opts = {}) {
    const current = this.get(key, opts) || {};
    this.#getZone(opts).set(key, {
      ...current,
      ...(typeof value === 'function' ? value(current) : value),
    });
  }

  delete (key, opts = {}) {
    this.#getZone(opts).delete(key);
  }

  getAll (opts = {}) {
    return Array.from(this.#getZone(opts).entries());
  }

  zone (name) {
    name = name?.client?.zone || name;

    return {
      get: (...args) => this.get(...args, { zone: name }),
      set: (...args) => this.set(...args, { zone: name }),
      patch: (...args) => this.patch(...args, { zone: name }),
      delete: (...args) => this.delete(...args, { zone: name }),
      getAll: (...args) => this.getAll(...args, { zone: name }),
    };
  }

  allZones () {
    const zones = Object.keys(this.#data);

    return {
      get: (...args) => zones.map(k => this.get(...args, { zone: k })),
      set: (...args) => zones.map(k => this.set(...args, { zone: k })),
      patch: (...args) => zones.map(k => this.patch(...args, { zone: k })),
      delete: (...args) => zones.map(k => this.delete(...args, { zone: k })),
      getAll: (...args) => zones.map(k => this.getAll(...args, { zone: k })),
    };
  }
}

module.exports = Store;
