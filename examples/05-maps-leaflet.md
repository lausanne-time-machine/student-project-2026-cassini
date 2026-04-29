---
title: Interactive Maps with Leaflet
toc: false
---

# Interactive Maps with Leaflet

[Leaflet](https://leafletjs.com/) is a widely used JavaScript library for interactive web maps. Observable Framework includes it as a built-in - no import needed.

---

## Basic Map with OpenStreetMap

The minimal Leaflet setup: create a `<div>` container, initialize the map, and add a tile layer.

```js
const div = display(document.createElement("div"));
div.style = "height: 400px; margin: 1em 0;";

const map = L.map(div).setView([46.519653, 6.632273], 13);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Clean up the map when this cell is invalidated (re-run)
invalidation.then(() => map.remove());
```

---

## Adding Markers and Popups

```js
{
  const div = display(document.createElement("div"));
  div.style = "height: 400px; margin: 1em 0;";

  const map = L.map(div).setView([46.519653, 6.632273], 14);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  // Simple marker with popup
  L.marker([46.519653, 6.632273])
    .addTo(map)
    .bindPopup("<b>Lausanne</b><br>Place de la Palud")
    .openPopup();

  // Circle marker
  L.circleMarker([46.523, 6.628], {
    radius: 10,
    fillColor: "#e74c3c",
    color: "#c0392b",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.8
  })
    .addTo(map)
    .bindPopup("Cathédrale de Lausanne");

  invalidation.then(() => map.remove());
}
```

---

## GeoJSON Layer

Load a GeoJSON file and render it on the map with custom styles:

```js
{
  const div = display(document.createElement("div"));
  div.style = "height: 450px; margin: 1em 0;";

  const map = L.map(div).setView([46.53, 6.63], 12);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png", {
    attribution: '&copy; OpenStreetMap, &copy; CartoDB'
  }).addTo(map);

  // Load the GeoJSON data
  const geojson = await FileAttachment("../data/lausanne-1888-cadastre-renove-points-20250409.geojson").json();

  // Render as circle markers with custom style
  L.geoJSON(geojson, {
    pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
      radius: 3,
      fillColor: "#e67e22",
      color: "#d35400",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.6
    }),
    onEachFeature: (feature, layer) => {
      if (feature.properties) {
        layer.bindPopup(
          Object.entries(feature.properties)
            .map(([k, v]) => `<b>${k}:</b> ${v}`)
            .join("<br>")
        );
      }
    }
  }).addTo(map);

  invalidation.then(() => map.remove());
}
```

---

## Layer Control (Multiple Base Layers)

Offer the user a choice of base maps using `L.control.layers`:

```js
{
  const div = display(document.createElement("div"));
  div.style = "height: 400px; margin: 1em 0;";

  const map = L.map(div).setView([46.519653, 6.632273], 13);

  // Define base layers
  const osmLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  const cartoLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png", {
    attribution: '&copy; OpenStreetMap, &copy; CartoDB'
  });

  const satelliteLayer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: '&copy; Esri'
  });

  // Add layer control
  L.control.layers(
    {"OpenStreetMap": osmLayer, "CartoDB Light": cartoLayer, "Satellite": satelliteLayer},
    {},  // overlays (none here)
    {collapsed: false}
  ).addTo(map);

  invalidation.then(() => map.remove());
}
```

---

## Overlay Layers

Add optional overlays (e.g., markers, GeoJSON) that the user can toggle independently of the base layer:

```js
{
  const div = display(document.createElement("div"));
  div.style = "height: 400px; margin: 1em 0;";

  const map = L.map(div).setView([46.519653, 6.632273], 13);

  const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  // Create overlay groups
  const markersGroup = L.layerGroup([
    L.marker([46.519653, 6.632273]).bindPopup("Lausanne"),
    L.marker([46.523, 6.628]).bindPopup("Cathédrale"),
    L.marker([46.516, 6.635]).bindPopup("Gare CFF"),
  ]).addTo(map);

  const circlesGroup = L.layerGroup([
    L.circle([46.519653, 6.632273], {radius: 500, color: "blue", fillOpacity: 0.1}).addTo(map)
  ]).addTo(map);

  // Layer control with base layers + overlays
  L.control.layers(
    {"OpenStreetMap": osm},
    {"Markers": markersGroup, "500m radius": circlesGroup}
  ).addTo(map);

  invalidation.then(() => map.remove());
}
```

---

## Leaflet Quick Reference

| Method | Description |
|--------|-------------|
| `L.map(el).setView([lat, lng], zoom)` | Initialize map |
| `L.tileLayer(url, options)` | Raster tile layer |
| `L.marker([lat, lng])` | Pin marker |
| `L.circleMarker([lat, lng], options)` | Circle marker |
| `L.circle([lat, lng], {radius})` | Circle in meters |
| `L.geoJSON(data, options)` | GeoJSON layer |
| `L.layerGroup([...layers])` | Group layers |
| `L.control.layers(baseMaps, overlays)` | Layer switcher |
| `.addTo(map)` | Add to map |
| `.bindPopup(html)` | Attach popup |
| `invalidation.then(() => map.remove())` | Clean up |

Full documentation: [leafletjs.com/reference.html](https://leafletjs.com/reference.html)
