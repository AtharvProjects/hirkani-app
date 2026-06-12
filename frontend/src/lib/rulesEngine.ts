export const SAFE = "SAFE";
export const CAUTION = "CONSUME_WITH_CAUTION";
export const AVOID = "AVOID_DURING_PREGNANCY";

export interface RuleHit {
  key: string;
  severity: string;
  message: string;
}

function containsAny(textBlob: string, terms: string[]): boolean {
  const t = textBlob.toLowerCase();
  return terms.some(term => t.includes(term.toLowerCase()));
}

export function evaluatePregnancySafety(
  detectedFood: string,
  ingredients: string[],
  nutrients: any,
  profile: any
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
  for (const allergy of allergies) {
    if (allergy && textBlob.includes(allergy)) {
      ruleHits.push({ key: "allergen_match", severity: AVOID, message: `Contains ingredients matching your allergen profile: '${allergy}'!` });
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

  if (containsAny(combinedText, ["papaya"])) {
    ruleHits.push({ key: "papaya_risk", severity: AVOID, message: "Unripe or semi-ripe papaya contains latex which can trigger premature contractions. It is strongly advised to avoid it during pregnancy." });
  }
  if (containsAny(combinedText, ["fenugreek", "methi"])) {
    ruleHits.push({ key: "fenugreek_risk", severity: CAUTION, message: "Fenugreek/Methi in large medicinal amounts can stimulate contractions. Culinary use is generally safe." });
  }
  if (containsAny(combinedText, ["bromelain", "pineapple"])) {
    ruleHits.push({ key: "pineapple_risk", severity: CAUTION, message: "Large amounts of pineapple contain bromelain which can soften the cervix." });
  }
  if (containsAny(combinedText, ["alcohol", "ethanol", "beer", "wine", "rum", "vodka"])) {
    ruleHits.push({ key: "alcohol", severity: AVOID, message: "Alcohol is not safe during pregnancy." });
  }
  if (containsAny(combinedText, ["saccharin", "aspartame", "sucralose"])) {
    ruleHits.push({ key: "artificial_sweeteners", severity: CAUTION, message: "Artificial sweeteners should be limited." });
  }
  if (containsAny(combinedText, ["sodium benzoate", "nitrite", "nitrate", "msg", "monosodium glutamate"])) {
    ruleHits.push({ key: "preservatives", severity: CAUTION, message: "Contains high preservatives." });
  }
  if (containsAny(combinedText, ["sushi", "raw fish", "raw egg", "runny egg", "raw meat", "unpasteurized", "sprout", "raw milk"])) {
    ruleHits.push({ key: "raw_animal_food", severity: AVOID, message: "Raw or unpasteurized foods carry high infection risks (Listeria, Salmonella)." });
  }
  if (containsAny(combinedText, ["shark", "swordfish", "king mackerel", "tilefish"])) {
    ruleHits.push({ key: "high_mercury_fish", severity: AVOID, message: "High-mercury fish must be avoided." });
  }
  if (transFatG >= 1) ruleHits.push({ key: "trans_fat", severity: CAUTION, message: "Trans fats should be minimized." });
  if (sugarG > 25 || (hasDiabetes && sugarG > 15)) ruleHits.push({ key: "excess_sugar", severity: hasDiabetes ? AVOID : CAUTION, message: "High sugar content should be limited." });
  if (hasHypertension && sodiumMg > 400) ruleHits.push({ key: "high_sodium_hypertension", severity: AVOID, message: "High sodium unsafe for gestational hypertension." });
  else if (sodiumMg > 700) ruleHits.push({ key: "high_sodium", severity: CAUTION, message: "High sodium foods can worsen swelling." });

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
    else if (foodNameLower.includes("noodle") || foodNameLower.includes("maggi")) alternatives = ["Whole wheat noodles"];
    else if (diet === "vegan") alternatives = ["Almond milk", "Fresh fruit"];
    else alternatives = ["Milk", "Fresh fruit", "Yogurt"];
  }

  let safetyScore = 95;
  if (foodNameLower.includes("sushi") || final === AVOID) safetyScore = 22;
  else if (foodNameLower.includes("noodle") || foodNameLower.includes("maggi")) safetyScore = 68;
  else if (final === CAUTION) safetyScore = Math.max(45, 80 - ruleHits.filter(r => r.severity === CAUTION).length * 6);

  let whyReasons = ["Contains safe ingredients", "Provides nutrients"];
  if (foodNameLower.includes("sushi")) whyReasons = ["Raw fish may contain parasites", "Listeria risk"];
  else if (foodNameLower.includes("noodle") || foodNameLower.includes("maggi")) whyReasons = ["High sodium content", "Low nutritional value"];
  else if (final !== SAFE) whyReasons = ruleHits.slice(0, 3).map(r => r.message);

  let trimesterRisk = null;
  if (final === AVOID || foodNameLower.includes("sushi")) trimesterRisk = "Unsafe in all trimesters";
  else if (trimester === 1 && ruleHits.some(r => r.key === "trimester_one_risk" || r.key === "first_trimester_caffeine")) trimesterRisk = "Unsafe in 1st trimester";

  const ingredientsAnalysis = ingredients.map(ing => {
    const ingLower = ing.toLowerCase();
    let safety = "Safe";
    if (ingLower.includes("msg") || ingLower.includes("salt") || ingLower.includes("sugar")) safety = "Moderate";
    else if (ingLower.includes("raw fish") || ingLower.includes("alcohol") || ingLower.includes("papaya")) safety = "Unsafe";
    return { name: ing.trim().substring(0, 20), safety };
  });

  let recommendation = "Safe to consume in normal portions";
  if (foodNameLower.includes("sushi") || final === AVOID) recommendation = "";
  else if (foodNameLower.includes("noodle") || foodNameLower.includes("maggi")) recommendation = "1-2 times/week maximum";
  else if (final === CAUTION) recommendation = "Consume in moderation";

  const sources = (foodNameLower.includes("sushi") || final === AVOID) ? ["WHO", "CDC", "FDA"] : ["WHO", "FSSAI", "NIN"];

  return { final, ruleHits, nutrientInsights, alternatives, safetyScore, whyReasons, trimesterRisk, ingredientsAnalysis, recommendation, sources };
}
