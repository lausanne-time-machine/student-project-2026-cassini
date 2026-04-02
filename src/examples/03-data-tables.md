---
title: Loading Data & Tables
---

# Loading Data & Tables

Observable Framework makes it easy to load and display data. The main mechanism is `FileAttachment`, which loads files from your `src/data/` folder.

---

## FileAttachment

Use `FileAttachment("path/to/file")` to load a data file. The path is relative to the `src/` directory.

### Loading a CSV

The `{typed: true}` option automatically converts numeric columns to numbers.

```javascript
const registre = FileAttachment("../data/lausanne-1888-cadastre-renove-registre-20250410.csv").csv({typed: true})
```

```js
const registre = FileAttachment("../data/lausanne-1888-cadastre-renove-registre-20250410.csv").csv({typed: true})
```

The `registre` object is an array of row objects. It has **${registre.length.toLocaleString()}** rows.

### Other formats

```javascript
const geojson = FileAttachment("../data/myfile.geojson").json()
const config  = FileAttachment("../data/config.json").json()
```

Other supported methods: `.tsv()`, `.text()`, `.arrayBuffer()`, `.stream()`.

---

## Displaying a Table

`Inputs.table` renders a sortable, paginated table:

```javascript
Inputs.table(registre.slice(0, 200))
```

```js
Inputs.table(registre.slice(0, 200))
```

<div class="tip">

Use `.slice(0, N)` to display only the first N rows of large datasets - rendering thousands of rows at once is slow.

</div>

---

## Search & Filter

`Inputs.search` filters rows based on a text query across all columns. Combine it with `Inputs.table` for a live-filtering table:

```javascript
const query = view(Inputs.search(registre, {placeholder: "Search owners, classes…"}))
```

```js
const query = view(Inputs.search(registre, {placeholder: "Search owners, classes…"}))
```

```js
Inputs.table(query)
```

**${query.length.toLocaleString()}** rows match your search.

---

## Computing Statistics

Use [D3](https://d3js.org/) for aggregations - it is available globally in Observable Framework.

This dataset contains land register entries for Lausanne in 1888. Use `d3.group` to count distinct categories:

```javascript
const stats = {
  total: registre.length,
  owners: d3.group(registre, d => d.owner).size,
  useTypes: d3.group(registre, d => d.use).size,
  folios: d3.group(registre, d => d.folio).size,
};
```

```js
const stats = {
  total: registre.length,
  owners: d3.group(registre, d => d.owner).size,
  useTypes: d3.group(registre, d => d.use).size,
  folios: d3.group(registre, d => d.folio).size,
};
```

<div class="grid grid-cols-4">
  <div class="card">
    <h3>Total entries</h3>
    <p style="font-size: 2em; margin: 0;">${stats.total.toLocaleString()}</p>
  </div>
  <div class="card">
    <h3>Distinct owners</h3>
    <p style="font-size: 2em; margin: 0;">${stats.owners.toLocaleString()}</p>
  </div>
  <div class="card">
    <h3>Use types</h3>
    <p style="font-size: 2em; margin: 0;">${stats.useTypes.toLocaleString()}</p>
  </div>
  <div class="card">
    <h3>Folios</h3>
    <p style="font-size: 2em; margin: 0;">${stats.folios.toLocaleString()}</p>
  </div>
</div>

---

## Grouping & Counting

Use `d3.rollup` to aggregate by category. Here we count entries by land use type (`use` column):

```javascript
// Count entries by use type, sorted descending
const useCounts = Array.from(
  d3.rollup(registre, rows => rows.length, d => d.use),
  ([use, count]) => ({use, count})
).sort((a, b) => b.count - a.count);
```

```js
// Data definition cell - exports `useCounts` to other cells
const useCounts = Array.from(
  d3.rollup(registre, rows => rows.length, d => d.use),
  ([use, count]) => ({use, count})
).sort((a, b) => b.count - a.count);
```

```js
// Display cell - single expression so Observable Framework renders it
Inputs.table(useCounts, {columns: ["use", "count"]})
```

---

## FileAttachment Reference

| Method | Returns | Use for |
|--------|---------|---------|
| `.csv({typed})` | Array of objects | Tabular data |
| `.tsv({typed})` | Array of objects | Tab-separated |
| `.json()` | Object or array | JSON / GeoJSON |
| `.text()` | String | Plain text |
| `.arrayBuffer()` | ArrayBuffer | Binary files |

<div class="note">

**Data loaders**: For files that need preprocessing (coordinate transforms, shapefile parsing, etc.), use a data loader script in `src/data/`. See the [Processing Data Server-Side](./08-data-loaders) example.

</div>
