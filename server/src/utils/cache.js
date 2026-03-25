class SimpleCache {
  constructor(ttlMs = 10 * 60 * 1000) {
    this.store = new Map();
    this.ttl = ttlMs;
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() - entry.time > this.ttl) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  set(key, data) {
    this.store.set(key, { data, time: Date.now() });
  }
}

module.exports = { SimpleCache };
