---
title: Charts with Observable Plot
---

# Charts with Observable Plot

[Observable Plot](https://observablehq.com/plot/) is a concise JavaScript library for exploratory data visualization. It is available globally in Observable Framework - no import needed.

<div class="tip">

**Display rule**: Observable Framework displays the return value of a cell only when the cell is a **single expression**. For charts, keep data definitions in a separate cell above, and put only `Plot.plot(...)` in the chart cell.

</div>

---

## Bar Chart

```js
// Data definition cell
const populationData = [
  {city: "Zürich",     population: 421878},
  {city: "Genève",     population: 201818},
  {city: "Basel",      population: 177827},
  {city: "Lausanne",   population: 139111},
  {city: "Bern",       population: 133883},
  {city: "Winterthur", population: 116906},
  {city: "Luzern",     population:  82888},
  {city: "Fribourg",   population:  38365},
];
```

```js
// Chart cell - single expression, displayed automatically
Plot.plot({
  title: "Swiss city populations",
  marks: [
    Plot.barX(populationData, {x: "population", y: "city", fill: "steelblue", sort: {y: "-x"}}),
    Plot.ruleX([0])
  ],
  x: {label: "Population", tickFormat: "~s"},
  y: {label: null},
  marginLeft: 80
})
```

---

## Line Chart

```js
const historicalPeriods = [
  {year: 1700, area: 120}, {year: 1750, area: 145},
  {year: 1800, area: 220}, {year: 1831, area: 310},
  {year: 1850, area: 480}, {year: 1870, area: 720},
  {year: 1888, area: 980}, {year: 1900, area: 1250},
  {year: 1920, area: 1680},{year: 1940, area: 2100},
];
```

```js
Plot.plot({
  title: "Hypothetical built area over time (ha)",
  marks: [
    Plot.lineY(historicalPeriods, {x: "year", y: "area", stroke: "steelblue", strokeWidth: 2}),
    Plot.dot(historicalPeriods, {x: "year", y: "area", fill: "steelblue"}),
    Plot.ruleY([0])
  ],
  x: {label: "Year", tickFormat: d => String(d)},
  y: {label: "Built area (ha)"}
})
```

---

## Scatter Plot

```js
// parcelData is also used in the Histogram and Reactive Chart sections below
const parcelData = Array.from({length: 200}, () => ({
  area: Math.round(50 + Math.random() * 2000),
  value: Math.round(1000 + Math.random() * 50000),
  type: ["residential", "commercial", "agricultural"][Math.floor(Math.random() * 3)]
}));
```

```js
Plot.plot({
  title: "Parcel area vs. estimated value (synthetic data)",
  marks: [
    Plot.dot(parcelData, {x: "area", y: "value", fill: "type", opacity: 0.6, r: 4})
  ],
  x: {label: "Area (m²)"},
  y: {label: "Value (CHF)", tickFormat: "~s"},
  color: {legend: true}
})
```

---

## Histogram

```js
Plot.plot({
  title: "Distribution of parcel areas",
  marks: [
    Plot.rectY(parcelData, Plot.binX({y: "count"}, {x: "area", fill: "steelblue"})),
    Plot.ruleY([0])
  ],
  x: {label: "Area (m²)"},
  y: {label: "Count"}
})
```

---

## Reactive Chart with Inputs

The power of Observable Framework: charts update automatically when inputs change.

When the chart cell is a **single `Plot.plot(...)` expression**, Observable Framework can display it and react to dependency changes correctly:

```js
const selectedType = view(Inputs.checkbox(
  ["residential", "commercial", "agricultural"],
  {label: "Show types", value: ["residential", "commercial", "agricultural"]}
))
```

```js
// Single-expression cell: no const declarations, just the chart.
// The filter happens inline inside the mark specification.
Plot.plot({
  title: `Parcels by type (${parcelData.filter(d => selectedType.includes(d.type)).length} shown)`,
  marks: [
    Plot.dot(
      parcelData.filter(d => selectedType.includes(d.type)),
      {x: "area", y: "value", fill: "type", opacity: 0.6, r: 4}
    )
  ],
  x: {label: "Area (m²)"},
  y: {label: "Value (CHF)", tickFormat: "~s"},
  color: {legend: true}
})
```

---

## Using Real Data from a File

Apply the same patterns to data from a CSV file:

```js
const registreData = FileAttachment("../data/lausanne-1888-cadastre-renove-registre-20250410.csv").csv({typed: true})
```

```js
// Count parcels by use type and display as a bar chart (top 20)
const useCounts = Array.from(d3.rollup(registreData, rows => rows.length, d => d.use))
  .sort(([, a], [, b]) => b - a)
  .slice(0, 20);
```

```js
Plot.plot({
  marks: [
    Plot.barY(useCounts, {x: ([use]) => use, y: ([, count]) => count, fill: "steelblue", sort: {x: "-y"}}),
    Plot.ruleY([0])
  ],
  x: {label: "Use type", tickRotate: -30},
  y: {label: "Count"},
  marginBottom: 80
})
```

---

## Plot Quick Reference

| Mark | Use for |
|------|---------|
| `Plot.barX / barY` | Bar chart |
| `Plot.lineY` | Line chart |
| `Plot.dot` | Scatter plot |
| `Plot.rectY + binX` | Histogram |
| `Plot.areaY` | Area chart |
| `Plot.text` | Text annotations |
| `Plot.ruleX / ruleY` | Reference lines |
| `Plot.geo` | Geographic polygons |

Full documentation: [observablehq.com/plot](https://observablehq.com/plot)
