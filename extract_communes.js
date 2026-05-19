import fs from 'fs';
import path from 'path';

// Dossier contenant tes JSON et fichier de sortie
const inputDir = path.join(process.cwd(), 'data_extraite_1940');
const outputFile = './communes_coordonnees.json';

// On utilise un Set pour éviter les doublons (si une commune apparaît dans plusieurs fichiers)
const communesSet = new Set();

try {
    // 1. Lire tous les fichiers du dossier
    const files = fs.readdirSync(inputDir);

    // 2. Filtrer pour ne garder que les fichiers .json
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    console.log(`Trouvé ${jsonFiles.length} fichiers JSON à analyser...`);

    // 3. Boucler sur chaque fichier
    for (const file of jsonFiles) {
        const filePath = path.join(inputDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        try {
            const data = JSON.parse(content);
            // Les communes sont les clés de l'objet principal
            const communesDansFichier = Object.keys(data);
            
            communesDansFichier.forEach(commune => communesSet.add(commune));
        } catch (e) {
            console.error(`Erreur lors de la lecture du fichier ${file}:`, e.message);
        }
    }

    // 4. Préparer le fichier de sortie avec une structure prête à accueillir les coordonnées
    const outputData = {};
    const communesTriees = Array.from(communesSet).sort(); // On trie par ordre alphabétique

    for (const commune of communesTriees) {
        // On prépare le terrain pour tes futures coordonnées
        outputData[commune] = { lat: "", lng: "" };
    }

    // 5. Sauvegarder le résultat
    fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2), 'utf-8');
    
    console.log(`\nSuccès ! ${communesTriees.length} communes uniques ont été extraites.`);
    console.log(`Le fichier '${outputFile}' a été créé. Tu peux maintenant l'ouvrir pour ajouter tes coordonnées.`);

} catch (error) {
    console.error("Erreur globale : Vérifie que le dossier 'data_erxtraite_1940' existe bien à la racine du projet.");
    console.error(error.message);
}