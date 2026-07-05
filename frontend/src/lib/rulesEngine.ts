export const SAFE = "SAFE";
export const CAUTION = "CONSUME_WITH_CAUTION";
export const AVOID = "AVOID_DURING_PREGNANCY";

export interface RuleHit {
  key: string;
  severity: string;
  message: string;
}

import { supabase } from './supabase';

export function containsAny(textBlob: string, terms: string[]): boolean {
  return terms.some(term => new RegExp(`\\b${term}\\b`, 'i').test(textBlob));
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

  // Built-in absolute fallback rules (in case db fetch fails)
  if (containsAny(combinedText, ["alcohol", "ethanol", "beer", "wine", "rum", "vodka"])) {
    ruleHits.push({ key: "alcohol", severity: AVOID, message: "Alcohol is not safe during pregnancy." });
  }
  if (containsAny(combinedText, ["sushi", "raw fish", "raw meat", "unpasteurized"])) {
    ruleHits.push({ key: "raw_animal_food", severity: AVOID, message: "Raw or unpasteurized foods carry high infection risks." });
  }
  if (containsAny(combinedText, ["papaya", "unripe papaya"])) {
    ruleHits.push({ key: "papaya", severity: AVOID, message: "Papaya contains latex which can trigger uterine contractions." });
  }
  if (containsAny(combinedText, ["kurkure", "lays", "chips", "doritos", "cheetos"])) {
    ruleHits.push({ key: "junk_food", severity: CAUTION, message: "Ultra-processed snacks are high in sodium, trans fats, and artificial additives." });
  }
  if (containsAny(combinedText, ["gulab jamun", "jalebi", "rasgulla", "candy", "sweet"])) {
    ruleHits.push({ key: "high_sugar_food", severity: CAUTION, message: "Contains excessive refined sugar which can spike blood glucose." });
  }

  if (transFatG >= 1) ruleHits.push({ key: "trans_fat", severity: CAUTION, message: "Trans fats should be minimized." });
  if (sugarG > 25 || (hasDiabetes && sugarG > 15)) ruleHits.push({ key: "excess_sugar", severity: hasDiabetes ? AVOID : CAUTION, message: "High sugar content should be limited." });
  if (hasHypertension && sodiumMg > 400) ruleHits.push({ key: "high_sodium_hypertension", severity: AVOID, message: "High sodium unsafe for gestational hypertension." });
  else if (sodiumMg > 700) ruleHits.push({ key: "high_sodium", severity: CAUTION, message: "High sodium foods can worsen swelling." });

  const ingredientsAnalysis = ingredients.map(ing => {
    const ingLower = ing.toLowerCase();
    let safety = "Safe";
    if (ingLower.includes("msg") || ingLower.includes("salt") || ingLower.includes("sugar") || ingLower.includes("palmolein") || ingLower.includes("preservative") || ingLower.includes("artificial") || ingLower.includes("flavor")) safety = "Moderate";
    else if (ingLower.includes("raw fish") || ingLower.includes("alcohol") || ingLower.includes("papaya") || ingLower.includes("saccharin")) safety = "Unsafe";
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

  const ironText = "Supports oxygen transport." + (hasAnemia ? " (Highly recommended)" : "");
  const nutrientInsights = [
    { name: "Iron", benefit: ironText },
    { name: "Folic Acid", benefit: "Helps neural tube development." },
    { name: "Calcium", benefit: "Supports strong bones." }
  ];

  let alternatives: string[] = [];
  if (final !== SAFE) {
    if (foodNameLower.includes("sushi")) alternatives = ["Cooked salmon sushi", "Vegetable sushi"];
    else if (foodNameLower.includes("noodle") || foodNameLower.includes("maggi") || foodNameLower.includes("kurkure")) alternatives = ["Roasted Makhana", "Baked Sweet Potato Fries"];
    else if (foodNameLower.includes("jamun") || foodNameLower.includes("sweet")) alternatives = ["Dates", "Fresh Fruit Bowl", "Dark Chocolate (moderate)"];
    else if (foodNameLower.includes("papaya")) alternatives = ["Mango", "Banana", "Apple"];
    else if (diet === "vegan") alternatives = ["Almond milk", "Fresh fruit"];
    else alternatives = ["Milk", "Fresh fruit", "Yogurt"];
  }

  let safetyScore = 95;
  if (final === AVOID || foodNameLower.includes("sushi") || foodNameLower.includes("papaya")) safetyScore = Math.floor(Math.random() * 15) + 15; // 15-30
  else if (foodNameLower.includes("kurkure") || foodNameLower.includes("chips")) safetyScore = Math.floor(Math.random() * 10) + 40; // 40-50
  else if (foodNameLower.includes("jamun") || foodNameLower.includes("sweet")) safetyScore = Math.floor(Math.random() * 15) + 50; // 50-65
  else if (final === CAUTION) safetyScore = Math.max(45, 80 - ruleHits.filter(r => r.severity === CAUTION).length * 8);

  let whyReasons = ["Contains safe ingredients", "Provides nutrients"];
  if (final !== SAFE) {
    whyReasons = ruleHits.slice(0, 3).map(r => r.message);
  }

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
