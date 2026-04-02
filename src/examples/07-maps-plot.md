---
title: Analytical Maps with Plot
toc: false
---

# Analytical Maps with Observable Plot

Observable Plot's `geo` mark renders GeoJSON geometries. Combined with D3's projection system, it lets you create static or lightly interactive maps that integrate naturally into your document flow - without the overhead of a full mapping library.

Use Plot for **analysis and presentation**; use Leaflet for **interactive exploration**.

<div class="note">

Plot maps have **no basemap tiles** - they show only the data geometry. For historical raster backgrounds, use Leaflet (see [Historical Maps](./06-maps-historical)).

</div>

---

## World Context Map

A minimal world map using TopoJSON from a CDN:

```js
import * as topojson from "npm:topojson-client";
```

```js
const world = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
  .then(r => r.json());
```

```js
// Single-expression chart cell
Plot.plot({
  title: "World map (Equal Earth projection)",
  width: 640,
  height: 380,
  projection: "equal-earth",
  marks: [
    Plot.geo({type: "Sphere"}, {fill: "#e8f4f8"}),
    Plot.geo(d3.geoGraticule10(), {stroke: "#ccc", strokeWidth: 0.5}),
    Plot.geo(topojson.feature(world, world.objects.countries), {fill: "#b8d4b8", stroke: "white", strokeWidth: 0.5}),
  ]
})
```

---

## Plotting GeoJSON Points

Render the Lausanne 1888 cadastre points directly with Plot - no Leaflet needed:

```js
const cadastrePoints = await FileAttachment("../data/lausanne-1888-cadastre-renove-points-20250409.geojson").json();
```

```js
// Auto-fits the mercator projection to the data extent
Plot.plot({
  title: "Lausanne - Cadastre Rénové (1888)",
  width: 640,
  height: 500,
  projection: {type: "mercator", domain: cadastrePoints},
  marks: [
    Plot.dot(cadastrePoints.features, {
      x: d => d.geometry.coordinates[0],
      y: d => d.geometry.coordinates[1],
      r: 2,
      fill: "#e67e22",
      fillOpacity: 0.5,
      tip: true
    })
  ]
})
```

---

## Density Map (Hexbin)

Aggregate many points into hexagonal density bins using `Plot.hexbin`:

```js
Plot.plot({
  title: "Point density - Lausanne Cadastre (1888)",
  width: 640,
  height: 500,
  projection: {type: "mercator", domain: cadastrePoints},
  marks: [
    Plot.hexgrid({strokeOpacity: 0.1}),
    Plot.dot(
      cadastrePoints.features,
      Plot.hexbin(
        {r: "count", fill: "count"},
        {
          x: d => d.geometry.coordinates[0],
          y: d => d.geometry.coordinates[1],
          binWidth: 20
        }
      )
    )
  ],
  color: {scheme: "YlOrRd", legend: true, label: "Count"}
})
```

---

## Combining Plot Map with Inputs

React to user inputs to show a subset of the data. Here a slider controls how many points are highlighted:

```js
const highlightN = view(Inputs.range([0, cadastrePoints.features.length], {
  label: "Highlight first N points",
  step: 100,
  value: 500
}))
```

```js
Plot.plot({
  title: `Lausanne cadastre - first ${highlightN} points highlighted`,
  width: 640,
  height: 500,
  projection: {type: "mercator", domain: cadastrePoints},
  marks: [
    // All points in light gray
    Plot.dot(cadastrePoints.features, {
      x: d => d.geometry.coordinates[0],
      y: d => d.geometry.coordinates[1],
      r: 2, fill: "#ddd", fillOpacity: 0.4
    }),
    // First N points highlighted in red
    Plot.dot(cadastrePoints.features.slice(0, highlightN), {
      x: d => d.geometry.coordinates[0],
      y: d => d.geometry.coordinates[1],
      r: 3, fill: "#e74c3c", fillOpacity: 0.8
    })
  ]
})
```

---

## When to Use Plot vs Leaflet

| Criterion | Observable Plot | Leaflet |
|-----------|----------------|---------|
| Base map tiles | No | Yes |
| Pan & zoom | No | Yes |
| Document flow integration | Natural | Requires fixed-height div |
| Reactive inputs | Natural | Requires manual layer management |
| Static/publication maps | Ideal | Overkill |
| Choropleth / analysis | Ideal | Possible but verbose |
| Historical raster overlays | No | Yes (WMTS) |
