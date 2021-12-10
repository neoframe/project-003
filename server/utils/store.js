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
    this.#getZone(opts).set(key, { ...(this.get(key, opts) || {}), ...value });
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
}

module.exports = Store;
