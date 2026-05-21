import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "./"); // Ajuste si ton script n'est pas à la racine

const dossiersAnnees = [
    { dir: path.join(projectRoot, "data_resolue_1940") },
    { dir: path.join(projectRoot, "data_resolue_1930") },
    { dir: path.join(projectRoot, "data_resolue_1920") },
    { dir: path.join(projectRoot, "data_resolue_1910") },
    { dir: path.join(projectRoot, "data_resolue_1901") }
];

const tousLesMetiers = new Set();

for (const dossier of dossiersAnnees) {
    if (!fs.existsSync(dossier.dir)) continue;

    const files = fs.readdirSync(dossier.dir).filter(file => file.endsWith('.json'));

    for (const file of files) {
        const filePath = path.join(dossier.dir, file);
        const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));

        // On parcourt les communes
        for (const [communeBrute, metiers] of Object.entries(content)) {
            // On parcourt les métiers de chaque commune
            for (const metierBrut of Object.keys(metiers)) {
                // On enlève juste les espaces en trop autour, mais on garde la casse
                tousLesMetiers.add(metierBrut.trim());
            }
        }
    }
}

// On trie alphabétiquement pour que ce soit plus facile à lire
const metiersTries = Array.from(tousLesMetiers).sort((a, b) => a.localeCompare(b));

// On sauvegarde le tout dans un nouveau fichier JSON
const outputChemin = path.join(projectRoot, "liste_metiers_bruts.json");
fs.writeFileSync(outputChemin, JSON.stringify(metiersTries, null, 2));

console.log(`✅ Extraction terminée ! ${metiersTries.length} métiers uniques trouvés.`);
console.log(`Fichier sauvegardé ici : ${outputChemin}`);