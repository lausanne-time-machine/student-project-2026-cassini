import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// --- FORMULE MAGIQUE POUR LES CHEMINS ABSOLUS ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "../../"); 

// Le script pointe maintenant précisément vers src/data/
const cheminDictionnaire = path.join(projectRoot, "src", "data", "communes_coordonnees_rempli_TRUE.json");

if (!fs.existsSync(cheminDictionnaire)) {
    console.error(`❌ ERREUR FATALE : Dictionnaire introuvable ici : ${cheminDictionnaire}`);
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

const flatData = [];
const communesAIgnorer = ["DISTRICT DE LA VALLÉE", "DISTRICT D'ECHALLENS"];

// Les dossiers de données sont à la racine
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

        for (const [communeBrute, metiers] of Object.entries(content)) {
            const nomEnMajuscule = communeBrute.trim().toUpperCase();
            if (communesAIgnorer.includes(communeBrute.trim()) || nomEnMajuscule.includes("DISTRICT")) {
                continue; 
            }
                
            const nomOfficiel = trouverMeilleureCommune(communeBrute);

            if (nomOfficiel) {
                const coord = coordonnees[nomOfficiel];
                
                if (!coord || !coord.lat || coord.lat === "" || !coord.lng || coord.lng === "") {
                    continue; 
                }

                for (const [metier, personnes] of Object.entries(metiers)) {
                    for (const nom of personnes) {
                        flatData.push({
                            annee: dossier.annee,
                            commune: nomOfficiel,
                            metier: metier,
                            nom: nom,
                            lat: parseFloat(coord.lat),
                            lng: parseFloat(coord.lng),
                            fichier: file.replace(".json", "")
                        });
                    }
                }
            }
        }
    }
}

// Envoi des données
process.stdout.write(JSON.stringify(flatData));