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
  <a href="#infos"><span>ℹ️</span> Informations</a>
  <a href="#heatmap"><span>🗺️</span> Heatmap</a>
  <a href="#data"><span>📖</span> Données</a>
  <a href="#stats"><span>📊</span> Statistiques</a>
</div>

<div class="content-spacer"></div>
<h1 id="infos" style="text-align: center; max-width: 100%">Lausanne Time Machine - Métiers</h1>
<br>
<h2>Notre project</h2>
<p>

Les annuaires vaudois constituent une source historique riche permettant d’observer la société à travers les métiers exercés, les communes et l’évolution des activités professionnelles au fil du temps.

Ce projet vise à explorer ces données entre 1901 et 1940 afin de mieux comprendre l’organisation socio-professionnelle du canton de Vaud, et plus particulièrement de la région lausannoise.
</p>
<h2>Question de recherche</h2>
<p>
Notre travail s’articule autour de la question suivante :

Comment les métiers et leur répartition géographique évoluent-ils dans le canton de Vaud entre 1920 et 1940 ?
</p>
<h2>Méthodologie</h2>
<p>

Les données proviennent d’annuaires historiques numérisés contenant :
</p>
<ul>
  <li>Noms</li>
  <li>Prefession</li>
  <li>Adresses et commune</li>
</ul>
<p>
L’objectif était de transformer ces documents historiques en données exploitables.
</p>
<h2>OCR et reconnaissance du texte</h2>
<p>
Nous avons utilisé des outils d’OCR (reconnaissance optique de caractères) afin d’extraire le texte depuis les scans des annuaires.
</p>

<h3>Difficultés rencontrées</h3>
<ul>
<li>ponctuation instable</li>
<li>qualité variable des scans</li>
<li>mise en page complexe</li>
<li>erreurs sur les caractères anciens</li>
<li>détection difficile du gras et des colonnes</li>
</ul>

<h2>Utilisation des LLM</h2>
Après l’OCR, nous avons utilisé des modèles de langage (LLM) pour :
<ul>
<li>structurer les données</li>
<li>identifier les professions</li>
<li>séparer les informations importantes</li>
<li>convertir automatiquement les pages en format CSV</li>
</ul>

<h2>Exemple de structure extraite</h2>
<table>
<thead>
<th>Nom</th>
<th>Commune</th>
<th>Profession</th>
</thead>
<tbody>
<tr>
<td>Perey Georges</td>
<td>Vufflens-le-Chateau</td>
<td>Syndic</td></tr>
<tr>
<td>Delapierre Robert</td>
<td>Vufflens-le-Chateau</td>
<td>Secrétaire</td></tr>
<tr>
<td>Duruz Ernest</td>
<td>Vufflens-le-Chateau</td>
<td>Municipaux</td></tr>
<tr>
<td>Lassueur Robert</td>
<td>Vugelles-la-Mothe</td>
<td>Syndic</td></tr>

<tr>
<td>Marchand Maurice</td>
<td>Vugelles-la-Mothe</td>
<td>Apiculteurs</td></tr>
<tr>
<td>Rubattel Lucien</td>
<td>Vuibroye</td>
<td>Syndic</td></tr>
</tbody>
</table>

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
div.id="heatmap";
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

<div class="card" id="data">
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

<div id="stats">
<h2>📊 Statistiques</h2>

<p>
Cette section présente différentes analyses réalisées à partir des données historiques extraites des annuaires vaudois.
Les graphiques permettent d’observer l’évolution des métiers, leur importance relative ainsi que leur répartition dans le temps.
</p>

---

## Top 10 des métiers les plus représentés

```js
const topMetiers = Object.entries(
  data.reduce((acc, d) => {
    acc[d.metier] = (acc[d.metier] || 0) + 1;
    return acc;
  }, {})
)
.sort((a, b) => b[1] - a[1])
.slice(1, 11)
.map(([metier, total]) => ({ metier, total }));

display(Plot.plot({
  height: 420,
  marginLeft: 180,
  x: {
    label: "Nombre d'entrées"
  },
  y: {
    label: null
  },
  marks: [
    Plot.barX(topMetiers, {
      x: "total",
      y: "metier",
      sort: { y: "x", reverse: true }
    }),
    Plot.text(topMetiers, {
      x: "total",
      y: "metier",
      text: d => d.total,
      dx: 15
    })
  ]
}))
```

---

## Évolution du métier sélectionné dans le temps
---
</p>Remonter <a href="#heatmap">ici</a> pour change de metier</p>
---

```js
const evolutionMetier = anneesUniques.map(annee => ({
  annee,
  total: data.filter(d => d.metier === selectedMetier && d.annee === annee).length
}));

display(Plot.plot({
  height: 400,
  x: {
    label: "Année"
  },
  y: {
    label: "Nombre de personnes"
  },
  marks: [
    Plot.line(evolutionMetier, {
      x: "annee",
      y: "total"
    }),
    Plot.dot(evolutionMetier, {
      x: "annee",
      y: "total",
      tip: true
    })
  ]
}))
```

---

## Répartition des métiers par année

```js
const repartitionAnnuelle = anneesUniques.map(annee => ({
  annee,
  total: data.filter(d => d.annee === annee).length
}));

display(Plot.plot({
  height: 400,
  x: {
    label: "Année"
  },
  y: {
    label: "Nombre total d'entrées"
  },
  marks: [
    Plot.areaY(repartitionAnnuelle, {
      x: "annee",
      y: "total"
    }),
    Plot.line(repartitionAnnuelle, {
      x: "annee",
      y: "total"
    })
  ]
}))
```

---

## Communes les plus représentées

```js
const topCommunes = Object.entries(
  data.reduce((acc, d) => {
    acc[d.commune] = (acc[d.commune] || 0) + 1;
    return acc;
  }, {})
)
.sort((a, b) => b[1] - a[1])
.slice(0, 10)
.map(([commune, total]) => ({ commune, total }));

display(Plot.plot({
  height: 420,
  marginLeft: 160,
  x: {
    label: "Nombre d'entrées"
  },
  y: {
    label: null
  },
  marks: [
    Plot.barX(topCommunes, {
      x: "total",
      y: "commune",
      sort: { y: "x", reverse: true }
    }),
    Plot.text(topCommunes, {
      x: "total",
      y: "commune",
      text: d => d.total,
      dx: 15
    })
  ]
}))
```

---

</div>