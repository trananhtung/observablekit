import { Emitter, type Unsubscribe } from "./emitter.js";

export interface ArrayAddEvent<T> { index: number; items: T[] }
export interface ArrayRemoveEvent<T> { index: number; items: T[] }
export interface ArrayChangeEvent<T> { index: number; oldValue: T; newValue: T }

export type ObservableArrayEvents<T> = {
  add: [event: ArrayAddEvent<T>];
  remove: [event: ArrayRemoveEvent<T>];
  change: [event: ArrayChangeEvent<T>];
  sort: [];
  reverse: [];
};

/**
 * Observable Array — extends Array<T> with typed mutation events.
 * Mirrors C# ObservableCollection<T> / Java ObservableList<T>.
 */
export class ObservableArray<T> extends Emitter<ObservableArrayEvents<T>> {
  private _items: T[];

  constructor(initial: T[] = []) {
    super();
    this._items = [...initial];
  }

  // ── Read ──────────────────────────────────────────────────────────────────

  get length(): number { return this._items.length; }

  get(index: number): T | undefined { return this._items[index]; }

  toArray(): T[] { return [...this._items]; }

  [Symbol.iterator](): IterableIterator<T> { return this._items[Symbol.iterator](); }

  indexOf(item: T): number { return this._items.indexOf(item); }
  includes(item: T): boolean { return this._items.includes(item); }
  find(predicate: (item: T, i: number) => boolean): T | undefined { return this._items.find(predicate); }
  findIndex(predicate: (item: T, i: number) => boolean): number { return this._items.findIndex(predicate); }
  filter(predicate: (item: T, i: number) => boolean): T[] { return this._items.filter(predicate); }
  map<U>(fn: (item: T, i: number) => U): U[] { return this._items.map(fn); }
  forEach(fn: (item: T, i: number) => void): void { this._items.forEach(fn); }
  some(predicate: (item: T, i: number) => boolean): boolean { return this._items.some(predicate); }
  every(predicate: (item: T, i: number) => boolean): boolean { return this._items.every(predicate); }
  reduce<U>(fn: (acc: U, item: T, i: number) => U, init: U): U { return this._items.reduce(fn, init); }
  slice(start?: number, end?: number): T[] { return this._items.slice(start, end); }
  at(index: number): T | undefined { return this._items.at(index); }

  // ── Mutate ────────────────────────────────────────────────────────────────

  set(index: number, value: T): void {
    const old = this._items[index];
    this._items[index] = value;
    this.emit("change", { index, oldValue: old, newValue: value });
  }

  push(...items: T[]): number {
    const index = this._items.length;
    this._items.push(...items);
    if (items.length > 0) this.emit("add", { index, items });
    return this._items.length;
  }

  pop(): T | undefined {
    if (this._items.length === 0) return undefined;
    const index = this._items.length - 1;
    const item = this._items.pop()!;
    this.emit("remove", { index, items: [item] });
    return item;
  }

  unshift(...items: T[]): number {
    this._items.unshift(...items);
    if (items.length > 0) this.emit("add", { index: 0, items });
    return this._items.length;
  }

  shift(): T | undefined {
    if (this._items.length === 0) return undefined;
    const item = this._items.shift()!;
    this.emit("remove", { index: 0, items: [item] });
    return item;
  }

  splice(start: number, deleteCount?: number, ...insert: T[]): T[] {
    const removed = deleteCount !== undefined
      ? this._items.splice(start, deleteCount, ...insert)
      : this._items.splice(start);
    if (removed.length > 0) this.emit("remove", { index: start, items: removed });
    if (insert.length > 0) this.emit("add", { index: start, items: insert });
    return removed;
  }

  sort(compareFn?: (a: T, b: T) => number): this {
    this._items.sort(compareFn);
    this.emit("sort");
    return this;
  }

  reverse(): this {
    this._items.reverse();
    this.emit("reverse");
    return this;
  }

  clear(): void {
    if (this._items.length === 0) return;
    const removed = [...this._items];
    this._items = [];
    this.emit("remove", { index: 0, items: removed });
  }

  // ── Convenience ───────────────────────────────────────────────────────────

  /** Subscribe to ALL mutation events with a single callback. */
  subscribe(listener: () => void): Unsubscribe {
    const offs = [
      this.on("add", listener),
      this.on("remove", listener),
      this.on("change", listener),
      this.on("sort", listener),
      this.on("reverse", listener),
    ];
    return () => offs.forEach(off => off());
  }
}
