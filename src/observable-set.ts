import { Emitter, type Unsubscribe } from "./emitter.js";

export interface SetAddEvent<T> { value: T }
export interface SetDeleteEvent<T> { value: T }

export type ObservableSetEvents<T> = {
  add: [event: SetAddEvent<T>];
  delete: [event: SetDeleteEvent<T>];
  clear: [];
};

/**
 * Observable Set — wraps Set<T> with typed mutation events.
 * Mirrors Java ObservableSet / C# observable set patterns.
 */
export class ObservableSet<T> extends Emitter<ObservableSetEvents<T>> {
  private _set: Set<T>;

  constructor(initial?: Iterable<T>) {
    super();
    this._set = new Set(initial);
  }

  // ── Read ──────────────────────────────────────────────────────────────────

  get size(): number { return this._set.size; }
  has(value: T): boolean { return this._set.has(value); }
  values(): IterableIterator<T> { return this._set.values(); }
  keys(): IterableIterator<T> { return this._set.keys(); }
  entries(): IterableIterator<[T, T]> { return this._set.entries(); }
  [Symbol.iterator](): IterableIterator<T> { return this._set[Symbol.iterator](); }
  forEach(fn: (value: T, value2: T, set: Set<T>) => void): void { this._set.forEach(fn); }
  toSet(): Set<T> { return new Set(this._set); }
  toArray(): T[] { return [...this._set]; }

  // ── Mutate ────────────────────────────────────────────────────────────────

  add(value: T): this {
    if (!this._set.has(value)) {
      this._set.add(value);
      this.emit("add", { value });
    }
    return this;
  }

  delete(value: T): boolean {
    if (!this._set.has(value)) return false;
    this._set.delete(value);
    this.emit("delete", { value });
    return true;
  }

  clear(): void {
    if (this._set.size === 0) return;
    this._set.clear();
    this.emit("clear");
  }

  /** Subscribe to ALL mutation events with a single callback. */
  subscribe(listener: () => void): Unsubscribe {
    const offs = [
      this.on("add", listener),
      this.on("delete", listener),
      this.on("clear", listener),
    ];
    return () => offs.forEach(off => off());
  }
}
