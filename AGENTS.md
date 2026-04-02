# AGENTS.md

This file provides guidance to coding agents when working with code in this repository.

## Project Context

This is a template for student projects in the course "Histoire Urbaine Digitale" at EPFL. Students use it to build interactive websites visualizing historical/geographic data (primarily for Lausanne, Switzerland, but also other places). The deliverable is a published Observable Framework site with data visualizations.

## Commands

```bash
npm run dev       # Start local preview server at http://localhost:3000
npm run build     # Build static site to ./dist
npm run deploy    # Deploy to Observable Cloud
npm run clean     # Clear data loader cache (src/.observablehq/cache)
```

Python dependencies (for data loader scripts) are in `requirements.txt`. Use a `.venv/` virtual environment.

## Architecture

This is an **Observable Framework** app. Key concepts:

- **Pages**: Markdown files in `src/` become pages automatically. JavaScript code blocks are reactive cells.
- **Routing**: File-based — `src/my-page.md` → `/my-page`
- **Navigation**: Sidebar pages/sections are declared in `observablehq.config.js`; new pages must be added there to appear in the nav.
- **Data loaders**: Files in `src/data/` with extensions like `.geojson.js` or `.geojson.py` are executed at build/preview time and their stdout is cached. Access them in pages via `FileAttachment("filename.geojson")`.
- **Reactivity**: Observable's reactive cells automatically re-run when their dependencies change (e.g., a search input filters both a map and a table simultaneously).

## Observable Framework Pitfalls

These are verified gotchas discovered while building the example pages in `src/examples/`. Ignore them at your peril.

### `view()` not `viewof`

Observable Framework **markdown pages** use the `view()` function — not the `viewof` keyword from Observable notebooks.

```js
// WRONG — causes SyntaxError in Framework pages
viewof city = Inputs.select(["Lausanne", "Genève"])

// CORRECT
const city = view(Inputs.select(["Lausanne", "Genève"]))
```

### Cell display rule: keep chart cells as single expressions

Observable Framework auto-displays the **return value** of a `js` cell only when the cell is a **single expression**. When a cell contains `const` declarations followed by an expression, the expression's display value may be silently dropped.

```js
// BAD — the chart may not render
const data = [...];
Plot.plot({ marks: [...] })

// GOOD — data in its own cell
const data = [...];
```
```js
// GOOD — chart cell is a pure expression
Plot.plot({ marks: [Plot.barY(data, ...)] })
```

```js
// ALSO GOOD — use display() to force output alongside declarations
const data = [...];
display(Plot.plot({ marks: [...] }))
```

The same applies to `Inputs.table()` and any other display call: put it in its own single-expression cell, or wrap it in `display()`.

### Duplicate `js` code blocks cause "defined more than once"

Every ` ```js ` block executes. Defining the same variable in two blocks on the same page causes a runtime error. To show code as illustration without running it, use a different language tag:

```
```javascript   ← shown as syntax-highlighted code, NOT executed
const x = 1;
```
```js           ← executed
const x = 1;
```
```

### `html` code blocks render HTML — they don't display code

` ```html ` blocks in Observable Framework **insert HTML into the DOM**, they do not display the code. To show HTML source as a code snippet, use ` ```markup ` or any other non-special tag.

### Nested markdown fences: use 4-backtick outer fence

To show a ` ``` ` fence inside a Markdown code block, use a 4-backtick outer fence. Backslash-escaping (`\`\`\``) shows the backslash literally in the output.

````
````markdown
# Example page

```js
Plot.plot({...})
```
````
````

### Observable Plot projection names

Plot projection names differ from D3's raw names. `"natural-earth"` is **not** valid; use `"equal-earth"` instead.

Valid named projections include: `"equal-earth"`, `"mercator"`, `"orthographic"`, `"albers-usa"`, `"stereographic"`, `"transverse-mercator"`.

### Reactive Leaflet maps: always call `invalidation.then(() => map.remove())`

Without cleanup, each time a cell re-runs (because a dependency changed) it creates a new Leaflet map on top of the old one. The canonical pattern:

```js
const div = display(document.createElement("div"));
div.style = "height: 400px;";
const map = L.map(div).setView([46.52, 6.63], 13);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {...}).addTo(map);
invalidation.then(() => map.remove()); // ← always include this
```

### Reactive tile layer swapping: two-cell pattern

To reactively swap a historical tile layer while keeping the same base map, use **two separate cells**: one that creates the map (no dependency on the reactive input, runs only once), and one that adds the tile layer (depends on the input, re-runs on change):

```js
// Cell 1 — creates map ONCE (no dependency on selectedLayer)
const div = display(document.createElement("div"));
div.style = "height: 500px;";
const map = L.map(div).setView([46.55, 6.63], 12);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {...}).addTo(map);
invalidation.then(() => map.remove());
```

```js
// Cell 2 — re-runs when selectedLayer changes; removes old tile layer via invalidation
const tileLayer = L.tileLayer(wmtsUrl(selectedLayer.name), {...}).addTo(map);
invalidation.then(() => map.removeLayer(tileLayer));
```

## Data Patterns

**Coordinate systems**: Historical Swiss data uses EPSG:2056 (CH1903+/LV95). Transform to WGS84 for web maps using `proj4` in JS loaders or `pyproj`/`geopandas` in Python loaders. See `src/data/cadastre-berney.geojson.js` for the JS pattern.

**Typical data flow**:
1. Raw source files (`.zip` shapefiles, `.csv`, `.geojson`) go in `src/data/`
2. A loader script (`.js` or `.py`) transforms/fetches and outputs JSON/GeoJSON to stdout
3. Pages load the result: `const data = FileAttachment("file.geojson").json()`

**Join pattern for cadastre data**: When GeoJSON points and a CSV register share a `merge_id`, one register entry can map to multiple geometry points. Build a lookup map (`merge_id → [layers]`) to update map features reactively when the register is filtered. See `src/examples/10-lausanne-cadastre-renove.md` for the full implementation.

**Always verify CSV column names from the actual header row.** Do not assume column names from secondary sources (exploration summaries, GeoJSON properties, etc.). For example, the 1888 cadastre register (`lausanne-1888-cadastre-renove-registre-20250410.csv`) uses `ares` (not `area`) for parcel size.

## Mapping

Two mapping approaches are used:

- **Leaflet** (`src/components/leaflet-heat.js` bundles the heatmap plugin): better for interactive maps with basemap switching, layer control, and user interaction
- **Observable Plot** with d3-geo: better for static/analytical maps embedded in a document flow

### EPFL Time Machine GeoServer (WMTS)

Historical Lausanne maps are served as WMTS raster tiles by the EPFL Time Machine GeoServer at `geo-timemachine.epfl.ch`. Layer names follow the pattern `TimeMachine:{layerName}`. The Leaflet tile URL template is:

```
https://geo-timemachine.epfl.ch/geoserver/gwc/service/wmts/rest/TimeMachine:{layerName}/{style}/{TileMatrixSet}/{TileMatrixSet}:{z}/{y}/{x}?format=image/png
```

Pass `style: "raster"` and `TileMatrixSet: "EPSG:900913x2"` as Leaflet options. All 31 available Lausanne layers are listed and demonstrated in `src/examples/06-maps-historical.md`.

## Adding a New Page

1. Create `src/my-page.md`
2. Add it to the `pages` array in `observablehq.config.js`
3. If it needs new data, add a loader in `src/data/`

## Page Frontmatter

```yaml
---
title: Page Title
toc: false   # recommended for map-heavy pages
---
```
