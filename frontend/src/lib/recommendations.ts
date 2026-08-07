import { PregnancyProfile, RecommendationResponse, RecommendationItem } from './api';

export async function getDailyTips(profile: any, count: number = 2) {
  const trimester = profile?.trimester || 2;
  const language = profile?.preferences?.language || "en";
  const conditions = profile?.medical_conditions?.length ? profile.medical_conditions.join(", ") : "none";
  const allergies = profile?.allergies?.length ? profile.allergies.join(", ") : "none";
  const diet = profile?.diet_preference || "general";

  try {
    const response = await fetch("/api/llm/tips", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ profile, count, language })
    });

    const result = await response.json();
    if (result.choices && result.choices.length > 0) {
      let textResponse = result.choices[0].message.content;
      if (textResponse.includes("```json")) {
        textResponse = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
      } else if (textResponse.includes("```")) {
        textResponse = textResponse.replace(/```/g, "").trim();
      }
      const data = JSON.parse(textResponse);
      const tips = data.tips && Array.isArray(data.tips) ? data.tips.slice(0, count) : [];
      if (tips.length >= count) return { trimester, tips };
    }
  } catch (e) {
    console.error("Error fetching daily tips:", e);
  }

  return { 
    trimester, 
    tips: ["Stay hydrated and eat balanced meals.", "Follow your doctor's prenatal guidelines."] 
  };
}

const FOOD_DB: { category: string; items: (RecommendationItem & { baseScore: number; nutrients: string[]; avoidIf: { allergies?: string[], conditions?: string[], conditionReason?: string, diets?: string[], maxTrimester?: number } })[] }[] = [
  {
    category: "Veggies",
    items: [
      { name: "Spinach", sub: "Leafy Greens", img: "/foods/spinach.png", bg: "#dcfce7", safety: "SAFE", reasons: ["Washed thoroughly"], benefit: "High in folate (B9) and iron for neural tube development.", tags: ["Iron", "Folate"], baseScore: 80, nutrients: ["Folate", "Iron"], avoidIf: {} },
      { name: "Sweet Potato", sub: "Root Veg", img: "/foods/sweet_potato.png", bg: "#ffedd5", safety: "SAFE", reasons: ["Rich in Vitamin A"], benefit: "Provides Vitamin A essential for fetal organ development.", tags: ["Vitamin A", "Fiber"], baseScore: 75, nutrients: ["Vitamin A", "Fiber"], avoidIf: { conditions: ["Gestational Diabetes"], conditionReason: "High carbohydrate content can spike blood sugar." } },
      { name: "Broccoli", sub: "Cruciferous", img: "/foods/broccoli.png", bg: "#dcfce7", safety: "SAFE", reasons: ["Cooked well"], benefit: "Calcium and folate booster.", tags: ["Folate", "Calcium"], baseScore: 78, nutrients: ["Folate", "Calcium"], avoidIf: {} },
      { name: "Raw Sprouts", sub: "Sprouts", img: "/foods/raw_sprouts.png", bg: "#fee2e2", safety: "AVOID_DURING_PREGNANCY", reasons: ["High risk of Salmonella", "High risk of E. coli"], benefit: "Nutrient dense but too risky raw.", tags: ["High Risk"], baseScore: 10, nutrients: [], avoidIf: {} },
      { name: "Bell Peppers", sub: "Nightshade", img: "/foods/bell_peppers.png", bg: "#fef08a", safety: "SAFE", reasons: ["Rich in Vitamin C"], benefit: "Helps with iron absorption when eaten together.", tags: ["Vitamin C"], baseScore: 70, nutrients: ["Vitamin C"], avoidIf: {} },
    ]
  },
  {
    category: "Dairy",
    items: [
      { name: "Pasteurized Yogurt", sub: "Probiotics", img: "/foods/yogurt.png", bg: "#f3f4f6", safety: "SAFE", reasons: ["Must be pasteurized"], benefit: "Provides calcium and probiotics for digestion.", tags: ["Calcium", "Probiotic"], baseScore: 85, nutrients: ["Calcium", "Protein"], avoidIf: { allergies: ["Dairy", "Lactose"], diets: ["Vegan"] } },
      { name: "Cheddar Cheese", sub: "Hard Cheese", img: "/foods/cheddar_cheese.png", bg: "#fef3c7", safety: "SAFE", reasons: ["Hard cheeses have low moisture, safe from Listeria"], benefit: "Excellent source of calcium and protein.", tags: ["Calcium", "Protein"], baseScore: 80, nutrients: ["Calcium", "Protein"], avoidIf: { allergies: ["Dairy", "Lactose"], diets: ["Vegan"] } },
      { name: "Brie / Camembert", sub: "Soft Cheese", img: "/foods/brie_cheese.png", bg: "#fee2e2", safety: "AVOID_DURING_PREGNANCY", reasons: ["Risk of Listeria in mold-ripened soft cheeses"], benefit: "None that outweigh the risk.", tags: ["High Risk"], baseScore: 10, nutrients: [], avoidIf: { allergies: ["Dairy"], diets: ["Vegan"] } },
      { name: "Almond Milk (Fortified)", sub: "Plant Milk", img: "/foods/almond_milk.png", bg: "#fdf4ff", safety: "SAFE", reasons: ["Choose unsweetened"], benefit: "Great dairy-free calcium alternative.", tags: ["Calcium", "Dairy-Free"], baseScore: 75, nutrients: ["Calcium"], avoidIf: { allergies: ["Nuts", "Almonds"] } },
      { name: "Pasteurized Milk", sub: "Cow's Milk", img: "/foods/pasteurized_milk.png", bg: "#f3f4f6", safety: "SAFE", reasons: ["Always ensure it is pasteurized"], benefit: "Key source of calcium and Vitamin D.", tags: ["Calcium", "Vitamin D"], baseScore: 80, nutrients: ["Calcium", "Vitamin D"], avoidIf: { allergies: ["Dairy", "Lactose"], diets: ["Vegan"] } }
    ]
  },
  {
    category: "Proteins",
    items: [
      { name: "Cooked Salmon", sub: "Seafood", img: "/foods/cooked_salmon.png", bg: "#fee2e2", safety: "SAFE", reasons: ["Cook to 145°F", "Low in mercury"], benefit: "Excellent source of DHA/EPA Omega-3s for fetal brain development.", tags: ["Omega-3", "Protein"], baseScore: 90, nutrients: ["Omega-3", "Protein"], avoidIf: { allergies: ["Fish", "Seafood"], diets: ["Vegan", "Vegetarian"] } },
      { name: "Lentils", sub: "Legumes", img: "/foods/lentils.png", bg: "#ffedd5", safety: "SAFE", reasons: ["Fully cooked"], benefit: "Packed with plant-based iron, folate, and fiber.", tags: ["Iron", "Fiber"], baseScore: 85, nutrients: ["Iron", "Folate", "Fiber"], avoidIf: {} },
      { name: "Eggs (Fully Cooked)", sub: "Poultry", img: "/foods/eggs.png", bg: "#fef3c7", safety: "SAFE", reasons: ["No runny yolks to avoid Salmonella"], benefit: "Great source of choline for baby's brain.", tags: ["Choline", "Protein"], baseScore: 85, nutrients: ["Protein", "Choline"], avoidIf: { allergies: ["Eggs"], diets: ["Vegan"] } },
      { name: "Deli Meats", sub: "Processed Meat", img: "/foods/deli_meats.png", bg: "#fee2e2", safety: "CONSUME_WITH_CAUTION", reasons: ["Must be heated until steaming hot", "High sodium"], benefit: "Provides protein but carries Listeria risk if eaten cold.", tags: ["High Risk"], baseScore: 40, nutrients: ["Protein"], avoidIf: { diets: ["Vegan", "Vegetarian"], conditions: ["Hypertension"], conditionReason: "High sodium content can exacerbate high blood pressure." } }
    ]
  },
  {
    category: "Fruits",
    items: [
      { name: "Avocado", sub: "Healthy Fats", img: "/foods/avocado.png", bg: "#dcfce7", safety: "SAFE", reasons: ["Washed before cutting"], benefit: "Loaded with healthy fats, folate, and potassium.", tags: ["Healthy Fats", "Potassium"], baseScore: 88, nutrients: ["Folate", "Healthy Fats", "Potassium"], avoidIf: {} },
      { name: "Berries", sub: "Antioxidants", img: "/foods/berries.png", bg: "#fce7f3", safety: "SAFE", reasons: ["Wash thoroughly"], benefit: "High in antioxidants, Vitamin C, and fiber.", tags: ["Vitamin C", "Fiber"], baseScore: 82, nutrients: ["Vitamin C", "Fiber"], avoidIf: {} },
      { name: "Bananas", sub: "Carbs", img: "/foods/bananas.png", bg: "#fef08a", safety: "SAFE", reasons: ["Peeled"], benefit: "Great for quick energy and potassium to reduce leg cramps.", tags: ["Potassium", "Energy"], baseScore: 78, nutrients: ["Potassium"], avoidIf: {} }
    ]
  },
  {
    category: "Vitamins",
    items: [
      { name: "Prenatal Multivitamin", sub: "Supplement", img: "/foods/prenatal_vitamins.png", bg: "#e0e7ff", safety: "SAFE", reasons: ["Standard medical recommendation"], benefit: "Fills nutritional gaps in diet.", tags: ["Essential", "Daily"], baseScore: 95, nutrients: ["Multivitamin"], avoidIf: {} },
      { name: "Folic Acid", sub: "B9 Supplement", img: "/foods/folic_acid.png", bg: "#fef08a", safety: "SAFE", reasons: ["Crucial in T1"], benefit: "Prevents neural tube defects.", tags: ["T1 Essential", "Brain Dev"], baseScore: 90, nutrients: ["Folate"], avoidIf: { maxTrimester: 1 } },
      { name: "Iron Supplement", sub: "Mineral", img: "/foods/iron_supplement.png", bg: "#fecdd3", safety: "CONSUME_WITH_CAUTION", reasons: ["Can cause constipation", "Take with Vitamin C"], benefit: "Prevents anemia, builds baby's blood.", tags: ["Blood Health"], baseScore: 80, nutrients: ["Iron"], avoidIf: {} },
      { name: "Vitamin A (Retinol)", sub: "Supplement", img: "/foods/vitamin_a.png", bg: "#fee2e2", safety: "AVOID_DURING_PREGNANCY", reasons: ["High doses cause birth defects"], benefit: "Get from food (beta-carotene), avoid supplements.", tags: ["Toxicity Risk"], baseScore: 5, nutrients: [], avoidIf: {} },
    ]
  }
];

export function getProfileRecommendations(profile: PregnancyProfile | null): RecommendationResponse[] {
  const isVegan = profile?.diet_preference?.toLowerCase() === "vegan";
  const userAllergies = (profile?.allergies || []).map(a => a.toLowerCase());
  const userConditions = (profile?.medical_conditions || []).map(c => c.toLowerCase());
  const currentTrimester = profile?.trimester || 1;

  const responses: RecommendationResponse[] = [];

  for (const category of FOOD_DB) {
    const validItems: RecommendationItem[] = [];

    for (const item of category.items) {
      // Check Diet restrictions
      if (item.avoidIf.diets) {
        if (item.avoidIf.diets.some(d => profile?.diet_preference?.toLowerCase() === d.toLowerCase())) continue;
      }

      // Check Allergies
      if (item.avoidIf.allergies) {
        if (item.avoidIf.allergies.some(a => userAllergies.includes(a.toLowerCase()))) continue;
      }

      // Check Medical Conditions
      let modifySafetyToCaution = false;
      let extraCautionReason = "";

      if (item.avoidIf.conditions) {
        const hasCondition = item.avoidIf.conditions.some(c => userConditions.includes(c.toLowerCase()));
        if (hasCondition) {
          if (item.safety === "SAFE") {
            modifySafetyToCaution = true;
            extraCautionReason = item.avoidIf.conditionReason || `Monitor intake due to your ${item.avoidIf.conditions[0]}.`;
          } else if (item.safety === "AVOID_DURING_PREGNANCY") {
            continue; // Hide entirely if it's avoid and they have condition
          }
        }
      }

      // Check Trimester relevance
      if (item.avoidIf.maxTrimester && currentTrimester > item.avoidIf.maxTrimester) {
        continue;
      }

      // --- DYNAMIC SCORING LOGIC ---
      let score = item.baseScore;

      // Trimester-based nutrient boosts
      if (currentTrimester === 1) {
        if (item.nutrients.includes("Folate")) score += 15; // T1 crucial for neural tube
      } else if (currentTrimester === 2) {
        if (item.nutrients.includes("Calcium") || item.nutrients.includes("Iron")) score += 10; // T2 bone & blood volume expansion
      } else if (currentTrimester === 3) {
        if (item.nutrients.includes("Omega-3")) score += 15; // T3 rapid brain growth
        if (item.nutrients.includes("Fiber")) score += 5; // Prevent T3 constipation
      }

      // Condition-based nutrient boosts
      if (userConditions.includes("anemia") && item.nutrients.includes("Iron")) {
        score += 20; // Critical for anemia
      }
      if (userConditions.includes("constipation") && item.nutrients.includes("Fiber")) {
        score += 15;
      }
      if (userConditions.includes("hypertension") && item.nutrients.includes("Potassium")) {
        score += 10; // Potassium helps balance blood pressure
      }
      if (modifySafetyToCaution) {
        score -= 30; // Penalize cautioned foods heavily so they drop to the bottom
      }

      validItems.push({
        name: item.name,
        sub: item.sub,
        img: item.img,
        bg: item.bg,
        safety: modifySafetyToCaution ? "CONSUME_WITH_CAUTION" : item.safety,
        reasons: modifySafetyToCaution ? [extraCautionReason, ...item.reasons] : item.reasons,
        benefit: item.benefit,
        tags: item.tags,
        score
      });
    }

    // Sort items by score descending
    validItems.sort((a, b) => (b.score || 0) - (a.score || 0));

    responses.push({
      category: category.category,
      items: validItems
    });
  }

  return responses;
}
