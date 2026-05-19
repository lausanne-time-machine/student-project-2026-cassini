---
title: SHS Métiers
toc: false
---

<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin=""/>

```js
import L from "npm:leaflet";
if (L === undefined) console.error("L is undefined");
import "./components/leaflet-heat.js";
```

# Évolution des métiers (1940)

```js
// 1. LE DÉCLENCHEUR : C'est cette ligne qui oblige Observable à lancer ton script metiers.json.js !
const data = FileAttachment("./data/metiers.json").json();
```

```js
// 2. On extrait la liste unique de tous les métiers trouvés dans tes 323 fichiers
const metiersUniques = [...new Set(data.map(d => d.metier))].sort();
```

<div class="grid grid-cols-2">
  <div class="card">
    ${view(Inputs.select(metiersUniques, {label: "Choix du métier"}))}
  </div>
  <div class="card">
    <p><i>Années (1900-1940) à venir... Actuellement filtré sur 1940.</i></p>
  </div>
</div>

```js
// On récupère le choix de l'utilisateur
const selectedMetier = view(Inputs.select(metiersUniques, {label: "Choix du métier", value: "Agriculteurs"}));
```

```js
// 3. Filtrage : on ne garde que les personnes du métier sélectionné
const filteredData = data.filter(d => d.metier === selectedMetier);
```

```js
// 4. La Carte OpenStreetMap
const div = display(document.createElement("div"));
div.style = "height: 600px; border-radius: 8px;";
const map = L.map(div).setView([46.6, 6.5], 10);

// 👇 C'est ici qu'il faut corriger l'URL !
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

invalidation.then(() => map.remove());
```

```js
// 5. La Heatmap
const heatPoints = filteredData.map(d => [d.lat, d.lng, 1]); 

const heatLayer = L.heatLayer(heatPoints, {
    radius: 20,
    blur: 15,
    maxZoom: 14
}).addTo(map);

invalidation.then(() => map.removeLayer(heatLayer));
```

### Données brutes de la carte actuelle
```js
display(Inputs.table(filteredData))
```