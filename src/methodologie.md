---
title: Méthodologie — SHS Métiers
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
</style>

<div class="top-navbar">
  <a href="/"><span>ℹ️</span> Informations</a>
  <a href="/methodologie" class="active"><span>🔬</span> Méthodologie</a>
  <a href="/heatmap"><span>🗺️</span> Heatmap</a>
  <a href="/statistiques"><span>📊</span> Statistiques</a>
</div>

<div class="content-spacer"></div>

<h1>🔬 Méthodologie</h1>

<h2>Sources des données</h2>
<p>
Les données proviennent d'annuaires historiques numérisés contenant :
</p>
<ul>
  <li>Noms</li>
  <li>Profession</li>
  <li>Adresses et commune</li>
</ul>
<p>
L'objectif était de transformer ces documents historiques en données exploitables.
</p>

---

<h2>OCR et reconnaissance du texte</h2>
<p>
Nous avons utilisé des outils d'OCR (reconnaissance optique de caractères) afin d'extraire le texte depuis les scans des annuaires.
</p>

<h3>Difficultés rencontrées</h3>
<ul>
  <li>Ponctuation instable</li>
  <li>Qualité variable des scans</li>
  <li>Mise en page complexe</li>
  <li>Erreurs sur les caractères anciens</li>
  <li>Détection difficile du gras et des colonnes</li>
</ul>

---

<h2>Utilisation des LLM</h2>
<p>
Après l'OCR, nous avons utilisé des modèles de langage (LLM) pour :
</p>
<ul>
  <li>Structurer les données</li>
  <li>Identifier les professions</li>
  <li>Séparer les informations importantes</li>
  <li>Convertir automatiquement les pages en format CSV</li>
</ul>

---

<h2>Exemple de structure extraite</h2>

<table>
  <thead>
    <tr>
      <th>Nom</th>
      <th>Commune</th>
      <th>Profession</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Perey Georges</td>
      <td>Vufflens-le-Château</td>
      <td>Syndic</td>
    </tr>
    <tr>
      <td>Delapierre Robert</td>
      <td>Vufflens-le-Château</td>
      <td>Secrétaire</td>
    </tr>
    <tr>
      <td>Duruz Ernest</td>
      <td>Vufflens-le-Château</td>
      <td>Municipaux</td>
    </tr>
    <tr>
      <td>Lassueur Robert</td>
      <td>Vugelles-la-Mothe</td>
      <td>Syndic</td>
    </tr>
    <tr>
      <td>Marchand Maurice</td>
      <td>Vugelles-la-Mothe</td>
      <td>Apiculteurs</td>
    </tr>
    <tr>
      <td>Rubattel Lucien</td>
      <td>Vuibroye</td>
      <td>Syndic</td>
    </tr>
  </tbody>
</table>
