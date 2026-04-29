---
title: Venice 1740 Land Register
toc: false
---
# Venice 1740 Land Register

```js
const venice1740LandRegisterGeoJson = FileAttachment("../data/venice-1740-landregister.geojson").json()
```

```js
const div = display(document.createElement("div"));
div.style = "height: 600px;";

const map = L.map(div)
  .setView([45.438043, 12.335924], 14);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
})
  .addTo(map);

invalidation.then(() => map.remove());
```

```js
var geojsonMarkerOptions = {
    radius: 1,
    fillColor: "#FFFF00",
    color: "#FFFF00",
    weight: 0,
    opacity: 0,
    fillOpacity: 1
};

L.geoJSON(venice1740LandRegisterGeoJson, {
  pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, geojsonMarkerOptions);
  }
}).addTo(map);
```
