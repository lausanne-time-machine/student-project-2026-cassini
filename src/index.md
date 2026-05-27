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
  <a href="/" class="active"><span>🔬</span> Méthodologie</a>
  <a href="/heatmap"><span>🗺️</span> Heatmap</a>
  <a href="/statistiques"><span>📊</span> Statistiques</a>
</div>

<div class="content-spacer"></div>

<h1 style="text-align: center; max-width: 100%">Lausanne Time Machine — Métiers</h1>
<br>

<h2>Notre projet</h2>
<p>
Les annuaires vaudois constituent une source historique riche permettant d'observer la société à travers les métiers exercés, les communes et l'évolution des activités professionnelles au fil du temps.
</p>
<p>
Ce projet vise à explorer ces données entre 1901 et 1940 afin de mieux comprendre l'organisation socio-professionnelle du canton de Vaud, et plus particulièrement de la région lausannoise.
</p>

<h2>Question de recherche</h2>
<p>
Notre travail s'articule autour de la question suivante :
</p>
<blockquote>
  <strong>« Comment les métiers et leur répartition géographique évoluent-ils dans le canton de Vaud entre 1901 et 1940 ? »</strong>
</blockquote>

<hr>

<h2>Sources des données</h2>
<p>
Nos sources viennent exclusivement des Annuaires vaudois des années 1901, 1910, 1920, 1930 et 1940. L'objectif était de transformer ces documents historiques bruts en données exploitables.
</p>

<hr>

<h2>De l'OCR classique à l'Analyse Sémantique</h2>
<p>
Initialement, l'extraction reposait sur une méthode OCR (Tesseract). Cette approche a été <strong>abandonnée</strong> face à plusieurs limites techniques :
</p>
<ul>
  <li>Ponctuation instable et beaucoup d'erreurs.</li>
  <li>Mise en page complexe où le gras est difficilement détectable.</li>
</ul>
<p>
La solution finale s'appuie sur une analyse sémantique par LLM, permettant une conversion directe du format image (.jpg) au format structuré (.json) pour une exploitation immédiate.
</p>

<hr>

<h2>Data Pipeline et Traitement</h2>
<p>
Notre chaîne de traitement s'articule en plusieurs étapes clés :
</p>
<ol>
  <li><strong>Extraction (Gemini 3.5 Flash) :</strong> Conversion des pages JPG en structure hiérarchisée JSON.</li>
  <li><strong>Gestion du Contexte :</strong> Un script Python gère les dépendances entre les pages. Quand le LLM détecte une information coupée, il ajoute le marqueur "CONTINUATION FROM PREVIOUS" et le script recolle les morceaux.</li>
  <li><strong>Classification :</strong> Agglomération des métiers en catégories sémantiques cohérentes via des clusters LLM et des scripts par mots-clés.</li>
  <li><strong>Géocodage :</strong> Résolution des coordonnées de manière automatisée avec Nominatim, couplée à un traitement manuel pour les communes non reconnues ou mal orthographiées
