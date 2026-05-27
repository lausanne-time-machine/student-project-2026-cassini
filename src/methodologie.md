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

<<h1>🔬 Méthodologie</h1>

<h2>Sources des données</h2>
<p>
Les données proviennent d'annuaires historiques vaudois numérisés (période 1901-1940) permettant d'observer l'organisation socio-professionnelle de l'époque. L'objectif était de transformer ces documents bruts en données structurées et exploitables.
</p>

---

<h2>De l'OCR à l'Analyse Sémantique</h2>
<p>
Initialement, l'extraction reposait sur une méthode OCR classique (Tesseract). Cette approche a été <strong>abandonnée</strong> face à plusieurs limites techniques :
</p>
<ul>
  <li>Ponctuation instable et beaucoup d'erreurs de lecture.</li>
  <li>Mise en page complexe rendant la détection du texte en gras très difficile.</li>
</ul>
<p>
La solution finale s'appuie sur une <strong>combinaison puissante entre reconnaissance visuelle et traitement intelligent</strong>. Le passage direct des images (JPG) en format structuré (JSON) est désormais assuré par un LLM (Gemini 3.5 Flash).
</p>

---

<h2>Data Pipeline</h2>
<ol>
  <li><strong>Extraction (JPG ➔ JSON) :</strong> Utilisation de Gemini pour extraire et hiérarchiser directement les données par commune et profession.</li>
  <li><strong>Gestion du contexte :</strong> Un script Python gère les coupures entre les pages grâce à un système de <em>flag</em> (le modèle indique <code>CONTINUATION FROM PREVIOUS</code> lorsqu'une information est incomplète).</li>
  <li><strong>Classification :</strong> Agglomération des métiers en catégories sémantiques cohérentes à l'aide de clusters LLM et de scripts par mots-clés.</li>
  <li><strong>Géocodage :</strong> Résolution automatisée des coordonnées via <em>Nominatim</em>, complétée par un traitement manuel pour les communes mal orthographiées ou non reconnues.</li>
</ol>

---

<h2>Comparaison des performances LLM</h2>
<p>Lors de nos tests sur les mêmes jeux de données, les modèles ont montré des résultats très différents :</p>
<table>
  <thead>
    <tr>
      <th>Modèle</th>
      <th>Précision (Accuracy)</th>
      <th>Extraction (Lignes CSV)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>GPT-4o</strong></td>
      <td>26%</td>
      <td>56</td>
    </tr>
    <tr>
      <td><strong>Gemini 3 Flash</strong></td>
      <td><strong>100%</strong></td>
      <td><strong>176</strong></td>
    </tr>
  </tbody>
</table>

---

<h2>Gestion de l'API et mise à l'échelle</h2>
<p>
Pour traiter de grands volumes de données (plus de 2000 pages numérisées) tout en contournant les limites d'accès direct, l'utilisation de l'<strong>API Batch</strong> a été mise en place. Cette méthode implique des temps de réponse asynchrones plus lents, mais a permis de diviser les coûts par deux.
</p>

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
