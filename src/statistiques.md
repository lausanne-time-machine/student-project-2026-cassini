---
title: Statistiques — SHS Métiers
toc: false
sidebar: false
theme: dark
---

<style>
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
  .top-navbar a.active { border-bottom: 2px solid #00f6ff; padding-bottom: 2px; }
  .content-spacer { margin-top: 52px; }

  /* Sélecteur de métier (version stats, inline) */
  .metier-selector-wrapper {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    background-color: rgba(10, 15, 30, 0.85);
    border: 2px solid #2563eb;
    padding: 10px 18px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.7);
    margin-bottom: 1.5rem;
  }
  .metier-selector-wrapper form {
    margin: 0 !important;
    display: flex;
    align-items: center;
    gap: 12px;
    color: #93c5fd !important;
    font-weight: 600;
  }
  .metier-selector-wrapper select {
    background-color: #000000 !important;
    color: #ffffff !important;
    border: 1px solid #1e40af !important;
    border-radius: 4px;
    padding: 5px 12px;
    cursor: pointer;
  }
</style>

<div class="top-navbar">
  <!--a href="/"><span>ℹ️</span> Informations</a-->
  <a href="/"><span>🔬</span> Méthodologie</a>
  <a href="/heatmap"><span>🗺️</span> Heatmap</a>
  <a href="/statistiques" class="active"><span>📊</span> Statistiques</a>
</div>

<div class="content-spacer"></div>

<h1>📊 Statistiques</h1>
<p>
Cette section présente différentes analyses réalisées à partir des données historiques extraites des annuaires vaudois.
Les graphiques permettent d'observer l'évolution des métiers, leur importance relative ainsi que leur répartition dans le temps.
</p>

```js
const data = await FileAttachment("./data/metiers.json").json();
const metiersUniques = [...new Set(data.map(d => d.metier))].sort();
const anneesUniques = [...new Set(data.map(d => d.annee))].sort((a, b) => a - b);
```

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
  x: { label: "Nombre d'entrées" },
  y: { label: null },
  marks: [
    Plot.barX(topMetiers, {
      x: "total",
      y: "metier",
      fill: "url(#bar-gradient)",
      sort: { y: "x", reverse: true }
    }),
    Plot.text(topMetiers, {
      x: "total",
      y: "metier",
      text: d => d.total,
      dx: 15
    })
  ]
}));

// Injection du dégradé SVG
const svgBar = document.querySelector("#observablehq-main svg");
if (svgBar && !svgBar.querySelector("#bar-gradient")) {
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `
      <linearGradient id="bar-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#1e3a8a" />
        <stop offset="50%" stop-color="#3b82f6" />
        <stop offset="100%" stop-color="#00f6ff" />
      </linearGradient>`;
    svgBar.prepend(defs);
}
```

---

## Répartition totale des entrées par année

```js
const repartitionAnnuelle = anneesUniques.map(annee => ({
  annee,
  total: data.filter(d => d.annee === annee).length
}));

display(Plot.plot({
  height: 400,
  x: { label: "Année" },
  y: { label: "Nombre total d'entrées" },
  marks: [
    Plot.areaY(repartitionAnnuelle, {
      x: "annee",
      y: "total",
      fill: "url(#area-gradient)"
    }),
    Plot.line(repartitionAnnuelle, {
      x: "annee",
      y: "total",
      stroke: "#00f6ff"
    })
  ]
}));

setTimeout(() => {
    const svgArea = document.querySelectorAll("#observablehq-main svg")[1];
    if (svgArea && !svgArea.querySelector("#area-gradient")) {
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        defs.innerHTML = `
          <linearGradient id="area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#00f6ff" stop-opacity="0.7"/>
            <stop offset="50%" stop-color="#3b82f6" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#1e3a8a" stop-opacity="0.05"/>
          </linearGradient>`;
        svgArea.prepend(defs);
    }
}, 100);
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
  x: { label: "Nombre d'entrées" },
  y: { label: null },
  marks: [
    Plot.barX(topCommunes, {
      x: "total",
      y: "commune",
      fill: "url(#bar-gradient-communes)",
      sort: { y: "x", reverse: true }
    }),
    Plot.text(topCommunes, {
      x: "total",
      y: "commune",
      text: d => d.total,
      dx: 15
    })
  ]
}));

setTimeout(() => {
    const svgCommunes = document.querySelectorAll("#observablehq-main svg")[2];
    if (svgCommunes && !svgCommunes.querySelector("#bar-gradient-communes")) {
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        defs.innerHTML = `
          <linearGradient id="bar-gradient-communes" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#1e3a8a" />
            <stop offset="50%" stop-color="#3b82f6" />
            <stop offset="100%" stop-color="#00f6ff" />
          </linearGradient>`;
        svgCommunes.prepend(defs);
    }
}, 100);
```

---

## Évolution d'un métier dans le temps

<div class="metier-selector-wrapper">

```js
const selectedMetier = view(Inputs.select(metiersUniques, {label: "Choix du métier :", value: "Agriculteurs"}));
```

</div>

```js
const evolutionMetier = anneesUniques.map(annee => ({
  annee,
  total: data.filter(d => d.metier === selectedMetier && d.annee === annee).length
}));

display(Plot.plot({
  height: 400,
  x: { label: "Année" },
  y: { label: "Nombre de personnes" },
  marks: [
    Plot.line(evolutionMetier, {
      x: "annee",
      y: "total",
      stroke: "#00f6ff",
      strokeWidth: 4,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }),
    Plot.dot(evolutionMetier, {
      x: "annee",
      y: "total",
      tip: true,
      stroke: "#00f6ff"
    })
  ]
}));
```
