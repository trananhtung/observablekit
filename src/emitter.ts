export type Listener<T extends unknown[]> = (...args: T) => void;

export interface Unsubscribe {
  (): void;
}

/** Minimal typed event emitter used internally by all Observable collections. */
export class Emitter<Events extends Record<string, unknown[]>> {
  private _listeners = new Map<keyof Events, Set<Listener<unknown[]>>>();

  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): Unsubscribe {
    let set = this._listeners.get(event);
    if (!set) { set = new Set(); this._listeners.set(event, set); }
    set.add(listener as Listener<unknown[]>);
    return () => set!.delete(listener as Listener<unknown[]>);
  }

  once<K extends keyof Events>(event: K, listener: Listener<Events[K]>): Unsubscribe {
    const off = this.on(event, ((...args: Events[K]) => { off(); listener(...args); }) as Listener<Events[K]>);
    return off;
  }

  off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
    this._listeners.get(event)?.delete(listener as Listener<unknown[]>);
  }

  emit<K extends keyof Events>(event: K, ...args: Events[K]): void {
    this._listeners.get(event)?.forEach(fn => fn(...args));
  }

  removeAllListeners(event?: keyof Events): void {
    if (event !== undefined) this._listeners.delete(event);
    else this._listeners.clear();
  }

  listenerCount(event: keyof Events): number {
    return this._listeners.get(event)?.size ?? 0;
  }
}
