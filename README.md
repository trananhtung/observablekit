# observablekit

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)

Zero-dependency TypeScript observable/reactive collections — `ObservableArray`, `ObservableMap`, and `ObservableSet` that emit typed events on every mutation.

Port of C# [`ObservableCollection<T>`](https://learn.microsoft.com/en-us/dotnet/api/system.collections.objectmodel.observablecollection-1) and Java [`ObservableList`](https://docs.oracle.com/javase/8/javafx/api/javafx/collections/ObservableList.html). Fills the gap in npm for lightweight reactive data structures without pulling in a full framework.

[![npm](https://img.shields.io/npm/v/observablekit)](https://www.npmjs.com/package/observablekit)
[![license](https://img.shields.io/npm/l/observablekit)](LICENSE)
[![zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](package.json)

## Install

```bash
npm install observablekit
```

## Quick start

```typescript
import { ObservableArray, ObservableMap, ObservableSet } from "observablekit";

const list = new ObservableArray<string>();

list.on("add", ({ index, items }) => {
  console.log(`Added [${items}] at index ${index}`);
});

list.push("hello", "world");
// Added [hello,world] at index 0
```

## ObservableArray\<T\>

```typescript
const arr = new ObservableArray([1, 2, 3]);

// Typed events
arr.on("add",     ({ index, items }) => { /* items added at index */ });
arr.on("remove",  ({ index, items }) => { /* items removed from index */ });
arr.on("change",  ({ index, oldValue, newValue }) => { /* item replaced */ });
arr.on("sort",    () => { /* array was sorted */ });
arr.on("reverse", () => { /* array was reversed */ });

// Mutations — all fire the appropriate event above
arr.push(4);            // → add
arr.pop();              // → remove
arr.unshift(0);         // → add
arr.shift();            // → remove
arr.splice(1, 1, 99);  // → remove + add
arr.set(0, 100);        // → change
arr.sort((a, b) => a - b);  // → sort
arr.reverse();          // → reverse
arr.clear();            // → remove

// All standard read methods are forwarded
arr.length;             // number
arr.get(0);             // T | undefined
arr.indexOf(2);         // number
arr.find(x => x > 2);  // T | undefined
arr.filter(x => x > 1) // T[]
arr.map(x => x * 2);   // U[]
arr.toArray();          // T[]   (copy)
[...arr];               // spread works

// Subscribe to ANY mutation with one callback
const off = arr.subscribe(() => console.log("changed"));
arr.push(5);  // fires
off();        // unsubscribe
```

## ObservableMap\<K, V\>

```typescript
const map = new ObservableMap<string, number>([["a", 1]]);

map.on("set",    ({ key, value, oldValue, isNew }) => { /* insert or update */ });
map.on("delete", ({ key, value }) => { /* entry removed */ });
map.on("clear",  () => { /* all entries removed */ });

map.set("b", 2);   // → set event (isNew=true)
map.set("a", 99);  // → set event (isNew=false, oldValue=1)
map.delete("b");   // → delete event
map.clear();       // → clear event

map.get("a");      // V | undefined
map.has("a");      // boolean
map.size;          // number
[...map.keys()];   // K[]
[...map.values()]; // V[]
[...map];          // [K, V][]
map.toMap();       // Map<K,V>  (copy)
```

## ObservableSet\<T\>

```typescript
const set = new ObservableSet<string>(["apple"]);

set.on("add",    ({ value }) => { /* value was inserted */ });
set.on("delete", ({ value }) => { /* value was removed */ });
set.on("clear",  () => { /* set emptied */ });

set.add("banana");   // → add (no event for duplicates)
set.delete("apple"); // → delete
set.clear();         // → clear

set.has("banana");   // boolean
set.size;            // number
set.toArray();       // T[]
[...set];            // T[]
```

## Emitter\<Events\>

All three collections extend `Emitter<Events>` — you can use it standalone too:

```typescript
import { Emitter } from "observablekit";

type MyEvents = {
  change: [value: number];
  reset: [];
};

const emitter = new Emitter<MyEvents>();
const off = emitter.on("change", v => console.log("changed:", v));
emitter.emit("change", 42);  // logs "changed: 42"
off();                        // unsubscribe
```

### Emitter API

| Method | Description |
|---|---|
| `on(event, listener)` | Subscribe, returns unsubscribe function |
| `once(event, listener)` | Subscribe for one firing only |
| `off(event, listener)` | Unsubscribe |
| `emit(event, ...args)` | Fire event |
| `removeAllListeners(event?)` | Clear one or all event handlers |
| `listenerCount(event)` | Number of active listeners |

## Use cases

- Sync UI components when data changes (without a framework)
- Persist to localStorage on every mutation
- Undo/redo: record operations from `add`/`remove`/`change` events
- Audit logging: record all collection mutations
- React to stream of events without polling

## Contributors ✨

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind are welcome — code, docs, bug reports, ideas, reviews! See the [emoji key](https://allcontributors.org/docs/en/emoji-key) for how each contribution is recognized, and open a PR or issue to get involved.

Thanks goes to these wonderful people:

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/trananhtung"><img src="https://avatars.githubusercontent.com/u/30992229?v=4?s=100" width="100px;" alt="Tung Tran"/><br /><sub><b>Tung Tran</b></sub></a><br /><a href="https://github.com/trananhtung/observablekit/commits?author=trananhtung" title="Code">💻</a> <a href="#maintenance-trananhtung" title="Maintenance">🚧</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## License

MIT
