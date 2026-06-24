import { Emitter, type Unsubscribe } from "./emitter.js";

export interface MapSetEvent<K, V> { key: K; value: V; oldValue: V | undefined; isNew: boolean }
export interface MapDeleteEvent<K, V> { key: K; value: V }

export type ObservableMapEvents<K, V> = {
  set: [event: MapSetEvent<K, V>];
  delete: [event: MapDeleteEvent<K, V>];
  clear: [];
};

/**
 * Observable Map — wraps Map<K, V> with typed mutation events.
 * Mirrors Java ObservableMap / C# ObservableDictionary.
 */
export class ObservableMap<K, V> extends Emitter<ObservableMapEvents<K, V>> {
  private _map: Map<K, V>;

  constructor(initial?: Iterable<[K, V]>) {
    super();
    this._map = new Map(initial);
  }

  // ── Read ──────────────────────────────────────────────────────────────────

  get size(): number { return this._map.size; }
  get(key: K): V | undefined { return this._map.get(key); }
  has(key: K): boolean { return this._map.has(key); }
  keys(): IterableIterator<K> { return this._map.keys(); }
  values(): IterableIterator<V> { return this._map.values(); }
  entries(): IterableIterator<[K, V]> { return this._map.entries(); }
  [Symbol.iterator](): IterableIterator<[K, V]> { return this._map[Symbol.iterator](); }
  forEach(fn: (value: V, key: K, map: Map<K, V>) => void): void { this._map.forEach(fn); }
  toMap(): Map<K, V> { return new Map(this._map); }

  // ── Mutate ────────────────────────────────────────────────────────────────

  set(key: K, value: V): this {
    const oldValue = this._map.get(key);
    const isNew = !this._map.has(key);
    this._map.set(key, value);
    this.emit("set", { key, value, oldValue, isNew });
    return this;
  }

  delete(key: K): boolean {
    if (!this._map.has(key)) return false;
    const value = this._map.get(key)!;
    this._map.delete(key);
    this.emit("delete", { key, value });
    return true;
  }

  clear(): void {
    if (this._map.size === 0) return;
    this._map.clear();
    this.emit("clear");
  }

  /** Subscribe to ALL mutation events with a single callback. */
  subscribe(listener: () => void): Unsubscribe {
    const offs = [
      this.on("set", listener),
      this.on("delete", listener),
      this.on("clear", listener),
    ];
    return () => offs.forEach(off => off());
  }
}
