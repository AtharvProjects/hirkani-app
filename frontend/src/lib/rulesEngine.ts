export const SAFE = "SAFE";
export const CAUTION = "CONSUME_WITH_CAUTION";
export const AVOID = "AVOID_DURING_PREGNANCY";

export interface RuleHit {
  key: string;
  severity: string;
  message: string;
}

import { supabase } from './supabase';

export function stripPercentages(text: string): string {
  if (!text) return "";
  return text
    .replace(/\b100%\s*/gi, "fully ")
    .replace(/\b\d+%\s*/gi, "")
    .replace(/%/g, "")
    .trim();
}

export function containsAny(textBlob: string, terms: string[]): boolean {
  if (!textBlob) return false;
  const lowerBlob = textBlob.toLowerCase();
  return terms.some(term => {
    const lowerTerm = term.toLowerCase().trim();
    if (!lowerTerm) return false;
    if (lowerTerm.includes(" ") || /[^a-z0-9]/i.test(lowerTerm)) {
      return lowerBlob.includes(lowerTerm);
    }
    return new RegExp(`\\b${lowerTerm}\\b`, 'i').test(lowerBlob);
  });
}

export const ALCOHOL_TERMS = [
  "alcohol", "ethanol", "ethyl alcohol", "beer", "lager", "ale", "stout", "porter",
  "pilsner", "draught", "draft beer", "malt liquor", "cider", "hard cider",
  "wine", "red wine", "white wine", "rose wine", "champagne", "prosecco", "sparkling wine", "vermouth",
  "rum", "vodka", "whiskey", "whisky", "scotch", "bourbon", "rye", "gin", "tequila",
  "brandy", "cognac", "mezcal", "liqueur", "liquor", "spirit", "spirits", "cocktail",
  "hard seltzer", "kingfisher", "budweiser", "heineken", "corona", "carlsberg", "tuborg",
  "bira", "bira 91", "breezer", "bacardi", "smirnoff", "absolut", "baileys", "jagermeister",
  "alcoholic", "abv", "proof"
];

export const PAN_MASALA_TOBACCO_TERMS = [
  "pan masala", "paan masala", "rajnigandha", "vimal", "kamla pasand", "manikchand",
  "dilbagh", "gutka", "gutkha", "supari", "areca nut", "betel nut", "arecoline",
  "tobacco", "nicotine", "khaini", "zarda", "chaini khaini", "dokha", "snuff",
  "paan", "meetha pan", "meetha masala", "sweet supari", "flavoured supari",
  "chuna", "kattha", "bidi", "beedi", "cigarette", "cigar", "hookah"
];

export const RAW_MICROBIAL_TERMS = [
  "sushi", "sashimi", "tartare", "carpaccio", "raw fish", "raw meat", "undercooked",
  "raw egg", "raw eggs", "runny egg", "unpasteurized", "raw milk", "raw cheese",
  "brie", "camembert", "blue cheese", "roquefort", "gorgonzola", "feta", "queso fresco",
  "raw sprouts", "alfalfa sprouts", "clover sprouts", "ceviche", "pate", "liver pate"
];

export const MERCURY_FISH_TERMS = [
  "shark", "swordfish", "king mackerel", "tilefish", "bigeye tuna", "marlin", "orange roughy"
];

export const PAPAYA_TERMS = [
  "unripe papaya", "green papaya", "raw papaya", "papaya latex", "papain enzyme", "papaya"
];

export const ULTRA_PROCESSED_TERMS = [
  "chips", "kurkure", "lays", "doritos", "cheetos", "bingo", "puffcorn",
  "instant noodle", "ramen", "maggi", "top ramen", "yippee", "salted snack", "namkeen", "bhujia"
];

export const HIGH_SUGAR_SWEET_TERMS = [
  "candy", "sweet", "jalebi", "gulab jamun", "rasgulla", "halwa", "barfi", "ladoo",
  "soda", "cola", "pepsi", "coca cola", "fanta", "mirinda", "sprite", "mountain dew", "syrup"
];

export function generateDetailedPregnancyReasons(
  detectedFood: string,
  ingredients: string[],
  nutrients: any,
  classification: string,
  ruleHits: RuleHit[],
  profile: any
): string[] {
  const foodNameLower = (detectedFood || "").toLowerCase();
  const textBlob = (ingredients || []).join(" ").toLowerCase();
  const combined = (foodNameLower + " " + textBlob).toLowerCase();

  const caffeineMg = parseFloat(nutrients?.caffeine_mg || 0);
  const sugarG = parseFloat(nutrients?.sugar_g || 0);
  const sodiumMg = parseFloat(nutrients?.sodium_mg || 0);
  const transFatG = parseFloat(nutrients?.trans_fat_g || 0);

  const conditions = (profile?.medical_conditions || []).map((c: string) => c.toLowerCase());
  const hasDiabetes = conditions.includes("diabetes") || conditions.includes("gestational diabetes");
  const hasHypertension = conditions.includes("hypertension") || conditions.includes("preeclampsia") || conditions.includes("high blood pressure");
  const hasAnemia = conditions.includes("anemia");

  const reasons: string[] = [];

  // ==========================================
  // 1. AVOID_DURING_PREGNANCY: Why not to eat
  // ==========================================
  if (classification === AVOID) {
    // Specific allergen triggers
    const allergenHits = ruleHits.filter(r => r.key.startsWith("allergen_match"));
    if (allergenHits.length > 0) {
      allergenHits.forEach(h => {
        reasons.push(`Allergen Reaction: ${h.message} Severe maternal allergic reactions compromise placental blood flow and oxygenation.`);
      });
    }

    // Specific food hazards
    // 1. Alcohol & Alcoholic Beverages
    if (containsAny(combined, ALCOHOL_TERMS)) {
      reasons.push("Ethanol / Alcohol (Beer / Lager / Spirits): Passes directly across the placenta into fetal circulation with zero safe threshold. Maternal alcohol consumption causes Fetal Alcohol Spectrum Disorders (FASD), irreversible fetal brain damage, facial anomalies, and preterm birth.");
    }

    // 2. Pan Masala, Gutka, Betel Nut (Supari), Tobacco
    if (containsAny(combined, PAN_MASALA_TOBACCO_TERMS)) {
      reasons.push("Areca Nut & Pan Masala: Classified by WHO/IARC as a Group 1 carcinogen and direct reproductive toxin. Arecoline stimulates uterine contractions, drastically increases miscarriage risk, causes placental vasoconstriction, and induces severe fetal growth restriction.");
      if (containsAny(combined, ["tobacco", "nicotine", "khaini", "zarda", "bidi", "cigarette", "gutka"])) {
        reasons.push("Nicotine & Tobacco Alkaloids: Constricts umbilical and placental arteries, starving the fetus of oxygen, and significantly raises risks of placenta previa, premature delivery, and stillbirth.");
      }
    }

    // 3. Unpasteurized Dairy
    if (containsAny(combined, ["unpasteurized", "brie", "camembert", "blue cheese", "roquefort", "gorgonzola", "feta", "raw milk", "queso fresco"])) {
      reasons.push("Unpasteurized Dairy: Carries a severe risk of Listeria monocytogenes bacteria. Listeriosis crosses the placenta and can cause miscarriage, stillbirth, or severe neonatal illness.");
    }

    // 4. Raw / Undercooked Animal Protein
    if (containsAny(combined, ["sushi", "sashimi", "tartare", "carpaccio", "raw fish", "raw meat", "undercooked", "raw egg", "raw eggs", "runny egg", "ceviche"])) {
      reasons.push("Raw / Undercooked Animal Protein: Prone to Salmonella, Listeria, and Toxoplasma gondii parasites, leading to dangerous maternal foodborne infection and fetal neurological damage.");
    }

    // 5. Unripe Papaya
    if (containsAny(combined, PAPAYA_TERMS)) {
      reasons.push("Unripe Papaya Latex & Papain: High concentrations of latex and papain enzymes simulate oxytocin and prostaglandins, which can trigger uterine contractions and early labor.");
    }

    // 6. High Mercury Fish
    if (containsAny(combined, MERCURY_FISH_TERMS)) {
      reasons.push("High Methylmercury: Predatory fish accumulate neurotoxic heavy metals that easily cross the placenta and impair fetal brain and nervous system development.");
    }

    // 7. High Caffeine (>200mg)
    if (caffeineMg > 200 || containsAny(combined, ["energy drink", "red bull", "monster", "sting energy", "hell energy"])) {
      reasons.push(`High Caffeine (${caffeineMg > 0 ? caffeineMg + 'mg' : '>200mg'}): Constricts uterine and placental arteries, restricting oxygen and nutrients to the baby and increasing risk of low birth weight.`);
    }

    // 8. Raw Sprouts
    if (containsAny(combined, ["raw sprouts", "alfalfa", "clover sprouts"])) {
      reasons.push("Raw Sprouts: Warm, humid germination conditions foster deep bacterial growth of Salmonella and E. coli inside the seeds that cannot be rinsed away.");
    }

    // 9. Vitamin A / Retinol
    if (containsAny(combined, ["retinol", "retin-a", "high dose vitamin a"])) {
      reasons.push("Preformed Vitamin A (Retinol): High supplemental doses are teratogenic, directly causing congenital cardiovascular and craniofacial malformations.");
    }

    // 10. Maternal Conditions
    if (hasHypertension && (sodiumMg > 400 || combined.includes("sodium") || combined.includes("salt"))) {
      reasons.push(`Excessive Sodium (${sodiumMg > 0 ? Math.round(sodiumMg) + 'mg' : 'High'}): Dangerously increases vascular pressure, worsening gestational hypertension and preeclampsia.`);
    }
    if (hasDiabetes && (sugarG > 15 || combined.includes("sugar"))) {
      reasons.push(`High Refined Sugar (${sugarG > 0 ? Math.round(sugarG) + 'g' : 'High'}): Rapidly triggers extreme maternal blood glucose spikes, increasing risks of fetal macrosomia and birth complications.`);
    }

    // Include other rule hits if not already covered
    for (const hit of ruleHits) {
      if (hit.severity === AVOID) {
        const key = hit.key;
        if (key === "alcohol_beverage" && reasons.some(r => r.toLowerCase().includes("alcohol") || r.toLowerCase().includes("ethanol"))) continue;
        if (key === "pan_masala_tobacco" && reasons.some(r => r.toLowerCase().includes("pan masala") || r.toLowerCase().includes("areca"))) continue;
        if (key === "raw_animal_food" && reasons.some(r => r.toLowerCase().includes("raw") || r.toLowerCase().includes("unpasteurized") || r.toLowerCase().includes("listeria"))) continue;
        if (key === "papaya" && reasons.some(r => r.toLowerCase().includes("papaya"))) continue;
        if (key === "mercury_fish" && reasons.some(r => r.toLowerCase().includes("mercury"))) continue;
        if (key === "excess_caffeine" && reasons.some(r => r.toLowerCase().includes("caffeine"))) continue;
        if (!reasons.some(r => r.toLowerCase().includes(hit.message.toLowerCase()))) {
          reasons.push(`High Risk Ingredient: ${hit.message}`);
        }
      }
    }

    // Fallback if still empty
    if (reasons.length === 0) {
      reasons.push("Microbial / Toxin Risk: Contains ingredients categorized as high-risk during pregnancy due to maternal immune suppression and potential fetal vulnerability.");
      reasons.push("Fetal Safety Warning: Medical guidelines advise strictly avoiding this product throughout all trimesters of pregnancy.");
    }
  }

  // ===============================================
  // 2. CONSUME_WITH_CAUTION: Why to exercise caution
  // ===============================================
  else if (classification === CAUTION) {
    let hasCoveredSodium = false;
    let hasCoveredSugar = false;
    let hasCoveredFat = false;
    let hasCoveredCaffeine = false;
    let hasCoveredSpice = false;
    let hasCoveredAdditives = false;

    if (sodiumMg > 700 || containsAny(combined, ULTRA_PROCESSED_TERMS) || containsAny(combined, ["salted", "ramen", "soup"])) {
      reasons.push(`Elevated Sodium (${sodiumMg > 0 ? Math.round(sodiumMg) + 'mg' : 'High'}): Promotes excessive water retention, worsening maternal peripheral edema (swelling of feet/hands) and elevating blood pressure.`);
      hasCoveredSodium = true;
    }
    if (sugarG > 25 || containsAny(combined, HIGH_SUGAR_SWEET_TERMS)) {
      reasons.push(`High Refined Sugar (${sugarG > 0 ? Math.round(sugarG) + 'g' : 'Elevated'}): Rapidly spikes maternal blood glucose levels, escalating the risk of gestational diabetes and excessive fetal weight gain.`);
      hasCoveredSugar = true;
    }
    if (transFatG >= 1 || containsAny(combined, ["palmolein", "palm oil", "hydrogenated", "vanaspati", "deep fried"])) {
      reasons.push("Trans & Saturated Fats: Deep-fried with processed oils that cause maternal heartburn, gastric acid reflux, and offer low nutrient density for fetal growth.");
      hasCoveredFat = true;
    }
    if ((caffeineMg > 100 && caffeineMg <= 200) || containsAny(combined, ["coffee", "espresso", "latte", "cappuccino", "black tea", "green tea"])) {
      reasons.push(`Moderate Caffeine (${caffeineMg > 0 ? Math.round(caffeineMg) + 'mg' : 'Moderate'}): Must stay strictly under 200mg per day from all sources to avoid constricting placental blood flow.`);
      hasCoveredCaffeine = true;
    }
    if (containsAny(combined, ["msg", "monosodium glutamate", "preservative", "artificial flavor", "sodium benzoate"])) {
      reasons.push("Artificial Additives & Preservatives: Chemical flavor enhancers and preservatives offer empty calories and can trigger maternal fluid retention and digestive discomfort.");
      hasCoveredAdditives = true;
    }
    if (containsAny(combined, ["deli", "hot dog", "bacon", "sausage", "ham", "salami"])) {
      reasons.push("Processed Cured Meats: High in sodium and nitrates; must be heated until steaming hot before eating to kill any lingering Listeria bacteria.");
    }
    if (containsAny(combined, ["spicy", "chili", "hot sauce", "masala"])) {
      reasons.push("Spicy & Acidic Spices: Highly prone to triggering or worsening pregnancy-induced acid reflux, heartburn, and stomach irritation common in the 2nd and 3rd trimesters.");
      hasCoveredSpice = true;
    }

    // Include other CAUTION rule hits only if category not already covered
    for (const hit of ruleHits) {
      if (hit.severity === CAUTION) {
        const msg = hit.message.toLowerCase();
        if (hasCoveredSodium && (msg.includes("sodium") || msg.includes("salt") || msg.includes("swelling"))) continue;
        if (hasCoveredSugar && (msg.includes("sugar") || msg.includes("glucose"))) continue;
        if (hasCoveredFat && (msg.includes("fat") || msg.includes("palmolein"))) continue;
        if (hasCoveredCaffeine && msg.includes("caffeine")) continue;
        if (hasCoveredSpice && (msg.includes("spice") || msg.includes("masala"))) continue;
        if (hasCoveredAdditives && (msg.includes("additive") || msg.includes("preservative"))) continue;
        if (!reasons.some(r => r.toLowerCase().includes(msg))) {
          reasons.push(`Dietary Precaution: ${hit.message}`);
        }
      }
    }

    if (reasons.length === 0) {
      reasons.push("Nutritional Moderation: Contains ingredients that should be enjoyed in controlled portions to maintain balanced maternal nutrition.");
      reasons.push("Digestive Sensitivity: May contribute to pregnancy heartburn or digestive discomfort if consumed in large quantities.");
    }
  }

  // ==========================================
  // 3. SAFE: Why it is safe to consume
  // ==========================================
  else {
    // Dairy (Milk, Yogurt, Cheese, Curd, Paneer)
    if (containsAny(combined, ["milk", "yogurt", "curd", "paneer", "cheese", "dairy", "cheddar"])) {
      reasons.push("Pasteurized Dairy: Heat-treated (pasteurized) to eliminate harmful bacteria like Listeria, making it safe for mother and baby.");
      reasons.push("Bioavailable Calcium: Provides essential calcium to support the formation of fetal bones, tooth buds, and a steady heart rhythm without depleting maternal bone stores.");
      reasons.push("High-Quality Protein: Supplies complete amino acids required for rapid fetal cellular division and maternal uterine expansion.");
    }

    // Green leafy veggies & cruciferous (Spinach, Broccoli, Methi, Palak, Kale)
    else if (containsAny(combined, ["spinach", "broccoli", "palak", "methi", "kale", "lettuce", "cabbage", "greens", "leafy"])) {
      reasons.push("Rich in Folate (Vitamin B9): Essential for early fetal neural tube closure and prevention of spinal birth defects (spina bifida).");
      reasons.push("Non-Heme Iron: Supports expanding maternal blood volume, carrying oxygen across the placenta to prevent gestational anemia" + (hasAnemia ? " (highly recommended for your anemia profile)." : "."));
      reasons.push("Dietary Fiber: Helps regulate bowel motility and provides natural relief from common pregnancy-induced constipation.");
    }

    // Cooked Eggs
    else if (containsAny(combined, ["egg", "eggs", "omelet", "boiled egg"])) {
      reasons.push("High in Choline: Essential nutrient vital for fetal brain architecture, memory center (hippocampus) formation, and neural cell division.");
      reasons.push("Complete Bioavailable Protein: Provides complete amino acids supporting rapid placental growth and fetal tissue development.");
      reasons.push("Thoroughly Cooked: Cooked to eliminate any risk of Salmonella bacteria, making it fully safe during pregnancy.");
    }

    // Cooked Salmon & Low-Mercury Fish
    else if (containsAny(combined, ["salmon", "cooked fish", "trout", "sardine", "tilapia", "cod"])) {
      reasons.push("DHA & EPA Omega-3 Fatty Acids: Crucial for fetal brain development, cognitive signaling, and retinal eye maturation.");
      reasons.push("Low Methylmercury: Safely low in marine heavy metals and fully cooked to eliminate marine parasites and bacteria.");
      reasons.push("Lean Protein: Supplies essential amino acids without excess saturated fats.");
    }

    // Avocado
    else if (containsAny(combined, ["avocado"])) {
      reasons.push("Healthy Monounsaturated Fats: Essential for fetal brain and neural tissue development and helps the mother absorb fat-soluble vitamins.");
      reasons.push("Folate & Potassium: Provides natural folates for cell growth and potassium to help regulate maternal blood pressure and prevent leg cramps.");
      reasons.push("Gentle Dietary Fiber: Promotes digestive comfort and stable maternal blood glucose levels.");
    }

    // Legumes, Dal, Lentils, Beans, Chickpeas
    else if (containsAny(combined, ["dal", "lentil", "lentils", "beans", "chickpea", "chana", "moong", "toor", "urad", "edamame"])) {
      reasons.push("Plant-Based Iron & Folate: Supplies key micronutrients needed for fetal red blood cell synthesis and cellular replication.");
      reasons.push("Complex Carbohydrates & Protein: Low glycemic index provides sustained, slow-release maternal energy without causing blood sugar crashes.");
      reasons.push("Prebiotic Fiber: Nourishes healthy maternal gut flora and prevents constipation.");
    }

    // Whole grains & Oats
    else if (containsAny(combined, ["oat", "oats", "oatmeal", "brown rice", "whole wheat", "roti", "quinoa", "barley"])) {
      reasons.push("B-Complex Vitamins: Rich in thiamine, niacin, and riboflavin that power maternal energy metabolism and cell development.");
      reasons.push("Soluble Dietary Fiber: Helps regulate maternal cholesterol and supports stable blood sugar management.");
    }

    // Fruits (Apple, Banana, Orange, Berries, Mango, Guava, Kiwi, Sweet Potato)
    else if (containsAny(combined, ["apple", "banana", "orange", "berry", "berries", "strawberry", "blueberry", "mango", "guava", "sweet potato", "carrot"])) {
      reasons.push("Vitamin C & Antioxidants: Boosts maternal immune defenses and significantly enhances the absorption of dietary iron from meals.");
      reasons.push("Potassium & Electrolytes: Helps regulate maternal fluid balance, reducing the incidence of painful pregnancy leg muscle cramps.");
      reasons.push("Natural Pectin & Fiber: Supports gentle digestion and prevents blood sugar spikes compared to processed sweets.");
    }

    // Nuts & Seeds (Almond, Walnut, Chia, Flax)
    else if (containsAny(combined, ["almond", "walnut", "cashew", "chia", "flax", "sunflower seed", "pumpkin seed"])) {
      reasons.push("Alpha-Linolenic Acid (Omega-3) & Vitamin E: Protects developing fetal cell membranes and supports maternal skin elasticity.");
      reasons.push("Magnesium & Plant Protein: Helps relax maternal uterine musculature and reduces the risk of pre-term uterine irritability.");
    }

    // Prenatal Vitamins / Supplements
    else if (containsAny(combined, ["prenatal", "vitamin", "folic acid", "iron supplement", "calcium supplement"])) {
      reasons.push("Standardized Medical Supplementation: Delivers targeted micronutrients (folic acid, iron, iodine) matching clinical pregnancy RDAs to prevent nutritional deficiencies.");
      reasons.push("Zero Microbial Risk: Pharmaceutical formulation free of pathogens and foodborne contaminants.");
    }

    // General safe food items
    else {
      reasons.push("Nutrient-Dense & Wholesome: Formulated with pregnancy-safe ingredients that provide balanced nourishment without maternal health contraindications.");
      reasons.push("Standard Food Safety: Produced under standard clean food-handling conditions without high-risk raw animal products or pathogen risks.");
      reasons.push("Safe Daily Moderation: Safe to consume in typical daily portion sizes as part of a well-rounded prenatal diet.");
    }
  }

  // Clean all reasons so no percentages ever exist in text
  return reasons.map(r => stripPercentages(r));
}

export async function evaluatePregnancySafety(
  detectedFood: string,
  ingredients: string[],
  nutrients: any,
  profile: any,
  aiAllergies: string[] = []
) {
  const foodNameLower = (detectedFood || "").toLowerCase();
  const textBlob = ingredients.join(" ").toLowerCase();
  const ruleHits: RuleHit[] = [];

  const caffeineMg = parseFloat(nutrients?.caffeine_mg || 0);
  const sugarG = parseFloat(nutrients?.sugar_g || 0);
  const sodiumMg = parseFloat(nutrients?.sodium_mg || 0);
  const transFatG = parseFloat(nutrients?.trans_fat_g || 0);

  // 1. Allergies
  const allergies = (profile?.allergies || []).map((a: string) => a.trim().toLowerCase());
  
  const allergenSynonyms: Record<string, string[]> = {
    "dairy": ["milk", "cheese", "butter", "cream", "whey", "casein", "yogurt", "paneer", "ghee", "dairy", "lactose", "curd"],
    "milk": ["milk", "cheese", "butter", "cream", "whey", "casein", "yogurt", "paneer", "ghee", "dairy", "lactose", "curd"],
    "nut": ["nut", "almond", "pecan", "walnut", "cashew", "pistachio", "macadamia", "hazelnut", "peanut"],
    "nuts": ["nut", "almond", "pecan", "walnut", "cashew", "pistachio", "macadamia", "hazelnut", "peanut"],
    "peanut": ["peanut", "groundnut"],
    "peanuts": ["peanut", "groundnut"],
    "soy": ["soy", "soya", "tofu", "edamame", "tempeh", "miso"],
    "wheat": ["wheat", "flour", "bread", "gluten", "pasta", "semolina", "maida", "suji"],
    "gluten": ["wheat", "flour", "bread", "gluten", "pasta", "semolina", "maida", "suji", "barley", "rye", "oats"],
    "egg": ["egg", "albumen", "mayo", "meringue", "ovalbumin"],
    "eggs": ["egg", "albumen", "mayo", "meringue", "ovalbumin"],
    "fish": ["fish", "salmon", "tuna", "cod", "tilapia", "anchovy", "sardine", "mackerel"],
    "shellfish": ["shrimp", "crab", "lobster", "prawn", "oyster", "scallop", "mussel", "clam"],
    "seafood": ["fish", "salmon", "tuna", "cod", "tilapia", "anchovy", "sardine", "mackerel", "shrimp", "crab", "lobster", "prawn", "oyster", "scallop", "mussel", "clam"],
  };

  const combinedFoodText = (foodNameLower + " " + textBlob).toLowerCase();
  
  // A. Use AI-triggered allergies if available
  const processedAiAllergies = new Set<string>();
  if (aiAllergies && aiAllergies.length > 0) {
    for (const alg of aiAllergies) {
      if (alg) {
        ruleHits.push({
          key: "allergen_match_ai",
          severity: AVOID,
          message: `Contains ingredients triggering your allergy: '${alg}'!`
        });
        processedAiAllergies.add(alg.toLowerCase());
      }
    }
  }

  // B. Fallback local matching
  for (const allergy of allergies) {
    if (!allergy || processedAiAllergies.has(allergy)) continue;
    
    let isMatch = combinedFoodText.includes(allergy);
    let matchedTerm = allergy;
    
    if (!isMatch && allergenSynonyms[allergy]) {
      const foundSynonym = allergenSynonyms[allergy].find(syn => combinedFoodText.includes(syn));
      if (foundSynonym) {
        isMatch = true;
        matchedTerm = foundSynonym;
      }
    }

    if (isMatch) {
      ruleHits.push({ 
        key: "allergen_match", 
        severity: AVOID, 
        message: `Contains '${matchedTerm}', which matches your '${allergy}' allergy!` 
      });
    }
  }

  // 2. Diet
  const diet = (profile?.diet_preference || "general").toLowerCase();
  if (diet === "vegetarian") {
    const terms = ["chicken", "beef", "pork", "meat", "fish", "gelatin", "anchovy", "shrimp", "bacon", "mutton", "egg"];
    const matched = terms.filter(t => textBlob.includes(t));
    if (matched.length > 0) {
      ruleHits.push({ key: "diet_preference_mismatch", severity: AVOID, message: `Contains animal-derived ingredients (${matched.join(", ")}) which does not match your vegetarian preference.` });
    }
  } else if (diet === "vegan") {
    const terms = ["chicken", "beef", "pork", "meat", "fish", "gelatin", "anchovy", "shrimp", "bacon", "mutton", "milk", "egg", "cheese", "butter", "honey", "whey", "casein", "cream", "yogurt", "curd", "lactate", "lactose"];
    const matched = terms.filter(t => textBlob.includes(t));
    if (matched.length > 0) {
      ruleHits.push({ key: "diet_preference_mismatch", severity: AVOID, message: `Contains dairy or animal-derived ingredients (${matched.join(", ")}) which does not match your vegan preference.` });
    }
  }

  // 3. Medical
  const conditions = (profile?.medical_conditions || []).map((c: string) => c.toLowerCase());
  const hasDiabetes = conditions.includes("diabetes") || conditions.includes("gestational diabetes");
  const hasHypertension = conditions.includes("hypertension") || conditions.includes("preeclampsia") || conditions.includes("high blood pressure");
  const hasAnemia = conditions.includes("anemia");

  // 4. Trimester
  const trimester = parseInt(profile?.trimester || 1);
  if (trimester === 1) {
    if (caffeineMg > 150) {
      ruleHits.push({ key: "first_trimester_caffeine", severity: AVOID, message: "Caffeine strictly limited (<150mg) in 1st trimester." });
    }
  } else {
    if (caffeineMg > 200) {
      ruleHits.push({ key: "high_caffeine", severity: AVOID, message: "High caffeine should be avoided." });
    }
  }

  // Universal dangerous foods based on name or ingredients
  const combinedText = (foodNameLower + " " + textBlob).toLowerCase();

  // Fetch dynamic rules from Supabase
  try {
    const { data: dbRules, error } = await supabase.from('food_safety_rules').select('*');
    if (!error && dbRules && dbRules.length > 0) {
      for (const rule of dbRules) {
        if (containsAny(combinedText, rule.keywords)) {
          ruleHits.push({ key: `db_rule_${rule.id}`, severity: rule.severity, message: rule.message });
        }
      }
    }
  } catch (err) {
    console.error("Failed to fetch dynamic rules from Supabase", err);
  }

  // Built-in absolute safety rules
  // 1. ALCOHOL & ALCOHOLIC BEVERAGES (Absolute AVOID)
  if (containsAny(combinedText, ALCOHOL_TERMS)) {
    ruleHits.push({ 
      key: "alcohol_beverage", 
      severity: AVOID, 
      message: "Alcohol (beer, lager, wine, spirits) passes directly into fetal circulation with no safe threshold, causing Fetal Alcohol Spectrum Disorders." 
    });
  }

  // 2. PAN MASALA, GUTKA, BETEL NUT (SUPARI), TOBACCO (Absolute AVOID)
  if (containsAny(combinedText, PAN_MASALA_TOBACCO_TERMS)) {
    ruleHits.push({ 
      key: "pan_masala_tobacco", 
      severity: AVOID, 
      message: "Pan masala, betel nut (supari), and tobacco are Group 1 carcinogens and proven reproductive toxins that cause uterine contractions, miscarriage, and fetal growth restriction." 
    });
  }

  // 3. RAW / UNDERCOOKED / UNPASTEURIZED (Absolute AVOID)
  if (containsAny(combinedText, RAW_MICROBIAL_TERMS)) {
    ruleHits.push({ 
      key: "raw_animal_food", 
      severity: AVOID, 
      message: "Raw or unpasteurized foods carry high infection risks of Listeria, Salmonella, and Toxoplasma." 
    });
  }

  // 4. UNRIPE PAPAYA (Absolute AVOID)
  if (containsAny(combinedText, PAPAYA_TERMS)) {
    ruleHits.push({ 
      key: "papaya", 
      severity: AVOID, 
      message: "Unripe papaya contains latex and papain which can trigger uterine contractions." 
    });
  }

  // 5. HIGH MERCURY PREDATORY FISH (Absolute AVOID)
  if (containsAny(combinedText, MERCURY_FISH_TERMS)) {
    ruleHits.push({ 
      key: "mercury_fish", 
      severity: AVOID, 
      message: "High mercury predatory fish accumulate neurotoxic heavy metals that impair fetal brain development." 
    });
  }

  // 6. ULTRA-PROCESSED SNACKS (CAUTION)
  if (containsAny(combinedText, ULTRA_PROCESSED_TERMS)) {
    ruleHits.push({ 
      key: "junk_food", 
      severity: CAUTION, 
      message: "Ultra-processed snacks are high in sodium, trans fats, and artificial additives." 
    });
  }

  // 7. HIGH SUGAR SWEETS (CAUTION)
  if (containsAny(combinedText, HIGH_SUGAR_SWEET_TERMS)) {
    ruleHits.push({ 
      key: "high_sugar_food", 
      severity: CAUTION, 
      message: "Contains excessive refined sugar which can spike blood glucose." 
    });
  }

  if (transFatG >= 1) ruleHits.push({ key: "trans_fat", severity: CAUTION, message: "Trans fats should be minimized." });
  if (sugarG > 25 || (hasDiabetes && sugarG > 15)) ruleHits.push({ key: "excess_sugar", severity: hasDiabetes ? AVOID : CAUTION, message: "High sugar content should be limited." });
  if (hasHypertension && sodiumMg > 400) ruleHits.push({ key: "high_sodium_hypertension", severity: AVOID, message: "High sodium unsafe for gestational hypertension." });
  else if (sodiumMg > 700) ruleHits.push({ key: "high_sodium", severity: CAUTION, message: "High sodium foods can worsen swelling." });

  const UNSAFE_ING_PATTERNS = [
    "alcohol", "ethanol", "beer", "lager", "ale", "wine", "rum", "vodka", "whiskey", "whisky", "liquor", "liqueur", "spirit",
    "supari", "betel nut", "areca", "pan masala", "gutka", "tobacco", "nicotine", "khaini", "zarda",
    "raw fish", "sushi", "sashimi", "raw meat", "raw beef", "raw egg", "unpasteurized", "raw milk", "brie", "camembert", "blue cheese", "feta", "raw sprouts",
    "papaya", "saccharin", "shark", "swordfish", "king mackerel"
  ];

  const MODERATE_ING_PATTERNS = [
    "sugar", "high fructose corn syrup", "corn syrup", "glucose syrup", "fructose", "sucrose", "dextrose", "invert sugar", "maltodextrin", "syrup",
    "sweetener", "aspartame", "sucralose", "acesulfame", "sorbitol",
    "salt", "sodium", "monosodium glutamate", "msg",
    "palmolein", "palm oil", "hydrogenated", "trans fat", "shortening", "vanaspati",
    "preservative", "sodium benzoate", "potassium sorbate", "nitrate", "nitrite", "bha", "bht", "tbhq",
    "artificial flavor", "artificial color", "caffeine", "coffee", "tea extract",
    "chili", "spicy", "masala"
  ];

  const ingredientsAnalysis = ingredients
    .map(ing => ing.trim())
    .filter(ing => ing.length > 1 && !/^\d+%\)?$/i.test(ing) && !/^[\d\s.,()%+\-]+$/.test(ing))
    .map(ing => {
      const ingLower = ing.toLowerCase();
      let safety = "Safe";
      if (UNSAFE_ING_PATTERNS.some(pat => ingLower.includes(pat))) {
        safety = "Unsafe";
      } else if (MODERATE_ING_PATTERNS.some(pat => ingLower.includes(pat))) {
        safety = "Moderate";
      }
      return { name: ing.trim().substring(0, 30), safety };
    });

  // Sync ingredients analysis with rule hits
  for (const ing of ingredientsAnalysis) {
    if (ing.safety === "Unsafe" && !ruleHits.some(r => r.message.toLowerCase().includes(ing.name.toLowerCase()))) {
      ruleHits.push({ key: `unsafe_${ing.name}`, severity: AVOID, message: `Contains unsafe ingredient: ${ing.name}` });
    }
    if (ing.safety === "Moderate" && !ruleHits.some(r => r.severity === CAUTION)) {
      ruleHits.push({ key: `mod_${ing.name}`, severity: CAUTION, message: `Contains ${ing.name} which should be limited.` });
    }
  }

  let final = SAFE;
  if (ruleHits.some(r => r.severity === AVOID)) final = AVOID;
  else if (ruleHits.some(r => r.severity === CAUTION)) final = CAUTION;

  const nutrientInsights: Array<{ name: string; benefit: string }> = [];

  let alternatives: string[] = [];
  if (final !== SAFE) {
    if (containsAny(foodNameLower, ALCOHOL_TERMS)) {
      alternatives = ["Sparkling Water with Lime", "Fresh Coconut Water", "Fruit Mocktail (alcohol-free)"];
    } else if (containsAny(foodNameLower, PAN_MASALA_TOBACCO_TERMS)) {
      alternatives = ["Roasted Fennel Seeds (Saunf)", "Dry Roasted Makhana", "Cardamom (Elaichi) Pods"];
    } else if (foodNameLower.includes("sushi")) {
      alternatives = ["Cooked salmon sushi", "Vegetable sushi"];
    } else if (containsAny(foodNameLower, ULTRA_PROCESSED_TERMS)) {
      alternatives = ["Roasted Makhana", "Whole Wheat Vegetable Roti Roll", "Baked Sweet Potato Wedges"];
    } else if (containsAny(foodNameLower, HIGH_SUGAR_SWEET_TERMS) || foodNameLower.includes("pineapple")) {
      alternatives = ["Fresh Fruit Bowl", "Medjool Dates", "Dark Chocolate (moderate)"];
    } else if (foodNameLower.includes("papaya")) {
      alternatives = ["Fresh Mango", "Banana", "Sweet Apple"];
    } else if (diet === "vegan") {
      alternatives = ["Almond milk", "Fresh fruit", "Roasted seeds"];
    } else {
      alternatives = ["Pasteurized Milk", "Fresh fruit bowl", "Fresh Curd/Yogurt"];
    }
  }

  let safetyScore = 95;
  // Deterministic scoring based on classification and food type (no random)
  if (final === AVOID || foodNameLower.includes("sushi") || foodNameLower.includes("papaya")) {
    // High-risk foods get a consistent low score
    safetyScore = 15;
  } else if (foodNameLower.includes("kurkure") || foodNameLower.includes("chips")) {
    safetyScore = 40;
  } else if (foodNameLower.includes("jamun") || foodNameLower.includes("sweet")) {
    safetyScore = 60;
  } else if (final === CAUTION) {
    safetyScore = Math.max(45, 80 - ruleHits.filter(r => r.severity === CAUTION).length * 8);
  }

  const whyReasons = generateDetailedPregnancyReasons(
    detectedFood,
    ingredients,
    nutrients,
    final,
    ruleHits,
    profile
  );

  let trimesterRisk = null;
  if (final === AVOID || foodNameLower.includes("sushi") || foodNameLower.includes("papaya")) trimesterRisk = "Unsafe in all trimesters";
  else if (trimester === 1 && ruleHits.some(r => r.key === "trimester_one_risk" || r.key === "first_trimester_caffeine")) trimesterRisk = "Unsafe in 1st trimester";

  let recommendation = "Safe to consume in normal portions";
  if (final === AVOID) recommendation = "Do not consume during pregnancy";
  else if (foodNameLower.includes("noodle") || foodNameLower.includes("kurkure") || foodNameLower.includes("chips")) recommendation = "Avoid if possible, or eat rarely";
  else if (final === CAUTION) recommendation = "Consume in moderation";

  const sources = (final === AVOID) ? ["WHO", "CDC", "FDA"] : ["WHO", "FSSAI", "NIN"];

  const references = (final === AVOID) 
    ? [
        { title: "WHO Guidelines", url: "https://www.who.int/health-topics/pregnancy" },
        { title: "CDC Advice", url: "https://www.cdc.gov/pregnancy/" },
        { title: "FDA Food Safety", url: "https://www.fda.gov/food/people-risk-foodborne-illness/meat-poultry-seafood-food-safety-moms-be" }
      ]
    : [
        { title: "WHO Guidelines", url: "https://www.who.int/health-topics/pregnancy" },
        { title: "FSSAI Standards", url: "https://fssai.gov.in/" },
        { title: "NIN Diet Guide", url: "https://www.nin.res.in/" }
      ];

  return { final, ruleHits, nutrientInsights, alternatives, safetyScore, whyReasons, trimesterRisk, ingredientsAnalysis, recommendation, sources, references };
}
