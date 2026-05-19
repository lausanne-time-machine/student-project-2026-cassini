import fs from "fs";
import path from "path"; // Ajouté pour bien gérer les chemins de dossiers sous Windows

// 1. Charger les coordonnées
const coordonnees = JSON.parse(fs.readFileSync("./communes_coordonnees_rempli_TRUE.json", "utf-8"));

// On garde TOUTES les communes pour la recherche, même celles sans coordonnées
const toutesLesCommunes = Object.keys(coordonnees);

// Fonction de distance de Levenshtein (identique)
function calculerDistance(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1];
            else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
        }
    }
    return matrix[b.length][a.length];
}

function trouverMeilleureCommune(nomBrut) {
    let meilleurMatch = null;
    let distanceMin = Infinity;
    let nomPropre = nomBrut.replace(/\(.*\)/g, '').trim().toLowerCase();

    for (const communeValide of toutesLesCommunes) {
        let nomCible = communeValide.replace(/\(.*\)/g, '').trim().toLowerCase();
        let d = calculerDistance(nomPropre, nomCible);
        if (d < distanceMin) {
            distanceMin = d;
            meilleurMatch = communeValide;
        }
    }
    return distanceMin <= 6 ? meilleurMatch : null;
}
const flatData = [];
const missingCoordsLog = new Set(); // Pour ne pas spammer le même avertissement



// --- NOUVELLE PARTIE : LECTURE AUTOMATIQUE DU DOSSIER ---
const dirPath = "data_resolue_1940";

const communesAIgnorer = [
    "DISTRICT DE LA VALLÉE",
    "DISTRICT D'ECHALLENS"
];


// fs.readdirSync lit tout le dossier, et .filter garde uniquement les fichiers ".json"
const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.json'));

// files contient maintenant automatiquement les 323 fichiers !
for (const file of files) {
    
    // path.join met automatiquement le bon slash ou antislash selon ton système (Windows/Mac)
    const filePath = path.join(dirPath, file);
    const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    for (const [communeBrute, metiers] of Object.entries(content)) {
        if (communesAIgnorer.includes(communeBrute.trim())) {
            continue; // Passe directement à la commune suivante du fichier JSON
        }
        const nomOfficiel = trouverMeilleureCommune(communeBrute);

        if (nomOfficiel) {
            const coord = coordonnees[nomOfficiel];
            
            // --- VÉRIFICATION DES COORDONNÉES ---
            if (!coord.lat || coord.lat === "" || !coord.lng || coord.lng === "") {
                if (!missingCoordsLog.has(nomOfficiel)) {
                    // J'ai ajouté ${file} à la fin pour que tu saches dans quel fichier l'erreur a été trouvée
                    console.warn(`⚠️ Coordonnées manquantes pour : "${nomOfficiel}" (trouvé via "${communeBrute}" dans le fichier ${file})`);
                    missingCoordsLog.add(nomOfficiel);
                }
                continue; 
            }

            for (const [metier, personnes] of Object.entries(metiers)) {
                for (const nom of personnes) {
                    flatData.push({
                        annee: 1940,
                        commune: nomOfficiel,
                        metier: metier,
                        nom: nom,
                        lat: parseFloat(coord.lat),
                        lng: parseFloat(coord.lng)
                    });
                }
            }
        }
    }
}

// Envoi des données JSON
process.stdout.write(JSON.stringify(flatData));