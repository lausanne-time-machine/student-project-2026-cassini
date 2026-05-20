import fs from 'fs';
import path from 'path';


const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function queryNominatim(q, opts = {}) {
    const params = new URLSearchParams({
        q: q, format: 'json', limit: String(opts.limit || 5),
        addressdetails: '1', countrycodes: opts.countrycodes || 'ch', 'accept-language': 'fr'
    });
    const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
    const response = await fetch(url, { headers: { 'User-Agent': 'Projet-Etudiant-EPFL-Histoire/1.0' } });
    return response.json();
}

function chooseBestResult(results) {
    if (!results || results.length === 0) return null;
    const vaud = results.find(r => /Vaud|Canton de Vaud|Vaud,/.test(r.display_name));
    if (vaud) return vaud;
    return results[0];
}


async function mettreAJourCoordonnees() {
const fileCoordinates = './communes_coordonnees_rempli_TRUE.json';

let coordonneesExistantes = {};
if (fs.existsSync(fileCoordinates)) {
    coordonneesExistantes = JSON.parse(fs.readFileSync(fileCoordinates, 'utf-8'));
}

const dossiersAnnees = [
    "./data_resolue_1930",
    "./data_resolue_1920",
    "./data_resolue_1910",
    "./data_resolue_1901"
];

let toutesLesCommunesTrouvees = new Set();

for (const dossier of dossiersAnnees) {
    if (!fs.existsSync(dossier)) continue;
    const fichiers = fs.readdirSync(dossier).filter(f => f.endsWith('.json'));
    
    for (const fichier of fichiers) {
        const contenu = JSON.parse(fs.readFileSync(path.join(dossier, fichier), 'utf-8'));
        // Dans ta structure, les clés du JSON sont les communes brutes
        Object.keys(contenu).forEach(c => toutesLesCommunesTrouvees.add(c.trim()));
    }
}

// 3. FILTRAGE CRUCIAL : On ne garde que celles qui n'ont PAS de coordonnées valides
const communesAGeocoder = [...toutesLesCommunesTrouvees].filter(commune => {
    const existe = coordonneesExistantes[commune];
    // Si la commune n'existe pas du tout, OU si ses coordonnées sont vides, on doit la géocoder
    return !existe || !existe.lat || existe.lat === "" || !existe.lng || existe.lng === "";
});

console.log(`🔍 Total communes trouvées historiquement : ${toutesLesCommunesTrouvees.size}`);
console.log(`🎯 Nouvelles communes nécessitant un géocodage : ${communesAGeocoder.length}`);

// 4. Lancer la recherche pour les nouvelles communes
    let count = 0;
    for (const commune of communesAGeocoder) {
        let searchName = commune.replace(/\(.*\)/g, '').trim();
        let found = false;

        const attempts = [
            `${searchName}, Vaud, Switzerland`,
            `${searchName}, Switzerland`,
            `${searchName}`
        ];

        for (const q of attempts) {
            const results = await queryNominatim(q, { limit: 5, countrycodes: 'ch' });
            const best = chooseBestResult(results);
            if (best) {
                // On ajoute la nouvelle coordonnée dans notre dictionnaire
                coordonneesExistantes[commune] = {
                    lat: parseFloat(best.lat).toFixed(4),
                    lng: parseFloat(best.lon).toFixed(4)
                };
                console.log(`✅ Ajouté : ${commune} -> [${coordonneesExistantes[commune].lat}, ${coordonneesExistantes[commune].lng}]`);
                found = true;
                break;
            }
            await delay(500); // Pause pour ne pas spammer l'API
        }

        if (!found) {
            console.log(`❌ Introuvable automatiquement : ${commune}`);
            // On l'ajoute vide pour que tu puisses la repérer plus tard
            coordonneesExistantes[commune] = { lat: "", lng: "" };
        }

        count++;
        // Sauvegarde toutes les 10 communes par sécurité
        if (count % 10 === 0) {
            fs.writeFileSync(fileCoordinates, JSON.stringify(coordonneesExistantes, null, 2), 'utf-8');
        }
        await delay(1500); // Pause légale OpenStreetMap
    }

    // 5. Sauvegarde finale
    fs.writeFileSync(fileCoordinates, JSON.stringify(coordonneesExistantes, null, 2), 'utf-8');
    console.log("\n🎉 Terminé ! Le dictionnaire est à jour sans avoir écrasé tes anciennes données.");
}

// Lancement de la fonction
mettreAJourCoordonnees();
