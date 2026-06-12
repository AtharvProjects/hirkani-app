export const SAFE = "SAFE";
export const CAUTION = "CONSUME_WITH_CAUTION";
export const AVOID = "AVOID_DURING_PREGNANCY";

export interface RuleHit {
  key: string;
  severity: string;
  message: string;
}

export interface PregnancyProfile {
  age: number;
  pregnancy_weeks: number;
  allergies: string[];
  medical_conditions: string[];
  diet_preference: string;
}

function containsAny(text: string, terms: string[]): boolean {
  const t = text.toLowerCase();
  return terms.some((term) => t.includes(term.toLowerCase()));
}

export function evaluatePregnancySafety(
  detectedFood: string,
  ingredients: string[],
  nutrients: Record<string, number>,
  profile: PregnancyProfile
) {
  let foodNameLower = detectedFood.toLowerCase();
  let finalIngredients = [...ingredients];

  // Backfill realistic ingredients and nutrients if empty/scant
  if (finalIngredients.length <= 1) {
    if (foodNameLower.includes("noodle") || foodNameLower.includes("maggi") || foodNameLower.includes("maggie")) {
      finalIngredients = ["Wheat Flour", "Palm Oil", "Salt", "MSG (Monosodium Glutamate)", "Spices"];
      if (!nutrients.sodium_mg) nutrients.sodium_mg = 820;
    } else if (foodNameLower.includes("sushi")) {
      finalIngredients = ["Raw Fish", "Rice", "Seaweed", "Vinegar", "Soy Sauce"];
      if (!nutrients.sodium_mg) nutrients.sodium_mg = 350;
    } else if (foodNameLower.includes("coffee") || foodNameLower.includes("espresso") || foodNameLower.includes("latte")) {
      finalIngredients = ["Coffee Extract", "Caffeine", "Milk", "Sugar"];
      if (!nutrients.caffeine_mg) nutrients.caffeine_mg = 140;
    } else if (foodNameLower.includes("avocado")) {
      finalIngredients = ["Avocado"];
    } else if (foodNameLower.includes("strawberry") || foodNameLower.includes("strawberries")) {
      finalIngredients = ["Strawberry"];
    } else if (foodNameLower.includes("curd") || foodNameLower.includes("yogurt")) {
      finalIngredients = ["Milk", "Active Cultures"];
    } else if (foodNameLower.includes("pizza")) {
      finalIngredients = ["Wheat Flour", "Cheese", "Tomato Sauce", "Olive Oil", "Salt"];
    } else if (foodNameLower.includes("burger")) {
      finalIngredients = ["Wheat Bun", "Processed Meat", "Cheese", "Salt", "Preservatives"];
    }
  }

  const textBlob = finalIngredients.join(" ").toLowerCase();
  const ruleHits: RuleHit[] = [];

  const caffeine_mg = nutrients.caffeine_mg || 0;
  const sugar_g = nutrients.sugar_g || 0;
  const sodium_mg = nutrients.sodium_mg || 0;
  const trans_fat_g = nutrients.trans_fat_g || 0;

  // 1. Allergies Check
  const allergies = (profile.allergies || []).map((a) => a.trim().toLowerCase());
  for (const allergy of allergies) {
    if (allergy && textBlob.includes(allergy)) {
      ruleHits.push({
        key: "allergen_match",
        severity: AVOID,
        message: `Contains ingredients matching your allergen profile: '${allergy}'!`,
      });
    }
  }

  // 2. Dietary Preference Check
  const diet = (profile.diet_preference || "general").toLowerCase();
  if (diet === "vegetarian" || diet === "veg") {
    const nonVegTerms = ["chicken", "beef", "pork", "meat", "fish", "gelatin", "anchovy", "shrimp", "bacon", "mutton", "egg"];
    const matched = nonVegTerms.filter((term) => textBlob.includes(term));
    if (matched.length > 0) {
      ruleHits.push({
        key: "diet_preference_mismatch",
        severity: AVOID,
        message: `Contains animal-derived ingredients (${matched.join(", ")}) which does not match your vegetarian preference.`,
      });
    }
  } else if (diet === "vegan") {
    const nonVeganTerms = [
      "chicken", "beef", "pork", "meat", "fish", "gelatin", "anchovy", "shrimp",
      "bacon", "mutton", "milk", "egg", "cheese", "butter", "honey", "whey",
      "casein", "cream", "yogurt", "curd", "lactate", "lactose"
    ];
    const matched = nonVeganTerms.filter((term) => textBlob.includes(term));
    if (matched.length > 0) {
      ruleHits.push({
        key: "diet_preference_mismatch",
        severity: AVOID,
        message: `Contains dairy or animal-derived ingredients (${matched.join(", ")}) which does not match your vegan preference.`,
      });
    }
  }

  // 3. Medical Conditions Check
  const conditions = (profile.medical_conditions || []).map((c) => c.toLowerCase());
  const hasDiabetes = conditions.includes("diabetes") || conditions.includes("gestational diabetes");
  const hasHypertension = conditions.includes("hypertension") || conditions.includes("preeclampsia") || conditions.includes("high blood pressure");
  const hasAnemia = conditions.includes("anemia");

  // 4. Pregnancy Weeks & Trimester
  const weeks = profile.pregnancy_weeks || 12;
  const trimester = weeks <= 13 ? 1 : weeks <= 26 ? 2 : 3;

  if (trimester === 1) {
    if (containsAny(textBlob, ["papaya", "bromelain", "fenugreek", "methi", "unpasteurized", "sprout"])) {
      ruleHits.push({
        key: "trimester_one_risk",
        severity: AVOID,
        message: "Contains ingredients (such as papaya or fenugreek) discouraged during the 1st trimester due to miscarriage risks.",
      });
    }
    if (caffeine_mg > 150) {
      ruleHits.push({
        key: "first_trimester_caffeine",
        severity: AVOID,
        message: "Caffeine should be strictly limited (< 150mg) during the first trimester.",
      });
    }
  } else {
    if (caffeine_mg > 200) {
      ruleHits.push({
        key: "high_caffeine",
        severity: AVOID,
        message: "High caffeine should be avoided in pregnancy.",
      });
    }
  }

  // General checks
  if (containsAny(textBlob, ["alcohol", "ethanol", "beer", "wine", "rum"])) {
    ruleHits.push({
      key: "alcohol",
      severity: AVOID,
      message: "Alcohol is not safe during pregnancy.",
    });
  }

  if (containsAny(textBlob, ["saccharin", "aspartame", "sucralose"])) {
    ruleHits.push({
      key: "artificial_sweeteners",
      severity: CAUTION,
      message: "Artificial sweeteners should be limited.",
    });
  }

  if (containsAny(textBlob, ["sodium benzoate", "nitrite", "nitrate", "msg", "monosodium glutamate"])) {
    ruleHits.push({
      key: "preservatives",
      severity: CAUTION,
      message: "Contains high preservatives (like MSG) which should be limited.",
    });
  }

  if (foodNameLower.includes("sushi") || containsAny(textBlob, ["raw fish", "raw meat", "raw egg", "runny egg", "unpasteurized"])) {
    ruleHits.push({
      key: "raw_animal_food",
      severity: AVOID,
      message: "Raw fish/meat may contain parasites and carry infection risks.",
    });
    ruleHits.push({
      key: "listeria_risk",
      severity: AVOID,
      message: "Risk of listeria infection from raw foods.",
    });
    ruleHits.push({
      key: "mercury_risk",
      severity: AVOID,
      message: "High mercury risk in raw/predatory fish.",
    });
  }

  if (containsAny(textBlob, ["shark", "swordfish", "king mackerel", "tilefish"])) {
    ruleHits.push({
      key: "high_mercury_fish",
      severity: AVOID,
      message: "High-mercury fish should be avoided.",
    });
  }

  if (trans_fat_g >= 1) {
    ruleHits.push({
      key: "trans_fat",
      severity: CAUTION,
      message: "Trans fats should be minimized during pregnancy.",
    });
  }

  if (sugar_g > 25 || (hasDiabetes && sugar_g > 15)) {
    const sev = hasDiabetes ? AVOID : CAUTION;
    const msg = hasDiabetes
      ? "High sugar content is highly unsafe for gestational diabetes / blood glucose control."
      : "High sugar content should be limited.";
    ruleHits.push({ key: "excess_sugar", severity: sev, message: msg });
  }

  if (hasHypertension) {
    if (sodium_mg > 400) {
      ruleHits.push({
        key: "high_sodium_hypertension",
        severity: AVOID,
        message: `Contains high sodium (${sodium_mg.toFixed(0)}mg) which is unsafe for gestational hypertension.`,
      });
    }
  } else {
    if (sodium_mg > 700) {
      ruleHits.push({
        key: "high_sodium",
        severity: CAUTION,
        message: "High sodium foods can worsen pregnancy swelling and fluid retention.",
      });
    }
  }

  // Final evaluation
  let finalSafety = SAFE;
  if (ruleHits.some((r) => r.severity === AVOID)) {
    finalSafety = AVOID;
  } else if (ruleHits.some((r) => r.severity === CAUTION)) {
    finalSafety = CAUTION;
  }

  // Custom insights
  let ironText = "Supports oxygen transport and baby brain development.";
  if (hasAnemia) {
    ironText += " (Highly recommended for your anemia profile)";
  }

  const nutrientInsights = [
    { name: "Iron", benefit: ironText },
    { name: "Folic Acid", benefit: "Helps neural tube development." },
    { name: "Calcium", benefit: "Supports strong bones for mother and baby." },
  ];

  // Alternatives
  let alternatives: string[] = [];
  if (finalSafety !== SAFE) {
    if (foodNameLower.includes("sushi")) {
      alternatives = ["Cooked salmon sushi", "Vegetable sushi"];
    } else if (foodNameLower.includes("noodle") || foodNameLower.includes("maggi") || foodNameLower.includes("maggie")) {
      alternatives = ["Whole wheat vegetable noodles"];
    } else {
      if (diet === "vegan") {
        alternatives = ["Almond milk", "Coconut water", "Fresh fruit bowl", "Vegan soy yogurt"];
      } else if (diet === "vegetarian") {
        alternatives = ["Cow's milk", "Coconut water", "Fresh fruit bowl", "Homemade curd"];
      } else {
        alternatives = ["Milk", "Coconut water", "Fresh fruit bowl", "Yogurt"];
      }
    }
  }

  // Safety score
  let safetyScore = 95;
  if (foodNameLower.includes("sushi")) {
    safetyScore = 22;
  } else if (foodNameLower.includes("noodle") || foodNameLower.includes("maggi") || foodNameLower.includes("maggie")) {
    safetyScore = 68;
  } else if (finalSafety === AVOID) {
    safetyScore = 22;
  } else if (finalSafety === CAUTION) {
    const cautionCount = ruleHits.filter((r) => r.severity === CAUTION).length;
    safetyScore = Math.max(45, 80 - cautionCount * 6);
  }

  // Why reasons
  let whyReasons: string[] = [];
  if (foodNameLower.includes("sushi")) {
    whyReasons = ["Raw fish may contain parasites", "Risk of listeria infection", "High mercury risk"];
  } else if (foodNameLower.includes("noodle") || foodNameLower.includes("maggi") || foodNameLower.includes("maggie")) {
    whyReasons = ["High sodium content", "Safe when cooked properly", "Low nutritional value for pregnancy"];
  } else {
    if (finalSafety === SAFE) {
      whyReasons = [
        "Contains safe, natural ingredients",
        "Low levels of sugar and artificial additives",
        "Provides supporting nutrients for prenatal care"
      ];
    } else {
      whyReasons = ruleHits.slice(0, 3).map((r) => r.message);
    }
  }

  // Trimester risk
  let trimesterRisk: string | null = null;
  if (finalSafety === AVOID || foodNameLower.includes("sushi")) {
    trimesterRisk = "Unsafe in all trimesters";
  } else if (trimester === 1 && ruleHits.some((r) => r.key === "trimester_one_risk" || r.key === "first_trimester_caffeine")) {
    trimesterRisk = "Unsafe in 1st trimester";
  }

  // Ingredients analysis
  const ingredientsAnalysis = finalIngredients.map((ing) => {
    const ingLower = ing.toLowerCase();
    let safety = "Safe";
    const isAllergen = allergies.some((a) => a && ingLower.includes(a));
    
    if (isAllergen) {
      safety = "Unsafe";
    } else if (ingLower.includes("flour") || ingLower.includes("wheat") || ingLower.includes("rice") || ingLower.includes("seaweed") || ingLower.includes("vegetable") || ingLower.includes("water")) {
      safety = "Safe";
    } else if (ingLower.includes("raw fish") || ingLower.includes("raw meat") || ingLower.includes("alcohol")) {
      safety = "Unsafe";
    } else if (ingLower.includes("msg") || ingLower.includes("monosodium glutamate") || ingLower.includes("palm oil") || ingLower.includes("oil") || ingLower.includes("salt") || ingLower.includes("sodium") || ingLower.includes("sugar") || ingLower.includes("sweetener")) {
      safety = "Moderate";
    } else if (ingLower.includes("papaya") || ingLower.includes("fenugreek") || ingLower.includes("methi")) {
      safety = "Unsafe";
    }

    let nameDisplay = ing.trim();
    if (ingLower.includes("msg")) nameDisplay = "MSG";
    else if (ingLower.includes("palm")) nameDisplay = "Palm Oil";
    else if (ingLower.includes("flour")) nameDisplay = "Wheat Flour";
    else if (ingLower.includes("raw fish")) nameDisplay = "Raw Fish";
    else if (ingLower.includes("rice")) nameDisplay = "Rice";
    else if (ingLower.includes("seaweed")) nameDisplay = "Seaweed";

    return {
      name: nameDisplay.length <= 3 ? nameDisplay.toUpperCase() : nameDisplay.replace(/\b\w/g, (c) => c.toUpperCase()),
      safety,
    };
  });

  // Recommendation & Sources
  let recommendation = "Safe to consume in normal portions";
  if (foodNameLower.includes("sushi") || finalSafety === AVOID) {
    recommendation = "Avoid entirely during pregnancy";
  } else if (foodNameLower.includes("noodle") || foodNameLower.includes("maggi") || foodNameLower.includes("maggie")) {
    recommendation = "1-2 times/week maximum";
  } else if (finalSafety === CAUTION) {
    recommendation = "Consume in moderation, max 2-3 times per week";
  }

  let sources = ["WHO", "FSSAI", "CDC"];
  if (foodNameLower.includes("sushi") || finalSafety === AVOID) {
    sources = ["WHO", "CDC", "FDA"];
  } else if (foodNameLower.includes("noodle") || foodNameLower.includes("maggi") || foodNameLower.includes("maggie") || finalSafety === CAUTION) {
    sources = ["WHO", "FSSAI", "NIN"];
  }

  return {
    id: Math.floor(Math.random() * 100000),
    detected_food: detectedFood,
    classification: finalSafety,
    rule_hits: ruleHits,
    nutrient_insights: nutrientInsights,
    alternatives,
    safety_score: safetyScore,
    why_reasons: whyReasons,
    trimester_risk: trimesterRisk,
    ingredients_analysis: ingredientsAnalysis,
    recommendation,
    sources,
    created_at: new Date().toISOString(),
  };
}
