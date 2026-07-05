import { PregnancyProfile, RecommendationResponse, RecommendationItem } from './api';

export async function getDailyTips(profile: any) {
  const trimester = profile?.trimester || 2;
  const conditions = profile?.medical_conditions?.length ? profile.medical_conditions.join(", ") : "none";
  const allergies = profile?.allergies?.length ? profile.allergies.join(", ") : "none";
  const diet = profile?.diet_preference || "general";

  const prompt = `Generate exactly 2 short, medically sound daily pregnancy tips for a woman in trimester ${trimester}. Medical conditions: ${conditions}. Allergies: ${allergies}. Diet: ${diet}. Format as a JSON object with a 'tips' key containing a list of exactly two string tips.
{
  "tips": ["Tip 1", "Tip 2"]
}`;

  try {
    const response = await fetch("/api/llm/tips", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ profile })
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
      const tips = data.tips && Array.isArray(data.tips) ? data.tips.slice(0, 2) : [];
      if (tips.length >= 2) return { trimester, tips };
    }
  } catch (e) {
    console.error("Error fetching daily tips:", e);
  }

  return { 
    trimester, 
    tips: ["Stay hydrated and eat balanced meals.", "Follow your doctor's prenatal guidelines."] 
  };
}

const FOOD_DB: { category: string; items: (RecommendationItem & { avoidIf: { allergies?: string[], conditions?: string[], diets?: string[], maxTrimester?: number } })[] }[] = [
  {
    category: "Veggies",
    items: [
      { name: "Spinach", sub: "Leafy Greens", img: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&q=80", bg: "#dcfce7", safety: "SAFE", reasons: ["Washed thoroughly"], benefit: "High in folate (B9) and iron for neural tube development.", tags: ["Iron", "Folate"], avoidIf: {} },
      { name: "Sweet Potato", sub: "Root Veg", img: "/foods/sweet_potato.png", bg: "#ffedd5", safety: "SAFE", reasons: ["Rich in Vitamin A"], benefit: "Provides Vitamin A essential for fetal organ development.", tags: ["Vitamin A", "Fiber"], avoidIf: { conditions: ["Gestational Diabetes"] } },
      { name: "Broccoli", sub: "Cruciferous", img: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=500&q=80", bg: "#dcfce7", safety: "SAFE", reasons: ["Cooked well"], benefit: "Calcium and folate booster.", tags: ["Folate", "Calcium"], avoidIf: {} },
      { name: "Raw Sprouts", sub: "Sprouts", img: "/foods/raw_sprouts.png", bg: "#fee2e2", safety: "AVOID_DURING_PREGNANCY", reasons: ["High risk of Salmonella", "High risk of E. coli"], benefit: "Nutrient dense but too risky raw.", tags: ["High Risk"], avoidIf: {} },
    ]
  },
  {
    category: "Dairy",
    items: [
      { name: "Pasteurized Yogurt", sub: "Probiotics", img: "/foods/yogurt.png", bg: "#f3f4f6", safety: "SAFE", reasons: ["Must be pasteurized"], benefit: "Provides calcium and probiotics for digestion.", tags: ["Calcium", "Probiotic"], avoidIf: { allergies: ["Dairy", "Lactose"], diets: ["Vegan"] } },
      { name: "Cheddar Cheese", sub: "Hard Cheese", img: "/foods/cheddar_cheese.png", bg: "#fef3c7", safety: "SAFE", reasons: ["Hard cheeses have low moisture, safe from Listeria"], benefit: "Excellent source of calcium and protein.", tags: ["Calcium", "Protein"], avoidIf: { allergies: ["Dairy", "Lactose"], diets: ["Vegan"] } },
      { name: "Brie / Camembert", sub: "Soft Cheese", img: "/foods/brie_cheese.png", bg: "#fee2e2", safety: "AVOID_DURING_PREGNANCY", reasons: ["Risk of Listeria in mold-ripened soft cheeses"], benefit: "None that outweigh the risk.", tags: ["High Risk"], avoidIf: { allergies: ["Dairy"], diets: ["Vegan"] } },
      { name: "Almond Milk (Fortified)", sub: "Plant Milk", img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&q=80", bg: "#fdf4ff", safety: "SAFE", reasons: ["Choose unsweetened"], benefit: "Great dairy-free calcium alternative.", tags: ["Calcium", "Dairy-Free"], avoidIf: { allergies: ["Nuts", "Almonds"] } },
    ]
  },
  {
    category: "Vitamins",
    items: [
      { name: "Prenatal Multivitamin", sub: "Supplement", img: "/foods/prenatal_vitamins.png", bg: "#e0e7ff", safety: "SAFE", reasons: ["Standard medical recommendation"], benefit: "Fills nutritional gaps in diet.", tags: ["Essential", "Daily"], avoidIf: {} },
      { name: "Folic Acid", sub: "B9 Supplement", img: "/foods/folic_acid.png", bg: "#fef08a", safety: "SAFE", reasons: ["Crucial in T1"], benefit: "Prevents neural tube defects.", tags: ["T1 Essential", "Brain Dev"], avoidIf: { maxTrimester: 1 } },
      { name: "Iron Supplement", sub: "Mineral", img: "/foods/folic_acid.png", bg: "#fecdd3", safety: "CONSUME_WITH_CAUTION", reasons: ["Can cause constipation", "Take with Vitamin C"], benefit: "Prevents anemia, builds baby's blood.", tags: ["Blood Health"], avoidIf: {} },
      { name: "Vitamin A (Retinol)", sub: "Supplement", img: "/foods/vitamin_a.png", bg: "#fee2e2", safety: "AVOID_DURING_PREGNANCY", reasons: ["High doses cause birth defects"], benefit: "Get from food (beta-carotene), avoid supplements.", tags: ["Toxicity Risk"], avoidIf: {} },
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
          // Instead of hiding, we flag it as caution for educational purposes, unless it's already avoid
          if (item.safety === "SAFE") {
            modifySafetyToCaution = true;
            extraCautionReason = `Monitor intake due to your ${item.avoidIf.conditions[0]}`;
          } else if (item.safety === "AVOID_DURING_PREGNANCY") {
            continue; // Hide entirely if it's avoid and they have condition
          }
        }
      }

      // Check Trimester relevance (e.g. Folic acid mostly needed in T1)
      if (item.avoidIf.maxTrimester && currentTrimester > item.avoidIf.maxTrimester) {
        continue;
      }

      validItems.push({
        ...item,
        safety: modifySafetyToCaution ? "CONSUME_WITH_CAUTION" : item.safety,
        reasons: modifySafetyToCaution ? [extraCautionReason, ...item.reasons] : item.reasons
      });
    }

    responses.push({
      category: category.category,
      items: validItems
    });
  }

  return responses;
}
