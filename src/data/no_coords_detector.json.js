import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// --- CALCUL DES CHEMINS ABSOLUS ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "../../"); 
const cheminDictionnaire = path.join(projectRoot, "src", "data", "communes_coordonnees_rempli_TRUE.json");

if (!fs.existsSync(cheminDictionnaire)) {
    console.error(`❌ ERREUR : Dictionnaire introuvable.`);
    process.exit(1);
}

const coordonnees = JSON.parse(fs.readFileSync(cheminDictionnaire, "utf-8"));
const toutesLesCommunes = Object.keys(coordonnees);

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

const communesManquantes = [];
const dejaVu = new Set(); // Pour éviter de lister 10 fois la même commune pour un même fichier
const communesAIgnorer = ["DISTRICT DE LA VALLÉE", "DISTRICT D'ECHALLENS", "CERCLE DE MONTREUX","VILLE DE LAUSANNE ET DE LA BANLIEUE", "MONT DE CAUX"];

const dossiersAnnees = [
    { annee: 1940, dir: path.join(projectRoot, "data_resolue_1940") },
    { annee: 1930, dir: path.join(projectRoot, "data_resolue_1930") },
    { annee: 1920, dir: path.join(projectRoot, "data_resolue_1920") },
    { annee: 1910, dir: path.join(projectRoot, "data_resolue_1910") },
    { annee: 1901, dir: path.join(projectRoot, "data_resolue_1901") }
];

for (const dossier of dossiersAnnees) {
    if (!fs.existsSync(dossier.dir)) continue;
    const files = fs.readdirSync(dossier.dir).filter(file => file.endsWith('.json'));

    for (const file of files) {
        const filePath = path.join(dossier.dir, file);
        const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));

        // On vérifie chaque commune du fichier
        for (const communeBrute of Object.keys(content)) {
            const nomEnMajuscule = communeBrute.trim().toUpperCase();
            if (communesAIgnorer.includes(communeBrute.trim()) || nomEnMajuscule.includes("DISTRICT") || nomEnMajuscule.includes("CERCLE") || nomEnMajuscule.includes("MONT DE CAUX") || nomEnMajuscule.includes("VILLE DE LAUSANNE ET DE LA BANLIEUE")) {
                continue; 
            }
                
            const nomOfficiel = trouverMeilleureCommune(communeBrute);
            let manque = false;
            let statut = "";

            if (!nomOfficiel) {
                manque = true;
                statut = "Non reconnue dans le dictionnaire";
            } else {
                const coord = coordonnees[nomOfficiel];
                if (!coord || !coord.lat || coord.lat === "" || !coord.lng || coord.lng === "") {
                    manque = true;
                    statut = "Coordonnées vides";
                }
            }

            if (manque) {
                const nomFichierCourt = file.replace(".json", "");
                const signature = `${communeBrute}-${nomFichierCourt}`;
                
                // Si on n'a pas encore signalé cette commune pour cette page, on l'ajoute !
                if (!dejaVu.has(signature)) {
                    dejaVu.add(signature);
                    communesManquantes.push({
                        "Année": dossier.annee,
                        "Fichier (Page)": nomFichierCourt,
                        "Commune (Brute)": communeBrute,
                        "Problème": statut
                    });
                }
            }
        }
    }
}

// Envoi des données manquantes
process.stdout.write(JSON.stringify(communesManquantes));