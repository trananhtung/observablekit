type Listener<T extends unknown[]> = (...args: T) => void;
interface Unsubscribe {
    (): void;
}
/** Minimal typed event emitter used internally by all Observable collections. */
declare class Emitter<Events extends Record<string, unknown[]>> {
    private _listeners;
    on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): Unsubscribe;
    once<K extends keyof Events>(event: K, listener: Listener<Events[K]>): Unsubscribe;
    off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void;
    emit<K extends keyof Events>(event: K, ...args: Events[K]): void;
    removeAllListeners(event?: keyof Events): void;
    listenerCount(event: keyof Events): number;
}

interface ArrayAddEvent<T> {
    index: number;
    items: T[];
}
interface ArrayRemoveEvent<T> {
    index: number;
    items: T[];
}
interface ArrayChangeEvent<T> {
    index: number;
    oldValue: T;
    newValue: T;
}
type ObservableArrayEvents<T> = {
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
declare class ObservableArray<T> extends Emitter<ObservableArrayEvents<T>> {
    private _items;
    constructor(initial?: T[]);
    get length(): number;
    get(index: number): T | undefined;
    toArray(): T[];
    [Symbol.iterator](): IterableIterator<T>;
    indexOf(item: T): number;
    includes(item: T): boolean;
    find(predicate: (item: T, i: number) => boolean): T | undefined;
    findIndex(predicate: (item: T, i: number) => boolean): number;
    filter(predicate: (item: T, i: number) => boolean): T[];
    map<U>(fn: (item: T, i: number) => U): U[];
    forEach(fn: (item: T, i: number) => void): void;
    some(predicate: (item: T, i: number) => boolean): boolean;
    every(predicate: (item: T, i: number) => boolean): boolean;
    reduce<U>(fn: (acc: U, item: T, i: number) => U, init: U): U;
    slice(start?: number, end?: number): T[];
    at(index: number): T | undefined;
    set(index: number, value: T): void;
    push(...items: T[]): number;
    pop(): T | undefined;
    unshift(...items: T[]): number;
    shift(): T | undefined;
    splice(start: number, deleteCount?: number, ...insert: T[]): T[];
    sort(compareFn?: (a: T, b: T) => number): this;
    reverse(): this;
    clear(): void;
    /** Subscribe to ALL mutation events with a single callback. */
    subscribe(listener: () => void): Unsubscribe;
}

interface MapSetEvent<K, V> {
    key: K;
    value: V;
    oldValue: V | undefined;
    isNew: boolean;
}
interface MapDeleteEvent<K, V> {
    key: K;
    value: V;
}
type ObservableMapEvents<K, V> = {
    set: [event: MapSetEvent<K, V>];
    delete: [event: MapDeleteEvent<K, V>];
    clear: [];
};
/**
 * Observable Map — wraps Map<K, V> with typed mutation events.
 * Mirrors Java ObservableMap / C# ObservableDictionary.
 */
declare class ObservableMap<K, V> extends Emitter<ObservableMapEvents<K, V>> {
    private _map;
    constructor(initial?: Iterable<[K, V]>);
    get size(): number;
    get(key: K): V | undefined;
    has(key: K): boolean;
    keys(): IterableIterator<K>;
    values(): IterableIterator<V>;
    entries(): IterableIterator<[K, V]>;
    [Symbol.iterator](): IterableIterator<[K, V]>;
    forEach(fn: (value: V, key: K, map: Map<K, V>) => void): void;
    toMap(): Map<K, V>;
    set(key: K, value: V): this;
    delete(key: K): boolean;
    clear(): void;
    /** Subscribe to ALL mutation events with a single callback. */
    subscribe(listener: () => void): Unsubscribe;
}

interface SetAddEvent<T> {
    value: T;
}
interface SetDeleteEvent<T> {
    value: T;
}
type ObservableSetEvents<T> = {
    add: [event: SetAddEvent<T>];
    delete: [event: SetDeleteEvent<T>];
    clear: [];
};
/**
 * Observable Set — wraps Set<T> with typed mutation events.
 * Mirrors Java ObservableSet / C# observable set patterns.
 */
declare class ObservableSet<T> extends Emitter<ObservableSetEvents<T>> {
    private _set;
    constructor(initial?: Iterable<T>);
    get size(): number;
    has(value: T): boolean;
    values(): IterableIterator<T>;
    keys(): IterableIterator<T>;
    entries(): IterableIterator<[T, T]>;
    [Symbol.iterator](): IterableIterator<T>;
    forEach(fn: (value: T, value2: T, set: Set<T>) => void): void;
    toSet(): Set<T>;
    toArray(): T[];
    add(value: T): this;
    delete(value: T): boolean;
    clear(): void;
    /** Subscribe to ALL mutation events with a single callback. */
    subscribe(listener: () => void): Unsubscribe;
}

export { type ArrayAddEvent, type ArrayChangeEvent, type ArrayRemoveEvent, Emitter, type Listener, type MapDeleteEvent, type MapSetEvent, ObservableArray, type ObservableArrayEvents, ObservableMap, type ObservableMapEvents, ObservableSet, type ObservableSetEvents, type SetAddEvent, type SetDeleteEvent, type Unsubscribe };
