---
title: Reactivity & Inputs
---

# Reactivity & Inputs

Observable Framework pages are **reactive**: when a value changes, every cell that depends on it automatically re-runs. This page walks through the key concepts.

---

## The `view()` function

Use `view()` to create an interactive input. The variable is bound to whatever the user selects, and any cell that uses it re-runs automatically:

```javascript
const name = view(Inputs.text({label: "Your name", placeholder: "Type here…"}))
```

```js
const name = view(Inputs.text({label: "Your name", placeholder: "Type here…"}))
```

`name` is now a reactive variable. You can use it anywhere on the page:

```js
display(`Hello, ${name || "stranger"}!`)
```

You can also use it inline in Markdown: Hello, **${name || "stranger"}**!

---

## Range Slider

```javascript
const year = view(Inputs.range([1721, 1970], {label: "Year", step: 1, value: 1831}))
```

```js
const year = view(Inputs.range([1721, 1970], {label: "Year", step: 1, value: 1831}))
```

Selected year: **${year}**

---

## Select Dropdown

```javascript
const city = view(Inputs.select(
  ["Lausanne", "Genève", "Zürich", "Bern", "Basel"],
  {label: "City"}
))
```

```js
const city = view(Inputs.select(
  ["Lausanne", "Genève", "Zürich", "Bern", "Basel"],
  {label: "City"}
))
```

You selected: **${city}**

---

## Toggle and Radio

```javascript
const showGrid = view(Inputs.toggle({label: "Show grid", value: true}))
```

```javascript
const colorScheme = view(Inputs.radio(
  ["Blue", "Red", "Green"],
  {label: "Color scheme", value: "Blue"}
))
```

```js
const showGrid = view(Inputs.toggle({label: "Show grid", value: true}))
```

```js
const colorScheme = view(Inputs.radio(
  ["Blue", "Red", "Green"],
  {label: "Color scheme", value: "Blue"}
))
```

Settings: grid=${showGrid}, color=${colorScheme}

---

## Reactive Cells

Any cell that references a `view()` variable automatically re-runs when the value changes:

```javascript
// This cell re-runs whenever `year` changes
const message = year < 1800
  ? "18th century map"
  : year < 1900
  ? "19th century map"
  : "20th century map";

display(`${year}: ${message}`)
```

```js
const message = year < 1800
  ? "18th century map"
  : year < 1900
  ? "19th century map"
  : "20th century map";

display(`${year}: ${message}`)
```

---

## Reactive Chart Example

A bar chart that updates based on a slider - the key pattern for interactive visualizations. Note that the chart cell contains only `Plot.plot(...)` with the data computed inline; this ensures Observable Framework displays it correctly:

```javascript
const n = view(Inputs.range([3, 20], {label: "Number of bars", step: 1, value: 8}))
```

```js
const n = view(Inputs.range([3, 20], {label: "Number of bars", step: 1, value: 8}))
```

```js
// Single-expression cell: Plot.plot() is the return value → displayed automatically.
// The Array.from() that builds the data is computed inline inside the mark.
Plot.plot({
  marks: [
    Plot.barY(
      Array.from({length: n}, (_, i) => ({label: `Item ${i + 1}`, value: Math.round(20 + Math.random() * 80)})),
      {x: "label", y: "value", fill: "steelblue"}
    ),
    Plot.ruleY([0])
  ],
  x: {label: null},
  y: {label: "Value", domain: [0, 100]},
  width: 640,
  height: 250
})
```

<div class="tip">

**Cell display rule**: Observable Framework displays the return value of a cell only when the **entire cell is a single expression**. If you need to define an intermediate variable (e.g., `const data = ...`), put it in a separate cell above, then reference it in a chart-only cell below.

</div>

---

## The `invalidation` Promise

When a reactive cell re-runs because a dependency changed, Observable Framework first fires the `invalidation` promise - giving you a chance to clean up the previous run's resources.

The map below re-creates itself every time you move the zoom slider. Without `invalidation.then(() => map.remove())`, each slider change would add a new map on top of the old one. Try changing the zoom to see the map update cleanly:

```javascript
const zoom = view(Inputs.range([10, 16], {label: "Zoom level", step: 1, value: 13}))
```

```javascript
// This cell depends on `zoom`, so it re-runs on every change.
// Without invalidation: maps stack up on every re-run.
// With invalidation: old map is removed before new one is created.
const div = display(document.createElement("div"));
div.style = "height: 320px;";

const map = L.map(div).setView([46.519653, 6.632273], zoom);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

invalidation.then(() => map.remove()); // ← essential cleanup
```

```js
const zoom = view(Inputs.range([10, 16], {label: "Zoom level", step: 1, value: 13}))
```

```js
const div = display(document.createElement("div"));
div.style = "height: 320px;";
const map = L.map(div, {zoomControl: false}).setView([46.519653, 6.632273], zoom);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
invalidation.then(() => map.remove());
```

Each time you drag the slider, the old map is cleanly removed and a new one is created at the new zoom level.

---

## Key Inputs Reference

| Input | Usage |
|-------|-------|
| `view(Inputs.text({label}))` | Free text entry |
| `view(Inputs.range([min, max], {step, value}))` | Slider |
| `view(Inputs.select(options, {label}))` | Dropdown |
| `view(Inputs.radio(options, {label}))` | Radio buttons |
| `view(Inputs.checkbox(options, {label}))` | Checkboxes |
| `view(Inputs.toggle({label, value}))` | On/off switch |
| `view(Inputs.search(data))` | Search/filter rows |
| `Inputs.table(data)` | Sortable table (display only) |

Full documentation: [observablehq.com/framework/lib/inputs](https://observablehq.com/framework/lib/inputs)
