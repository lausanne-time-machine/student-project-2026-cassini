---
title: Data Loaders
---

# Data Loaders

**Data loaders** are scripts in `src/data/` that run at build/preview time and write processed data to standard output. Observable Framework caches the output - the browser never runs the loader, it just fetches the result.

Use a data loader when your data needs:
- Coordinate transformation (e.g., Swiss LV95 → WGS84)
- Shapefile or binary format parsing
- Expensive computation or API calls you want cached
- Python libraries (geopandas, pandas, etc.)

---

## How It Works

```
src/data/
  myfile.geojson.js    ← loader script (Node.js)
  myfile.geojson.py    ← loader script (Python)
  mydata.json.js       ← loader script
```

The file extension **before** the last extension determines the output format. A file named `foo.geojson.js` produces `foo.geojson`. You access it in a page with:

```javascript
const data = FileAttachment("data/foo.geojson").json()
```

Observable Framework runs the loader and caches the output in `src/.observablehq/cache/`. Clear the cache with `npm run clean`.

---

## JavaScript Loader Example

This project's `src/data/cadastre-berney.geojson.js` transforms a Swiss shapefile to WGS84 GeoJSON:

```javascript
// src/data/cadastre-berney.geojson.js
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import shpjs from "shpjs";
import proj4 from "proj4";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Define coordinate systems
proj4.defs("EPSG:2056",
  "+proj=somerc +lat_0=46.9524055555556 +lon_0=7.43958333333333 " +
  "+k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel " +
  "+towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs +type=crs"
);

// Read and parse the shapefile ZIP
const zipBuffer = readFileSync(resolve(__dirname, "Berney_merge_legende_v6-3bis-save.zip"));
const geojson = await shpjs(zipBuffer);

// Transform coordinates from CH1903+/LV95 (EPSG:2056) to WGS84 (EPSG:4326)
function transformCoords(coords) {
  if (typeof coords[0] === "number") {
    return proj4("EPSG:2056", "EPSG:4326", coords);
  }
  return coords.map(transformCoords);
}

geojson.features.forEach(feature => {
  feature.geometry.coordinates = transformCoords(feature.geometry.coordinates);
});

// Write the result to stdout - Observable Framework captures this
process.stdout.write(JSON.stringify(geojson));
```

**Key points:**
- Read files using Node.js `fs` module with absolute paths
- Use `process.stdout.write(JSON.stringify(...))` to emit the result
- Any npm package in `package.json` is available

---

## Python Loader Example

This project's `src/data/venice-1740-landregister.geojson.py` fetches remote GeoJSON and reprojects it:

```python
# src/data/venice-1740-landregister.geojson.py
import sys
import json
import geopandas as gpd

# Load GeoJSON from a remote URL
gdf = gpd.read_file(
    "https://raw.githubusercontent.com/edhlab/venice-atlas/main/data/venice_1740_landregister.geojson"
)

# Keep only essential properties
gdf = gdf[["uid", "geometry"]]

# Reproject from UTM zone 33N (EPSG:32633) to WGS84 (EPSG:4326)
gdf = gdf.to_crs(epsg=4326)

# Write GeoJSON to stdout
sys.stdout.write(gdf.to_json())
```

**Key points:**
- Python dependencies go in `requirements.txt`; use a `.venv/` virtual environment
- Use `sys.stdout.write(...)` to emit the result
- `geopandas`, `pandas`, `pyproj` are all available after `pip install -r requirements.txt`

---

## Creating a New JavaScript Loader

**Step 1** - Add a file in `src/data/` with a double extension:

```bash
# For a GeoJSON output:
src/data/my-dataset.geojson.js

# For a JSON output:
src/data/my-stats.json.js

# For a CSV output:
src/data/my-table.csv.js
```

**Step 2** - Write the loader script. Minimal example:

```javascript
// src/data/swiss-cities.json.js
const cities = [
  {city: "Lausanne", lat: 46.519653, lon: 6.632273, population: 139111},
  {city: "Genève",   lat: 46.204391, lon: 6.143158, population: 201818},
];

process.stdout.write(JSON.stringify(cities));
```

**Step 3** - Use it in a page:

```javascript
const cities = FileAttachment("data/swiss-cities.json").json()
```

---

## Creating a New Python Loader

**Step 1** - Make sure your `.venv/` is active and dependencies are installed:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

**Step 2** - Add a `.py` loader in `src/data/`:

```python
# src/data/my-data.geojson.py
import sys
import json
import geopandas as gpd

gdf = gpd.read_file("...")
gdf = gdf.to_crs(epsg=4326)
sys.stdout.write(gdf.to_json())
```

**Step 3** - Use it in a page:

```javascript
const data = FileAttachment("data/my-data.geojson").json()
```

---

## Caching

Loader output is cached in `src/.observablehq/cache/`. The cache is invalidated when the loader file changes. To force a re-run:

```bash
npm run clean   # deletes the cache
npm run dev     # re-runs all loaders on next access
```

<div class="tip">

During development, loaders only re-run when their source file changes. If your loader reads from an external URL or database that changes, add a comment with the current date to force a cache bust.

</div>

---

## JavaScript vs Python - Which to Use?

| Criterion | JavaScript | Python |
|-----------|------------|--------|
| Shapefile parsing | `shpjs` (good) | `geopandas` (great) |
| Coordinate transform | `proj4` | `pyproj` / `geopandas` |
| CSV / JSON manipulation | `d3`, built-in | `pandas` |
| HTTP requests | `fetch` | `requests`, `httpx` |
| Team familiarity | - | - |
| Setup | Zero (Node built-in) | Needs `.venv` + `requirements.txt` |

For geospatial work, Python with `geopandas` is often simpler. For JSON/CSV transforms, JavaScript is lighter.
