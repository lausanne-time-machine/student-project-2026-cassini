import fs from 'fs';

const inputFile = './communes_coordonnees.json';
const outputFile = './communes_coordonnees_rempli.json';

// On lit ton fichier actuel
const data = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
const communes = Object.keys(data);

// Fonction pour faire une pause (OpenStreetMap exige qu'on ne fasse pas plus d'une requête par seconde)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function buildUrl(q, opts = {}) {
    const params = new URLSearchParams({
        q: q,
        format: 'json',
        limit: String(opts.limit || 5),
        addressdetails: '1',
        countrycodes: opts.countrycodes || 'ch',
        'accept-language': 'fr'
    });
    return `https://nominatim.openstreetmap.org/search?${params.toString()}`;
}

async function queryNominatim(q, opts = {}) {
    const url = buildUrl(q, opts);
    const response = await fetch(url, { headers: { 'User-Agent': 'Projet-Etudiant-EPFL-Histoire/1.0' } });
    return response.json();
}

function chooseBestResult(results, commune) {
    if (!results || results.length === 0) return null;
    // 1) Prefer results mentioning Vaud
    const vaud = results.find(r => /Vaud|Canton de Vaud|Vaud,/.test(r.display_name));
    if (vaud) return vaud;
    // 2) Prefer class place/locality/administrative
    const place = results.find(r => /place|city|town|village|locality|administrative/.test(r.type || r.class || ''));
    if (place) return place;
    // 3) fallback to first
    return results[0];
}

async function fetchCoordinates() {
    console.log(`🌍 Début de la recherche pour ${communes.length} lieux...`);
    let count = 0;
    const notFound = [];

    for (const commune of communes) {
        let searchName = commune.replace(/\(.*\)/g, '').trim();
        let found = false;

        const attempts = [
            `${searchName}, Vaud, Switzerland`,
            `${searchName}, Switzerland`,
            `${searchName}`
        ];

        try {
            for (const q of attempts) {
                const results = await queryNominatim(q, { limit: 5, countrycodes: 'ch' });
                const best = chooseBestResult(results, commune);
                if (best) {
                    data[commune].lat = parseFloat(best.lat).toFixed(4);
                    data[commune].lng = parseFloat(best.lon).toFixed(4);
                    console.log(`✅ Trouvé : ${commune} -> [${data[commune].lat}, ${data[commune].lng}] via "${q}"`);
                    found = true;
                    break;
                }
                // courte pause entre tentatives
                await delay(500);
            }

            if (!found) {
                // Dernier recours : chercher sans restriction de pays et augmenter la limite
                const results = await queryNominatim(searchName, { limit: 10, countrycodes: '' });
                const best = chooseBestResult(results, commune);
                if (best) {
                    data[commune].lat = parseFloat(best.lat).toFixed(4);
                    data[commune].lng = parseFloat(best.lon).toFixed(4);
                    console.log(`✅ Trouvé (fallback global) : ${commune} -> [${data[commune].lat}, ${data[commune].lng}]`);
                    found = true;
                }
            }

            if (!found) {
                console.log(`❌ Introuvable automatiquement : ${commune}`);
                notFound.push(commune);
            }
        } catch (error) {
            console.error(`⚠️ Erreur réseau pour ${commune}:`, error.message);
        }

        // Respect des limites: 1.5s par commune globalement
        await delay(1500);

        // On sauvegarde le fichier toutes les 10 communes
        count++;
        if (count % 10 === 0) {
            fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), 'utf-8');
        }
    }

    // Sauvegarde finale
    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), 'utf-8');
    console.log("\n🎉 Terminé ! Le fichier 'communes_coordonnees_rempli.json' a été créé.");
    if (notFound.length > 0) {
        console.log(`\n⚠️ ${notFound.length} communes introuvables automatiquement. Voir 'introuvables.txt'.`);
        fs.writeFileSync('introuvables.txt', notFound.join('\n'), 'utf-8');
    }
}

fetchCoordinates();