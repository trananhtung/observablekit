// src/emitter.ts
var Emitter = class {
  _listeners = /* @__PURE__ */ new Map();
  on(event, listener) {
    let set = this._listeners.get(event);
    if (!set) {
      set = /* @__PURE__ */ new Set();
      this._listeners.set(event, set);
    }
    set.add(listener);
    return () => set.delete(listener);
  }
  once(event, listener) {
    const off = this.on(event, ((...args) => {
      off();
      listener(...args);
    }));
    return off;
  }
  off(event, listener) {
    this._listeners.get(event)?.delete(listener);
  }
  emit(event, ...args) {
    this._listeners.get(event)?.forEach((fn) => fn(...args));
  }
  removeAllListeners(event) {
    if (event !== void 0) this._listeners.delete(event);
    else this._listeners.clear();
  }
  listenerCount(event) {
    return this._listeners.get(event)?.size ?? 0;
  }
};

// src/observable-array.ts
var ObservableArray = class extends Emitter {
  _items;
  constructor(initial = []) {
    super();
    this._items = [...initial];
  }
  // ── Read ──────────────────────────────────────────────────────────────────
  get length() {
    return this._items.length;
  }
  get(index) {
    return this._items[index];
  }
  toArray() {
    return [...this._items];
  }
  [Symbol.iterator]() {
    return this._items[Symbol.iterator]();
  }
  indexOf(item) {
    return this._items.indexOf(item);
  }
  includes(item) {
    return this._items.includes(item);
  }
  find(predicate) {
    return this._items.find(predicate);
  }
  findIndex(predicate) {
    return this._items.findIndex(predicate);
  }
  filter(predicate) {
    return this._items.filter(predicate);
  }
  map(fn) {
    return this._items.map(fn);
  }
  forEach(fn) {
    this._items.forEach(fn);
  }
  some(predicate) {
    return this._items.some(predicate);
  }
  every(predicate) {
    return this._items.every(predicate);
  }
  reduce(fn, init) {
    return this._items.reduce(fn, init);
  }
  slice(start, end) {
    return this._items.slice(start, end);
  }
  at(index) {
    return this._items.at(index);
  }
  // ── Mutate ────────────────────────────────────────────────────────────────
  set(index, value) {
    const old = this._items[index];
    this._items[index] = value;
    this.emit("change", { index, oldValue: old, newValue: value });
  }
  push(...items) {
    const index = this._items.length;
    this._items.push(...items);
    if (items.length > 0) this.emit("add", { index, items });
    return this._items.length;
  }
  pop() {
    if (this._items.length === 0) return void 0;
    const index = this._items.length - 1;
    const item = this._items.pop();
    this.emit("remove", { index, items: [item] });
    return item;
  }
  unshift(...items) {
    this._items.unshift(...items);
    if (items.length > 0) this.emit("add", { index: 0, items });
    return this._items.length;
  }
  shift() {
    if (this._items.length === 0) return void 0;
    const item = this._items.shift();
    this.emit("remove", { index: 0, items: [item] });
    return item;
  }
  splice(start, deleteCount, ...insert) {
    const removed = deleteCount !== void 0 ? this._items.splice(start, deleteCount, ...insert) : this._items.splice(start);
    if (removed.length > 0) this.emit("remove", { index: start, items: removed });
    if (insert.length > 0) this.emit("add", { index: start, items: insert });
    return removed;
  }
  sort(compareFn) {
    this._items.sort(compareFn);
    this.emit("sort");
    return this;
  }
  reverse() {
    this._items.reverse();
    this.emit("reverse");
    return this;
  }
  clear() {
    if (this._items.length === 0) return;
    const removed = [...this._items];
    this._items = [];
    this.emit("remove", { index: 0, items: removed });
  }
  // ── Convenience ───────────────────────────────────────────────────────────
  /** Subscribe to ALL mutation events with a single callback. */
  subscribe(listener) {
    const offs = [
      this.on("add", listener),
      this.on("remove", listener),
      this.on("change", listener),
      this.on("sort", listener),
      this.on("reverse", listener)
    ];
    return () => offs.forEach((off) => off());
  }
};

// src/observable-map.ts
var ObservableMap = class extends Emitter {
  _map;
  constructor(initial) {
    super();
    this._map = new Map(initial);
  }
  // ── Read ──────────────────────────────────────────────────────────────────
  get size() {
    return this._map.size;
  }
  get(key) {
    return this._map.get(key);
  }
  has(key) {
    return this._map.has(key);
  }
  keys() {
    return this._map.keys();
  }
  values() {
    return this._map.values();
  }
  entries() {
    return this._map.entries();
  }
  [Symbol.iterator]() {
    return this._map[Symbol.iterator]();
  }
  forEach(fn) {
    this._map.forEach(fn);
  }
  toMap() {
    return new Map(this._map);
  }
  // ── Mutate ────────────────────────────────────────────────────────────────
  set(key, value) {
    const oldValue = this._map.get(key);
    const isNew = !this._map.has(key);
    this._map.set(key, value);
    this.emit("set", { key, value, oldValue, isNew });
    return this;
  }
  delete(key) {
    if (!this._map.has(key)) return false;
    const value = this._map.get(key);
    this._map.delete(key);
    this.emit("delete", { key, value });
    return true;
  }
  clear() {
    if (this._map.size === 0) return;
    this._map.clear();
    this.emit("clear");
  }
  /** Subscribe to ALL mutation events with a single callback. */
  subscribe(listener) {
    const offs = [
      this.on("set", listener),
      this.on("delete", listener),
      this.on("clear", listener)
    ];
    return () => offs.forEach((off) => off());
  }
};

// src/observable-set.ts
var ObservableSet = class extends Emitter {
  _set;
  constructor(initial) {
    super();
    this._set = new Set(initial);
  }
  // ── Read ──────────────────────────────────────────────────────────────────
  get size() {
    return this._set.size;
  }
  has(value) {
    return this._set.has(value);
  }
  values() {
    return this._set.values();
  }
  keys() {
    return this._set.keys();
  }
  entries() {
    return this._set.entries();
  }
  [Symbol.iterator]() {
    return this._set[Symbol.iterator]();
  }
  forEach(fn) {
    this._set.forEach(fn);
  }
  toSet() {
    return new Set(this._set);
  }
  toArray() {
    return [...this._set];
  }
  // ── Mutate ────────────────────────────────────────────────────────────────
  add(value) {
    if (!this._set.has(value)) {
      this._set.add(value);
      this.emit("add", { value });
    }
    return this;
  }
  delete(value) {
    if (!this._set.has(value)) return false;
    this._set.delete(value);
    this.emit("delete", { value });
    return true;
  }
  clear() {
    if (this._set.size === 0) return;
    this._set.clear();
    this.emit("clear");
  }
  /** Subscribe to ALL mutation events with a single callback. */
  subscribe(listener) {
    const offs = [
      this.on("add", listener),
      this.on("delete", listener),
      this.on("clear", listener)
    ];
    return () => offs.forEach((off) => off());
  }
};
export {
  Emitter,
  ObservableArray,
  ObservableMap,
  ObservableSet
};
//# sourceMappingURL=index.js.map