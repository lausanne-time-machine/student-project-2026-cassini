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


/** Toutes les catégories disponibles — utiles pour la légende de ta carte. */
const CATEGORIES = [
  "Agriculture",
  "Viticulture & Vignerons",
  "Élevage & Bétail",
  "Apiculture & Aviculture",
  "Horticulture & Jardinage",
  "Forêt & Bois",
  "Laiterie & Fromagerie",
  "Boucherie & Charcuterie",
  "Boulangerie & Pâtisserie",
  "Alimentation & Épicerie",
  "Vins & Boissons",
  "Tabac & Cigares",
  "Hôtellerie & Restauration",
  "Bâtiment & Construction",
  "Menuiserie & Ébénisterie",
  "Peinture & Décoration",
  "Serrurerie & Forge",
  "Mécanique & Machines",
  "Horlogerie",
  "Bijouterie & Orfèvrerie",
  "Textile & Confection",
  "Cordonnerie & Chaussures",
  "Imprimerie & Édition",
  "Électricité & Énergie",
  "Transports",
  "Santé & Médecine",
  "Coiffure & Soins",
  "Éducation & Enseignement",
  "Administration & Services publics",
  "Justice & Droit",
  "Banque & Finance",
  "Assurances",
  "Arts & Culture",
  "Commerce & Négoce",
  "Industrie & Fabrication",
  "Autre",
];

// =============================================================================
//  Règles de catégorisation
//  Ordre important : du plus spécifique au plus général.
//  La PREMIÈRE règle dont un mot-clé est trouvé dans le texte normalisé gagne.
//  ⚠  Les mots-clés sont testés avec String.includes() sur le texte normalisé
//     (minuscules, sans accents, sans ponctuation, espaces simples).
// =============================================================================
const REGLES = [

  // ── Horlogerie ─────────────────────────────────────────────────────────────
  // (avant Bijouterie, Mécanique – les pignons/roues/ressorts sont horlogers)
  {
    categorie: "Horlogerie",
    mots: [
      "horlog", "montre", "pendule", "reveille", "cadran horlog",
      "echappement", "balancier", "rubis",
      "boite de montre", "aiguille de montre",
      "aiguilles rattrapantes", "aiguilles de montre",
      "ressort de montre", "spiral",
      "tige de remontoir", "remontoir",
      "raquette", "decolletage", "ebauche", "finissage",
      "plantage", "emboitage", "terminage",
      "pignons", "barillets",
      "glaces de montre", "pierres de montre", "verre de montre",
      "chronograph",
      "pivoteur", "polisseur de pieces",
      "cabochons",
    ],
  },

  // ── Bijouterie & Orfèvrerie ────────────────────────────────────────────────
  {
    categorie: "Bijouterie & Orfèvrerie",
    mots: [
      "bijoutier", "bijouterie", "bijoux",
      "orfevre", "orfeverie",
      "argenteur", "argenterie", "argenture",
      "joaillier", "joaillerie",
      "lapidaire",
    ],
  },

  // ── Viticulture & Vignerons ────────────────────────────────────────────────
  {
    categorie: "Viticulture & Vignerons",
    mots: [
      "vigneron", "viticulteur", "viticulture", "vignoble",
      "encaveur", "vendanges", "cepage",
      "vignes americaines", "vignes greffees",
    ],
  },

  // ── Apiculture & Aviculture ────────────────────────────────────────────────
  {
    categorie: "Apiculture & Aviculture",
    mots: [
      "apiculteur", "apiculture", "apilulteur", "aniculteur",
      "abeille", "ruche", "miel",
      "aviculteur", "aviculture", "avicole",
      "elevage de visons",
    ],
  },

  // ── Horticulture & Jardinage ───────────────────────────────────────────────
  {
    categorie: "Horticulture & Jardinage",
    mots: [
      "horticulteur", "horticultrice", "horticulture",
      "jardinier", "jardiniere", "jardinage",
      "maraicher", "maraichere", "maraichage",
      "pepinieriste", "pepiniere",
      "fleuriste",
      "graines fourrageres", "graines potageres", "semences",
      "graines", "graine",
    ],
  },

  // ── Élevage & Bétail ──────────────────────────────────────────────────────
  {
    categorie: "Élevage & Bétail",
    mots: [
      "eleveur", "elevage",
      "betail", "bestiaux",
      "boeuf", "taureau", "vache", "veau",
      "mouton", "agneau", "chevre", "bouc",
      "porcin", "truie",
      "equin", "haras",
      "berger",
      "amodiateur", "amodieur",
      "alpage", "troupeau",
      "fourrage", "fourrages",
    ],
  },

  // ── Forêt & Bois ──────────────────────────────────────────────────────────
  {
    categorie: "Forêt & Bois",
    mots: [
      "forestier", "foret",
      "bucheron", "sylviculture",
      "charbonnier",
      "scierie", "scieur",
      "bois de chauffage", "bois a bruler",
      "bois de construction", "commerce de bois",
      "marchand de bois",
    ],
  },

  // ── Laiterie & Fromagerie ─────────────────────────────────────────────────
  {
    categorie: "Laiterie & Fromagerie",
    mots: [
      "laitier", "laiterie", "lait",
      "fromager", "fromagerie", "fromage",
      "beurre", "creme", "serac",
      "cremerie",
      "fruitiere", "fruitier de montagne",
    ],
  },

  // ── Boucherie & Charcuterie ───────────────────────────────────────────────
  {
    categorie: "Boucherie & Charcuterie",
    mots: [
      "boucher", "boucherie",
      "charcutier", "charcuterie",
      "abattoir", "tripier", "salaison",
      "insp", // "inspect. des viandes"
    ],
  },

  // ── Boulangerie & Pâtisserie ──────────────────────────────────────────────
  {
    categorie: "Boulangerie & Pâtisserie",
    mots: [
      "boulanger", "boulangerie",
      "patissier", "patisserie",
      "confiseur", "confiserie",
      "chocolatier", "chocolaterie", "chocolat",
      "pain", "fournil", "gaufre", "biscuit",
      "meunier", "meunnier", "minotier", "minoterie", "moulin",
    ],
  },

  // ── Tabac & Cigares ───────────────────────────────────────────────────────
  {
    categorie: "Tabac & Cigares",
    mots: [
      "tabac", "cigare", "cigarette",
      "bureau de tabac", "debit de tabac",
    ],
  },

  // ── Alimentation & Épicerie ───────────────────────────────────────────────
  {
    categorie: "Alimentation & Épicerie",
    mots: [
      "epicier", "epicerie",
      "alimentation", "alimentaire",
      "denrees", "comestibles",
      "primeurs", "legumes", "fruits",
      "cereales", "farine",
      "huile", "vinaigre", "moutarde",
      "cafe", "sucre", "sel",
      "conserves", "volaille", "oeufs",
      "poisson", "engrais",
      "produits alimentaires", "produits agricoles",
      "articles agricoles",
    ],
  },

  // ── Vins & Boissons ───────────────────────────────────────────────────────
  {
    categorie: "Vins & Boissons",
    mots: [
      "vins", "vin",
      "biere", "bieres", "brasserie", "brasseur",
      "cidre", "cidrerie",
      "eau minerale", "limonades", "limonadier",
      "spiritueux", "liqueur",
      "eau de vie", "cognac", "absinthe",
      "distillerie",
      "courtier en vins", "negociant en vins",
      "marchand de vins", "commerce de vins",
      "articles de cave",
      "tea room", "tearoom",
    ],
  },

  // ── Hôtellerie & Restauration ─────────────────────────────────────────────
  {
    categorie: "Hôtellerie & Restauration",
    mots: [
      "hotelier", "hotellerie", "hotels", "hotel",
      "pensions", "pension",
      "aubergiste", "auberge",
      "restaurateur", "restaurant",
      "cafetier", "cafes",
      "buffet", "traiteur",
      "estaminet", "buvette", "cantine",
      "cure d air", "cure thermale",
      "chambres meublees", "appartements meubles",
      "villas meublees", "chalet",
      "bar",
    ],
  },

  // ── Cordonnerie & Chaussures ──────────────────────────────────────────────
  {
    categorie: "Cordonnerie & Chaussures",
    mots: [
      "cordonnier", "cordonnerie",
      "chaussure", "savetier",
      "socques", "sabots",
      "babouche",
    ],
  },

  // ── Coiffure & Soins ──────────────────────────────────────────────────────
  {
    categorie: "Coiffure & Soins",
    mots: [
      "coiffeur", "coiffeuse", "coiffure",
      "barbier", "perruquier",
    ],
  },

  // ── Bâtiment & Construction ───────────────────────────────────────────────
  {
    categorie: "Bâtiment & Construction",
    mots: [
      "macon", "maconnerie",
      "charpentier", "charpente",
      "entrepreneur",
      "cimentier", "ciment", "beton",
      "platrier", "platrerie",
      "carreleur", "carrelage",
      "couvreur", "couverture",
      "ardoisier", "ardoise",
      "sanitaire",
      "plombier", "plomberie",
      "chauffage central",
      "fumiste",
      "paveur", "pavage",
      "asphaltage", "asphalte",
      "terrassier", "terrassement",
      "voirie", "travaux publics",
      "materiaux de construction", "materiaux",
      "carriere", "chaux",
      "sabliere", "graviere", "gravier",
      "pierres de taille",
      "tuiles", "briques",
      "constructions metalliques",
      "drainage", "drainag",
      "tuyaux",
    ],
  },

  // ── Menuiserie & Ébénisterie ──────────────────────────────────────────────
  {
    categorie: "Menuiserie & Ébénisterie",
    mots: [
      "menuisier", "menuiserie",
      "ebeniste", "ebenisterie",
      "parqueteur", "parquet",
      "fabricant de meubles",
      "meubles", "ameublement",
      "coffretier",
    ],
  },

  // ── Peinture & Décoration ─────────────────────────────────────────────────
  {
    categorie: "Peinture & Décoration",
    mots: [
      "peintre", "peinture",
      "decorateur", "decoration",
      "tapissier", "tapisserie",
      "tapis",
      "vitrier", "vitrerie", "vitraux",
      "encadreur", "encadrement",
      "papiers peints",
    ],
  },

  // ── Serrurerie & Forge ────────────────────────────────────────────────────
  {
    categorie: "Serrurerie & Forge",
    mots: [
      "serrurier", "serrurerie",
      "forgeron", "marechal",
      "ferblantier", "ferblanterie",
      "zingueur", "zinguerie",
      "chaudronnier", "chaudronnerie",
      "fondeur", "fonderie",
      "ferronnier", "ferronnerie",
      "poelier", "taillandier", "cloutier",
      "trefilerie",
      "metallurgie", "metallurg",
      "nickelage", "galvanoplastie",
      "limes",
      "quincaillier", "quincaillerie",
      "coutelier", "coutellerie",
      "outillage", "outils",
      "pompes",
    ],
  },

  // ── Mécanique & Machines ──────────────────────────────────────────────────
  {
    categorie: "Mécanique & Machines",
    mots: [
      "mecanicien", "mecanique",
      "ajusteur", "tourneur sur metaux",
      "machines", "machine",
      "moteur", "turbine", "engrenage",
      "appareilleur", "appareillage", "appareils",
      "ascenseur",
      "installateur",
      "reparateur", "reparation",
      "vulcanisateur", "vulcanisation",
      "garage", "auto", "cycles", "cycliste",
      "bicyclette", "velo",
      "carrossier", "carrosserie",
      "radio",
    ],
  },

  // ── Textile & Confection ──────────────────────────────────────────────────
  {
    categorie: "Textile & Confection",
    mots: [
      "tailleur", "tailleuse",
      "couturier", "couturiere", "couture",
      "tisserand", "tissage", "tissus",
      "filature", "fileur",
      "bonnetier", "bonneterie",
      "broderie", "brodeur",
      "lingere", "lingerie",
      "chemisier", "chemiserie",
      "modiste", "chapelier", "chapellerie",
      "corsetier", "corsetiere",
      "blanchisseur", "blanchisserie",
      "teinturier", "teinturerie",
      "lainage", "drap",
      "mercier", "mercerie",
      "passementier", "cordier",
      "toile", "confections",
      "cuirs", "cuir",
      "fourrures", "pelleterie",
      "parapluie",
      "rhabilleur",
      "vannerie",
    ],
  },

  // ── Imprimerie & Édition ──────────────────────────────────────────────────
  {
    categorie: "Imprimerie & Édition",
    mots: [
      "imprimeur", "imprimerie",
      "typographe", "typographie",
      "lithographe", "lithographie",
      "editeur", "edition",
      "libraire", "librairie",
      "relieur", "reliure",
      "graveur", "gravure", "photogravure",
      "papetier", "papeterie",
      "journaux", "journal", "presse",
      "affichage", "afficheur", "affiches",
    ],
  },

  // ── Électricité & Énergie ─────────────────────────────────────────────────
  {
    categorie: "Électricité & Énergie",
    mots: [
      "electricien", "electricite",
      "electrique", "electrotech",
      "allumeur d electricite",
      "gazier",
      "acetylene", "carbure",
      "eclairage",
      "accumulateur", "dynamo",
      "charbon", "houille", "coke", "anthracite", "combustible",
    ],
  },

  // ── Transports ────────────────────────────────────────────────────────────
  {
    categorie: "Transports",
    mots: [
      "voiturier", "camionneur",
      "transport",
      "charretier", "batelier",
      "bateaux", "bateau", "barque",
      "messager", "messageries",
      "demenageur",
      "chauffeur", "autobus", "autocar",
      "conducteur de", "roulage",
    ],
  },

  // ── Santé & Médecine ──────────────────────────────────────────────────────
  {
    categorie: "Santé & Médecine",
    mots: [
      "medecin", "docteur",
      "pharmacien", "pharmacie",
      "dentiste",
      "veterinaire",
      "infirmier", "infirmiere", "infirmerie",
      "sage femme",
      "chirurgien",
      "oculiste", "opticien", "optique",
      "masseur",
      "hopital", "clinique",
      "asile", "sanatorium", "ambulance",
      "bandagiste", "orthopediste",
      "droguerie", "droguiste",
      "instruments de chirurgie",
      "desinfection",
    ],
  },

  // ── Éducation & Enseignement ──────────────────────────────────────────────
  {
    categorie: "Éducation & Enseignement",
    mots: [
      "instituteur", "institutrice", "institutrices",
      "professeur",
      "maitre", "maitresse",
      "enseignant", "enseignement",
      "ecoles", "ecole",
      "college", "gymnase",
      "academie",
      "regent", "regente",
      "apprentissage",
      "pensionnat", "internat", "institut",
    ],
  },

  // ── Justice & Droit ───────────────────────────────────────────────────────
  {
    categorie: "Justice & Droit",
    mots: [
      "avocat",
      "notaire",
      "juge",
      "greffier", "huissier",
      "procureur", "arbitre",
      "agent d affaires patente",
      "justice de paix",
      "substitut",
      "office des poursuites", "poursuites",
    ],
  },

  // ── Administration & Services publics ─────────────────────────────────────
  {
    categorie: "Administration & Services publics",
    mots: [
      "administrateur", "administration",
      "fonctionnaire",
      "agent de police", "police",
      "garde champetre", "gendarme",
      "voyer",
      "secretaire communal", "syndic",
      "concierge", "gardien", "geolier",
      "administrateur postal",
      "postes", "telegraphe", "telegraphiste",
      "telephone", "telephoniste",
      "douanier", "douane",
      "pompier", "sapeur",
      "inspecteur",
      "prepose", "receveur",
      "autorites",
      "conseil",
      "office",
      "gare",
      "regiment", "commandant", "officier",
      "regisseur",
      "bureau",
    ],
  },

  // ── Arts & Culture ────────────────────────────────────────────────────────
  {
    categorie: "Arts & Culture",
    mots: [
      "artiste",
      "musicien", "pianiste", "pianos", "piano",
      "violon", "organiste",
      "chanteur", "chanteuse",
      "accordeur", "accordeon",
      "photographe", "photographie",
      "sculpteur", "architecte", "dessinateur",
      "antiquaire", "antiquites",
      "instruments de musique", "musique",
    ],
  },

  // ── Banque & Finance ──────────────────────────────────────────────────────
  {
    categorie: "Banque & Finance",
    mots: [
      "banquier", "banque",
      "agent de change", "changeur",
      "caissier", "comptable",
      "gerance", "regisseur d immeubles",
    ],
  },

  // ── Assurances ────────────────────────────────────────────────────────────
  {
    categorie: "Assurances",
    mots: [
      "assurance", "assureur",
      "contre l incendie", "contre le vol",
      "contre les accidents",
      "contre la grele",
    ],
  },

  // ── Agriculture ───────────────────────────────────────────────────────────
  {
    categorie: "Agriculture",
    mots: [
      "agriculteur", "agricultur",
      "agriculture", "agronome",
      "fermier", "fermiere",
      "paysan", "laboureur",
      "moissonneur", "faucheuse",
      "instruments agricoles", "outils agricoles",
      "machines agricoles",
      "ingenieur agricole",
    ],
  },

  // ── Commerce & Négoce (filet large) ───────────────────────────────────────
  {
    categorie: "Commerce & Négoce",
    mots: [
      "marchand", "negociant",
      "agence commerciale", "agences commerciales",
      "agence immobiliere", "agence de location",
      "agence de placement", "agence de voyages",
      "agence",
      "commerce",
      "bazar",
      "grossiste",
      "detaillant",
      "representant",
      "voyageur de commerce",
      "agent commercial",
      "importateur", "exportateur",
      "chiffons",
      "articles de voyages", "articles de sport",
      "articles pour",
    ],
  },

  // ── Industrie & Fabrication (filet final avant Autre) ─────────────────────
  {
    categorie: "Industrie & Fabrication",
    mots: [
      "fabricant", "fabricants",
      "fab de", "fab d", "fabr de", "fabr d",
      "fabrique de", "fabrique d",
      "manufacture",
      "usine", "atelier",
      "industrie", "industriel",
      "producteur",
      "poterie", "ceramique",
      "brosserie", "brosses",
      "produits",
    ],
  },
];

// =============================================================================
//  Helpers internes
// =============================================================================

/** Normalise une chaîne : minuscules, sans accents, sans ponctuation */
function _normalise(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // supprime les diacritiques
    .replace(/[^a-z\s]/g, " ")         // ponctuation → espace
    .replace(/\s+/g, " ")              // espaces multiples → un seul
    .trim();
}

// =============================================================================
//  Fonction principale exportée
// =============================================================================

/**
 * Retourne la catégorie correspondant au métier brut.
 *
 * @param {string} metierBrut  – Entrée brute ex. "Agriculteurs-vignerons.", "Horloger."
 * @returns {string}           – Catégorie normalisée, ou "Autre"
 */
function normaliserMetier(metierBrut) {
  if (!metierBrut || typeof metierBrut !== "string") return "Autre";

  const texte = _normalise(metierBrut);

  for (const regle of REGLES) {
    for (const mot of regle.mots) {
      if (texte.includes(mot)) {
        return regle.categorie;
      }
    }
  }

  return "Autre";
}

// =============================================================================
//  (Optionnel) Pré-calcul du mapping complet — debug / export JSON
// =============================================================================

/**
 * Construit un objet { [metierBrut]: categorie } pour une liste de métiers.
 * Utile pour inspecter les résultats ou générer un fichier de cache.
 *
 * @param {string[]} listeMetiersBruts
 * @returns {Object}
 */
function construireMappingComplet(listeMetiersBruts) {
  const result = {};
  for (const metier of listeMetiersBruts) {
    result[metier] = normaliserMetier(metier);
  }
  return result;
}

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
const communesAIgnorer = ["DISTRICT DE LA VALLÉE", "DISTRICT D'ECHALLENS", "CERCLE DE MONTREUX","VILLE DE LAUSANNE ET DE LA BANLIEUE", "MONT DE CAUX"];

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
            if (communesAIgnorer.includes(communeBrute.trim()) || nomEnMajuscule.includes("DISTRICT") || nomEnMajuscule.includes("CERCLE") || nomEnMajuscule.includes("MONT DE CAUX") || nomEnMajuscule.includes("VILLE DE LAUSANNE ET DE LA BANLIEUE")) {
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
                        const metierNormalise = normaliserMetier(metier);
                        flatData.push({
                            annee: dossier.annee,
                            commune: nomOfficiel,
                            // On enregistre la grande catégorie pour la carte
                            metier: metierNormalise, 
                            // Facultatif: tu peux garder le nom brut pour ton tableau en bas de page
                            metierOriginal: metier, 
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