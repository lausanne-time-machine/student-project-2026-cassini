---
title: SHS Métiers
toc: false
sidebar: false
theme: dark
---

<style>
  /* 1. LA BARRE DE NAVIGATION SUPÉRIEURE */
  .top-navbar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background-color: #1e3a8a;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    padding: 15px 0;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    font-family: system-ui, sans-serif;
  }
  
  .top-navbar a {
    color: white;
    text-decoration: none;
    font-size: 1.1rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: opacity 0.2s;
  }
  
  .top-navbar a:hover { opacity: 0.7; }
  
  .content-spacer { margin-top: 52px; } 
  .leaflet-container { z-index: 1 !important; }

  /* 2. CARTE IMMERSIVE (Plein écran) */
  .full-width-map {
    width: 100vw;
    position: relative;
    left: 50%;
    right: 50%;
    margin-left: -50vw;
    margin-right: -50vw;
    margin-bottom: 2rem;
    margin-top: 0px !important;
  }

  /* 3. MENU FLOTTANT HAUT (Sélecteur de métier) */
  .floating-menu-wrapper {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 999;
    background-color: rgba(10, 15, 30, 0.85);
    border: 2px solid #2563eb;
    padding: 10px 18px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.7);
  }

  .floating-menu-wrapper form {
    margin: 0 !important;
    display: flex;
    align-items: center;
    gap: 12px;
    color: #93c5fd !important;
    font-weight: 600;
  }

  .floating-menu-wrapper select {
    background-color: #000000 !important;
    color: #ffffff !important;
    border: 1px solid #1e40af !important;
    border-radius: 4px;
    padding: 5px 12px;
    cursor: pointer;
  }

  /* 4. MENU FLOTTANT BAS (Slider Temporel) */
  .floating-slider-wrapper {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 999;
    background-color: rgba(10, 15, 30, 0.85);
    border: 2px solid #2563eb;
    padding: 15px 30px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.7);
    width: 80%; /* Largeur du menu en bas */
    max-width: 600px;
  }

  /* Mise en page interne du slider Observable */
  .floating-slider-wrapper form {
    margin: 0 !important;
    display: flex;
    flex-direction: column;
    gap: 8px;
    color: #93c5fd !important;
    font-weight: 600;
    font-size: 1.1rem;
    text-align: center;
  }

  /* Design personnalisé de la barre du slider avec DÉGRADÉ */
  .floating-slider-wrapper input[type=range] {
    -webkit-appearance: none;
    width: 100%;
    background: linear-gradient(to right, #1e3a8a, #3b82f6, #00f6ff); /* Le dégradé bleu -> cyan */
    height: 8px;
    border-radius: 4px;
    outline: none;
    margin-top: 10px;
  }

  /* Design du bouton qu'on attrape (le 'thumb') */
  .floating-slider-wrapper input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #ffffff;
    border: 3px solid #00f6ff;
    cursor: pointer;
    box-shadow: 0 0 10px rgba(0, 246, 255, 0.8); /* Halo lumineux */
  }

  /* Style de la boîte qui affiche l'année (1940, 1930...) */
  .floating-slider-wrapper input[type=number] {
    background: transparent;
    color: #ffffff;
    border: none;
    font-size: 1.3rem;
    font-weight: bold;
    text-align: center;
    pointer-events: none; /* Empêche de cliquer dessus */
  }
</style>

<div class="top-navbar">
  <a href="#"><span>ℹ️</span> Informations</a>
  <a href="#"><span>🗺️</span> Heatmap</a>
  <a href="#"><span>📖</span> Encyclopédie</a>
  <a href="#"><span>📊</span> Statistiques</a>
</div>

<div class="content-spacer"></div>

<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin=""/>

```js
import L from "npm:leaflet";
if (L === undefined) console.error("L is undefined");
import "./components/leaflet-heat.js";
```

```js
const data = await FileAttachment("./data/metiers.json").json();
const metiersUniques = [...new Set(data.map(d => d.metier))].sort();
const anneesUniques = [...new Set(data.map(d => d.annee))].sort((a, b) => a - b);
```

<!-- ANCRE COMMUNE : TOUT CE QUI EST ICI SERA SUPERPOSÉ -->
<div style="position: relative; width: 100%;">

  <!-- 1. Le menu Haut -->
  <div class="floating-menu-wrapper">

```js
const selectedMetier = view(Inputs.select(metiersUniques, {label: "Choix du métier :", value: "Agriculteurs"}));
```

  </div>

  <!-- 2. Le slider Bas -->
  <div class="floating-slider-wrapper">

```js
const selectedAnneeIndex = view(Inputs.range([0, anneesUniques.length - 1], {
    step: 1, 
    value: anneesUniques.length - 1, 
    format: i => anneesUniques[i], 
}));
```

  </div>

  <!-- 3. La Carte (En dessous des menus) -->
```js
// Cellule 1 : La carte fixe (SANS ZOOM POSSIBLE)
const div = display(document.createElement("div"));
div.className = "full-width-map";
// La carte prend 100% de la hauteur de l'écran moins la barre bleue (52px)
div.style.height = "calc(100vh - 52px)";

const map = L.map(div, {
    zoomControl: false,       
    scrollWheelZoom: false,   
    doubleClickZoom: false,   
    boxZoom: false,           
    touchZoom: false,
    zoomSnap: 0.5             // Autorise un zoom "à virgule" pour un réglage fin
}).setView([46.55, 6.6], 10.5); // Recentré et dézoomé d'un demi-cran (9.5 au lieu de 10)

L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; OpenStreetMap, &copy; CartoDB'
}).addTo(map);

invalidation.then(() => map.remove());
```

</div>

```js
// Calcul des filtres et mise à jour de la Heatmap
const selectedAnnee = anneesUniques[selectedAnneeIndex];
const filteredData = data.filter(d => d.metier === selectedMetier && d.annee === selectedAnnee);

// Cellule 2 : Heatmap réactive et calibrée
const counts = {};
filteredData.forEach(d => {
    const key = `${d.lat},${d.lng}`;
    if (!counts[key]) counts[key] = { lat: d.lat, lng: d.lng, count: 0 };
    counts[key].count += 1;
});
const aggregatedData = Object.values(counts);

const maxPersonnes = Math.max(1, ...aggregatedData.map(d => d.count));
const maxIntensite = Math.sqrt(maxPersonnes);
const heatPoints = aggregatedData.map(d => [d.lat, d.lng, Math.sqrt(d.count)]); 

const heatLayer = L.heatLayer(heatPoints, {
    radius: 25, 
    blur: 15, 
    maxZoom: 14,
    max: maxIntensite * 0.8, 
    minOpacity: 0.4, 
    gradient: {0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red'}
}).addTo(map);

invalidation.then(() => map.removeLayer(heatLayer));
```

---

<div class="card">
  <h3>🔍 Données détaillées (Année ${selectedAnnee})</h3>
  <p><i>Ce tableau liste toutes les entrées correspondantes trouvées dans les archives pour le métier et l'année sélectionnés. Utilisez la colonne <b>fichier</b> pour retrouver la page d'origine de l'annuaire.</i></p>

```js
display(Inputs.table(filteredData))
```

```js
const communesManquantesData = await FileAttachment("/data/no_coords_detector.json").json();
display(Inputs.table(communesManquantesData));
```

</div>