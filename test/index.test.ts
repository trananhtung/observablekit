import { Emitter, ObservableArray, ObservableMap, ObservableSet } from "../src/index.js";

// ── Emitter ────────────────────────────────────────────────────────────────

describe("Emitter", () => {
  test("on + emit fires listener", () => {
    const e = new Emitter<{ ping: [number] }>();
    const calls: number[] = [];
    e.on("ping", n => calls.push(n));
    e.emit("ping", 42);
    expect(calls).toEqual([42]);
  });

  test("off via returned unsubscribe", () => {
    const e = new Emitter<{ x: [] }>();
    let count = 0;
    const off = e.on("x", () => count++);
    e.emit("x");
    off();
    e.emit("x");
    expect(count).toBe(1);
  });

  test("off() method removes listener", () => {
    const e = new Emitter<{ x: [] }>();
    let count = 0;
    const fn = () => count++;
    e.on("x", fn);
    e.off("x", fn);
    e.emit("x");
    expect(count).toBe(0);
  });

  test("once fires exactly once", () => {
    const e = new Emitter<{ x: [] }>();
    let count = 0;
    e.once("x", () => count++);
    e.emit("x");
    e.emit("x");
    expect(count).toBe(1);
  });

  test("multiple listeners for same event", () => {
    const e = new Emitter<{ x: [] }>();
    let a = 0, b = 0;
    e.on("x", () => a++);
    e.on("x", () => b++);
    e.emit("x");
    expect(a).toBe(1);
    expect(b).toBe(1);
  });

  test("removeAllListeners(event) clears one event", () => {
    const e = new Emitter<{ x: []; y: [] }>();
    let x = 0, y = 0;
    e.on("x", () => x++);
    e.on("y", () => y++);
    e.removeAllListeners("x");
    e.emit("x"); e.emit("y");
    expect(x).toBe(0);
    expect(y).toBe(1);
  });

  test("removeAllListeners() clears all", () => {
    const e = new Emitter<{ x: []; y: [] }>();
    let x = 0, y = 0;
    e.on("x", () => x++);
    e.on("y", () => y++);
    e.removeAllListeners();
    e.emit("x"); e.emit("y");
    expect(x + y).toBe(0);
  });

  test("listenerCount reflects count", () => {
    const e = new Emitter<{ x: [] }>();
    expect(e.listenerCount("x")).toBe(0);
    const off = e.on("x", () => {});
    expect(e.listenerCount("x")).toBe(1);
    off();
    expect(e.listenerCount("x")).toBe(0);
  });
});

// ── ObservableArray ────────────────────────────────────────────────────────

describe("ObservableArray — construction", () => {
  test("empty by default", () => {
    const a = new ObservableArray<number>();
    expect(a.length).toBe(0);
  });

  test("initialised from array", () => {
    const a = new ObservableArray([1, 2, 3]);
    expect(a.length).toBe(3);
    expect(a.toArray()).toEqual([1, 2, 3]);
  });

  test("Symbol.iterator", () => {
    const a = new ObservableArray([1, 2, 3]);
    expect([...a]).toEqual([1, 2, 3]);
  });
});

describe("ObservableArray — push / pop", () => {
  test("push fires 'add' event with correct index", () => {
    const a = new ObservableArray<number>();
    const events: Array<{ index: number; items: number[] }> = [];
    a.on("add", e => events.push(e));
    a.push(1, 2);
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ index: 0, items: [1, 2] });
    expect(a.length).toBe(2);
  });

  test("pop fires 'remove' event", () => {
    const a = new ObservableArray([10, 20]);
    const removed: number[] = [];
    a.on("remove", e => removed.push(...e.items));
    a.pop();
    expect(removed).toEqual([20]);
    expect(a.length).toBe(1);
  });

  test("pop on empty returns undefined without event", () => {
    const a = new ObservableArray<number>();
    let fired = false;
    a.on("remove", () => { fired = true; });
    expect(a.pop()).toBeUndefined();
    expect(fired).toBe(false);
  });
});

describe("ObservableArray — unshift / shift", () => {
  test("unshift fires 'add' at index 0", () => {
    const a = new ObservableArray([3]);
    const events: Array<{ index: number; items: number[] }> = [];
    a.on("add", e => events.push(e));
    a.unshift(1, 2);
    expect(events[0]).toEqual({ index: 0, items: [1, 2] });
    expect([...a]).toEqual([1, 2, 3]);
  });

  test("shift fires 'remove' at index 0", () => {
    const a = new ObservableArray([1, 2, 3]);
    const removed: number[] = [];
    a.on("remove", e => removed.push(...e.items));
    a.shift();
    expect(removed).toEqual([1]);
    expect([...a]).toEqual([2, 3]);
  });
});

describe("ObservableArray — splice", () => {
  test("splice remove fires 'remove' event", () => {
    const a = new ObservableArray([1, 2, 3, 4]);
    const events: number[][] = [];
    a.on("remove", e => events.push(e.items));
    const removed = a.splice(1, 2);
    expect(removed).toEqual([2, 3]);
    expect(events).toEqual([[2, 3]]);
    expect([...a]).toEqual([1, 4]);
  });

  test("splice insert fires 'add' event", () => {
    const a = new ObservableArray([1, 4]);
    const added: number[][] = [];
    a.on("add", e => added.push(e.items));
    a.splice(1, 0, 2, 3);
    expect(added).toEqual([[2, 3]]);
    expect([...a]).toEqual([1, 2, 3, 4]);
  });

  test("splice replace fires both events", () => {
    const a = new ObservableArray(["a", "b", "c"]);
    let removes = 0, adds = 0;
    a.on("remove", () => removes++);
    a.on("add", () => adds++);
    a.splice(1, 1, "X", "Y");
    expect(removes).toBe(1);
    expect(adds).toBe(1);
    expect([...a]).toEqual(["a", "X", "Y", "c"]);
  });
});

describe("ObservableArray — set / sort / reverse", () => {
  test("set fires 'change' with old and new value", () => {
    const a = new ObservableArray([1, 2, 3]);
    const changes: Array<{ index: number; oldValue: number; newValue: number }> = [];
    a.on("change", e => changes.push(e));
    a.set(1, 99);
    expect(changes).toEqual([{ index: 1, oldValue: 2, newValue: 99 }]);
    expect(a.get(1)).toBe(99);
  });

  test("sort fires 'sort' event", () => {
    const a = new ObservableArray([3, 1, 2]);
    let fired = false;
    a.on("sort", () => { fired = true; });
    a.sort((x, y) => x - y);
    expect(fired).toBe(true);
    expect([...a]).toEqual([1, 2, 3]);
  });

  test("reverse fires 'reverse' event", () => {
    const a = new ObservableArray([1, 2, 3]);
    let fired = false;
    a.on("reverse", () => { fired = true; });
    a.reverse();
    expect(fired).toBe(true);
    expect([...a]).toEqual([3, 2, 1]);
  });
});

describe("ObservableArray — clear", () => {
  test("clear fires 'remove' with all items", () => {
    const a = new ObservableArray([1, 2, 3]);
    const events: Array<{ index: number; items: number[] }> = [];
    a.on("remove", e => events.push(e));
    a.clear();
    expect(events).toHaveLength(1);
    expect(events[0].items).toEqual([1, 2, 3]);
    expect(a.length).toBe(0);
  });

  test("clear on empty does not fire event", () => {
    const a = new ObservableArray<number>();
    let fired = false;
    a.on("remove", () => { fired = true; });
    a.clear();
    expect(fired).toBe(false);
  });
});

describe("ObservableArray — subscribe()", () => {
  test("subscribe fires for any mutation", () => {
    const a = new ObservableArray([1]);
    let count = 0;
    a.subscribe(() => count++);
    a.push(2);
    a.pop();
    a.sort();
    expect(count).toBe(3);
  });

  test("subscribe returns unsubscribe function", () => {
    const a = new ObservableArray([1]);
    let count = 0;
    const off = a.subscribe(() => count++);
    a.push(2);
    off();
    a.push(3);
    expect(count).toBe(1);
  });
});

describe("ObservableArray — read methods", () => {
  const a = new ObservableArray([10, 20, 30]);

  test("indexOf", () => expect(a.indexOf(20)).toBe(1));
  test("includes", () => expect(a.includes(30)).toBe(true));
  test("find", () => expect(a.find(x => x > 15)).toBe(20));
  test("findIndex", () => expect(a.findIndex(x => x > 25)).toBe(2));
  test("filter", () => expect(a.filter(x => x > 15)).toEqual([20, 30]));
  test("map", () => expect(a.map(x => x * 2)).toEqual([20, 40, 60]));
  test("some", () => expect(a.some(x => x === 30)).toBe(true));
  test("every", () => expect(a.every(x => x > 5)).toBe(true));
  test("reduce", () => expect(a.reduce((s, x) => s + x, 0)).toBe(60));
  test("slice", () => expect(a.slice(1)).toEqual([20, 30]));
  test("at", () => expect(a.at(-1)).toBe(30));
});

// ── ObservableMap ──────────────────────────────────────────────────────────

describe("ObservableMap — construction", () => {
  test("empty by default", () => expect(new ObservableMap().size).toBe(0));
  test("initialised from entries", () => {
    const m = new ObservableMap([["a", 1], ["b", 2]]);
    expect(m.size).toBe(2);
    expect(m.get("a")).toBe(1);
  });
});

describe("ObservableMap — set", () => {
  test("fires 'set' with isNew=true on insert", () => {
    const m = new ObservableMap<string, number>();
    const events: Array<{ key: string; value: number; isNew: boolean }> = [];
    m.on("set", e => events.push(e));
    m.set("x", 42);
    expect(events[0]).toMatchObject({ key: "x", value: 42, isNew: true, oldValue: undefined });
  });

  test("fires 'set' with isNew=false on update", () => {
    const m = new ObservableMap([["x", 1]]);
    const events: Array<{ isNew: boolean; oldValue: number | undefined }> = [];
    m.on("set", e => events.push(e));
    m.set("x", 99);
    expect(events[0]).toMatchObject({ isNew: false, oldValue: 1, value: 99 });
  });

  test("returns this for chaining", () => {
    const m = new ObservableMap<string, number>();
    expect(m.set("a", 1)).toBe(m);
  });
});

describe("ObservableMap — delete", () => {
  test("fires 'delete' event on removal", () => {
    const m = new ObservableMap([["k", 5]]);
    const events: Array<{ key: string; value: number }> = [];
    m.on("delete", e => events.push(e));
    const result = m.delete("k");
    expect(result).toBe(true);
    expect(events).toEqual([{ key: "k", value: 5 }]);
    expect(m.size).toBe(0);
  });

  test("returns false and no event for missing key", () => {
    const m = new ObservableMap<string, number>();
    let fired = false;
    m.on("delete", () => { fired = true; });
    expect(m.delete("nope")).toBe(false);
    expect(fired).toBe(false);
  });
});

describe("ObservableMap — clear", () => {
  test("fires 'clear' event", () => {
    const m = new ObservableMap([["a", 1]]);
    let fired = false;
    m.on("clear", () => { fired = true; });
    m.clear();
    expect(fired).toBe(true);
    expect(m.size).toBe(0);
  });

  test("no event when already empty", () => {
    const m = new ObservableMap();
    let fired = false;
    m.on("clear", () => { fired = true; });
    m.clear();
    expect(fired).toBe(false);
  });
});

describe("ObservableMap — subscribe / iteration", () => {
  test("subscribe fires on set and delete", () => {
    const m = new ObservableMap<string, number>();
    let count = 0;
    m.subscribe(() => count++);
    m.set("a", 1);
    m.delete("a");
    expect(count).toBe(2);
  });

  test("keys/values/entries iterables", () => {
    const m = new ObservableMap([["a", 1], ["b", 2]]);
    expect([...m.keys()]).toEqual(["a", "b"]);
    expect([...m.values()]).toEqual([1, 2]);
    expect([...m.entries()]).toEqual([["a", 1], ["b", 2]]);
  });

  test("[Symbol.iterator]", () => {
    const m = new ObservableMap([["x", 10]]);
    expect([...m]).toEqual([["x", 10]]);
  });
});

// ── ObservableSet ──────────────────────────────────────────────────────────

describe("ObservableSet — construction", () => {
  test("empty by default", () => expect(new ObservableSet().size).toBe(0));
  test("initialised from iterable", () => {
    const s = new ObservableSet([1, 2, 3]);
    expect(s.size).toBe(3);
    expect(s.has(2)).toBe(true);
  });
});

describe("ObservableSet — add", () => {
  test("fires 'add' event for new value", () => {
    const s = new ObservableSet<number>();
    const values: number[] = [];
    s.on("add", e => values.push(e.value));
    s.add(7);
    expect(values).toEqual([7]);
    expect(s.size).toBe(1);
  });

  test("no event for duplicate value", () => {
    const s = new ObservableSet([5]);
    let fired = false;
    s.on("add", () => { fired = true; });
    s.add(5);
    expect(fired).toBe(false);
    expect(s.size).toBe(1);
  });

  test("returns this for chaining", () => {
    const s = new ObservableSet<number>();
    expect(s.add(1)).toBe(s);
  });
});

describe("ObservableSet — delete", () => {
  test("fires 'delete' event and returns true", () => {
    const s = new ObservableSet(["a", "b"]);
    const deleted: string[] = [];
    s.on("delete", e => deleted.push(e.value));
    expect(s.delete("a")).toBe(true);
    expect(deleted).toEqual(["a"]);
    expect(s.size).toBe(1);
  });

  test("returns false and no event for missing value", () => {
    const s = new ObservableSet<string>();
    let fired = false;
    s.on("delete", () => { fired = true; });
    expect(s.delete("x")).toBe(false);
    expect(fired).toBe(false);
  });
});

describe("ObservableSet — clear", () => {
  test("fires 'clear' event", () => {
    const s = new ObservableSet([1, 2]);
    let fired = false;
    s.on("clear", () => { fired = true; });
    s.clear();
    expect(fired).toBe(true);
    expect(s.size).toBe(0);
  });

  test("no event when empty", () => {
    const s = new ObservableSet<number>();
    let fired = false;
    s.on("clear", () => { fired = true; });
    s.clear();
    expect(fired).toBe(false);
  });
});

describe("ObservableSet — subscribe / iteration", () => {
  test("subscribe fires on add/delete", () => {
    const s = new ObservableSet<number>();
    let count = 0;
    const off = s.subscribe(() => count++);
    s.add(1);
    s.add(2);
    s.delete(1);
    off();
    s.add(99);
    expect(count).toBe(3);
  });

  test("toArray / toSet", () => {
    const s = new ObservableSet([1, 2, 3]);
    expect(s.toArray()).toEqual([1, 2, 3]);
    expect(s.toSet()).toEqual(new Set([1, 2, 3]));
  });

  test("[Symbol.iterator]", () => {
    const s = new ObservableSet(["x", "y"]);
    expect([...s]).toEqual(["x", "y"]);
  });
});
