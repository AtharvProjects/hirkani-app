const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

// Ordered models with fallback to prevent HTTP 429 quota exhaustion and service outages
const CANDIDATE_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-flash-latest",
  "gemini-2.5-flash"
];

export async function callGemini(contents: any[]): Promise<string> {
  let lastStatus = 0;
  let lastErrorMessage = "";

  for (let attempt = 0; attempt < 2; attempt++) {
    for (const model of CANDIDATE_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 18000); // 18s timeout per candidate

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents }),
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          const parts = data.candidates?.[0]?.content?.parts || [];
          const text = parts.map((p: any) => p.text || "").join("\n").trim();
          if (text) {
            return text;
          }
        }

        lastStatus = response.status;
        const errText = await response.text();
        console.warn(`Gemini model ${model} failed with HTTP ${response.status}:`, errText.substring(0, 120));

        // If rate limited (429), unavailable (503), or not found (404), fall back to next model immediately
        if (response.status === 429 || response.status === 503 || response.status === 404) {
          lastErrorMessage = `Model ${model} returned status ${response.status}`;
          continue;
        }

        // For other 4xx errors, record error and try next
        lastErrorMessage = `Gemini status ${response.status}`;
      } catch (err: any) {
        console.warn(`Request to ${model} threw:`, err.message);
        lastErrorMessage = err.message || "Network request failed";
      }
    }

    // If all candidate models were rate limited or busy, wait 1.5s before second pass
    if (attempt === 0) {
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  if (lastStatus === 429) {
    throw new Error("AI analysis service is temporarily busy due to rate limits. Please try again in a few moments.");
  }
  throw new Error(lastErrorMessage || "Failed to connect to AI vision analysis service.");
}

export async function geminiVisionScan(base64Image: string, mimeType: string = "image/jpeg", language: string = "en") {
  try {
    let cleanBase64 = base64Image;
    let actualMime = mimeType || "image/jpeg";
    if (base64Image.includes(",")) {
      const commaIdx = base64Image.indexOf(",");
      const prefix = base64Image.substring(0, commaIdx);
      cleanBase64 = base64Image.substring(commaIdx + 1);
      const mimeMatch = prefix.match(/data:([^;]+)/);
      if (mimeMatch) actualMime = mimeMatch[1];
    }
    cleanBase64 = cleanBase64.replace(/\s+/g, "");

    const prompt = `Analyze this food or product image for a pregnant woman's safety assistant. Identify the food item/product accurately. If it has a label, read the ingredients list and brand. You MUST output a single raw JSON object matching this schema exactly without markdown formatting or code blocks:
{
  "detected_food": "Name of food/product, e.g. Fresh Apples",
  "ingredients": ["ingredient 1", "ingredient 2"],
  "nutrients": {
    "sugar_g": 0.0,
    "sodium_mg": 0.0,
    "caffeine_mg": 0.0,
    "trans_fat_g": 0.0,
    "vitamin_a_mcg": 0.0
  },
  "classification": "SAFE" | "CONSUME_WITH_CAUTION" | "AVOID_DURING_PREGNANCY",
  "is_alcoholic": false,
  "is_tobacco_or_pan_masala": false,
  "pregnancy_safety_reasons": [
    "Specific reason citing ingredients or nutritions and explaining why it is safe or why not to eat / why to exercise caution during pregnancy"
  ]
}

CRITICAL PREGNANCY SAFETY DIRECTIVES:
1. ALCOHOL (BEER, LAGER, ALE, STOUT, WINE, SPIRITS, LIQUOR):
   Any alcoholic beverage or beer (such as Kingfisher, Budweiser, Heineken, wine, whiskey, rum, vodka, gin) MUST have:
   "is_alcoholic": true, "classification": "AVOID_DURING_PREGNANCY", and include "Alcohol / Ethanol" in ingredients.
   Explain in pregnancy_safety_reasons that alcohol freely crosses the placenta with ZERO safe limit and causes Fetal Alcohol Spectrum Disorders (FASD) and irreversible brain damage. NEVER classify an alcoholic beverage as SAFE or CAUTION!
2. PAN MASALA, GUTKA, BETEL NUT, SUPARI, TOBACCO, PAAN:
   Any pan masala (such as Rajnigandha, Vimal, Kamla Pasand), gutka, supari, betel nut, areca nut, tobacco, khaini, zarda, or paan MUST have:
   "is_tobacco_or_pan_masala": true, "classification": "AVOID_DURING_PREGNANCY", and include "Areca Nut / Betel Nut" in ingredients.
   Explain in pregnancy_safety_reasons that areca nut and tobacco are WHO Group 1 carcinogens and potent reproductive toxins that cause uterine spasms, miscarriage, and fetal growth restriction. NEVER classify pan masala as SAFE or CAUTION!
3. RAW / UNDERCOOKED / UNPASTEURIZED:
   Raw fish/sushi/sashimi, raw/undercooked meat/eggs, unpasteurized dairy/soft cheese (brie, camembert, blue cheese, feta), raw sprouts MUST be classified as "AVOID_DURING_PREGNANCY" due to Listeria, Salmonella, and Toxoplasmosis.
4. UNRIPE PAPAYA:
   Unripe or semi-ripe green papaya contains latex and papain enzymes that trigger uterine contractions -> "AVOID_DURING_PREGNANCY".
5. ULTRA-PROCESSED FOODS / HIGH SODIUM / HIGH SUGAR:
   Instant noodles (Maggi), fried chips (Kurkure, Lays), sugary carbonated drinks, sweets -> "CONSUME_WITH_CAUTION".
6. SAFE WHOLESOME FOODS:
   Thoroughly cooked dal, pasteurized milk/yogurt/paneer, cooked eggs, low-mercury fish (salmon), oats, vegetables, and whole fruits (like fresh apples, bananas, oranges) -> "SAFE".

CRITICAL INSTRUCTION: If the image clearly DOES NOT contain any food, beverage, or consumable product (e.g., it is a piece of clothing, furniture, person, or random object), you MUST return exactly this JSON and nothing else:
{
  "error": "not_food"
}

If it is a raw single ingredient food (like a raw papaya or banana or apple), list that raw item as the single ingredient. For example, if it's apple, the ingredients list MUST be ['Apple'].

CRITICAL INSTRUCTION FOR NO PERCENTAGES: You strictly MUST NOT output any percentage numbers (no %, no percentages, no xx/100). Explain reasons strictly using ingredients, nutritional factors, and medical safety.

CRITICAL INSTRUCTION FOR LOCALIZATION: You MUST output all string values (like detected_food, items in the ingredients array, and pregnancy_safety_reasons) in the language denoted by code: ${language}. For example, if language is 'mr', output everything in Marathi.`;

    const textResponse = await callGemini([
      {
        parts: [
          { text: prompt },
          { inline_data: { mime_type: actualMime, data: cleanBase64 } }
        ]
      }
    ]);

    // Robust JSON extraction
    const firstBrace = textResponse.indexOf('{');
    const lastBrace = textResponse.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      return null;
    }

    const data = JSON.parse(textResponse.substring(firstBrace, lastBrace + 1));
    if (data.error === "not_food") {
      throw new Error("NOT_FOOD");
    }

    if (data && data.detected_food) {
      data.source = "vision_gemini";
      if (!data.ingredients) {
        data.ingredients = [data.detected_food];
      } else if (typeof data.ingredients === "string") {
        data.ingredients = [data.ingredients];
      }
      if (!data.nutrients) {
        data.nutrients = { sugar_g: 0, sodium_mg: 0, caffeine_mg: 0, trans_fat_g: 0, vitamin_a_mcg: 0 };
      }
      data.additives = [];
      data.is_alcoholic = Boolean(data.is_alcoholic);
      data.is_tobacco_or_pan_masala = Boolean(data.is_tobacco_or_pan_masala);
      if (typeof data.pregnancy_safety_reasons === "string") {
        data.pregnancy_safety_reasons = [data.pregnancy_safety_reasons];
      } else if (!Array.isArray(data.pregnancy_safety_reasons)) {
        data.pregnancy_safety_reasons = [];
      }
      data.pregnancy_safety_reasons = data.pregnancy_safety_reasons
        .map((r: any) => String(r).replace(/\b100%\s*/gi, "fully ").replace(/\b\d+%\s*/gi, "").replace(/%/g, "").trim())
        .filter(Boolean);
      return data;
    }
    return null;
  } catch (e: any) {
    if (e.message === "NOT_FOOD") throw e;
    console.error("Error calling Gemini Vision:", e);
    throw new Error(e.message || "Vision AI analysis failed");
  }
}

export async function geminiTextScan(foodName: string, language: string = "en") {
  try {
    const prompt = `Analyze this food or product for a pregnant woman's safety assistant: "${foodName}". 
Identify the food item/product accurately. Provide its typical ingredients and nutritional values.
You MUST output a single raw JSON object matching this schema exactly without markdown formatting or code blocks:
{
  "detected_food": "Name of food/product",
  "ingredients": ["ingredient 1", "ingredient 2"],
  "nutrients": {
    "sugar_g": 0.0,
    "sodium_mg": 0.0,
    "caffeine_mg": 0.0,
    "trans_fat_g": 0.0,
    "vitamin_a_mcg": 0.0
  },
  "classification": "SAFE" | "CONSUME_WITH_CAUTION" | "AVOID_DURING_PREGNANCY",
  "is_alcoholic": false,
  "is_tobacco_or_pan_masala": false,
  "pregnancy_safety_reasons": [
    "Specific reason citing ingredients or nutritions and explaining why it is safe or why not to eat / why to exercise caution during pregnancy"
  ]
}

CRITICAL PREGNANCY SAFETY DIRECTIVES:
1. ALCOHOL (BEER, LAGER, ALE, STOUT, WINE, SPIRITS, LIQUOR):
   Any alcoholic beverage or beer (such as Kingfisher, Budweiser, Heineken, wine, whiskey, rum, vodka, gin) MUST have:
   "is_alcoholic": true, "classification": "AVOID_DURING_PREGNANCY", and include "Alcohol / Ethanol" in ingredients.
   Explain in pregnancy_safety_reasons that alcohol freely crosses the placenta with ZERO safe limit and causes Fetal Alcohol Spectrum Disorders (FASD) and irreversible brain damage. NEVER classify an alcoholic beverage as SAFE or CAUTION!
2. PAN MASALA, GUTKA, BETEL NUT, SUPARI, TOBACCO, PAAN:
   Any pan masala (such as Rajnigandha, Vimal, Kamla Pasand), gutka, supari, betel nut, areca nut, tobacco, khaini, zarda, or paan MUST have:
   "is_tobacco_or_pan_masala": true, "classification": "AVOID_DURING_PREGNANCY", and include "Areca Nut / Betel Nut" in ingredients.
   Explain in pregnancy_safety_reasons that areca nut and tobacco are WHO Group 1 carcinogens and potent reproductive toxins that cause uterine spasms, miscarriage, and fetal growth restriction. NEVER classify pan masala as SAFE or CAUTION!
3. RAW / UNDERCOOKED / UNPASTEURIZED:
   Raw fish/sushi/sashimi, raw/undercooked meat/eggs, unpasteurized dairy/soft cheese (brie, camembert, blue cheese, feta), raw sprouts MUST be classified as "AVOID_DURING_PREGNANCY" due to Listeria, Salmonella, and Toxoplasmosis.
4. UNRIPE PAPAYA:
   Unripe or semi-ripe green papaya contains latex and papain enzymes that trigger uterine contractions -> "AVOID_DURING_PREGNANCY".
5. ULTRA-PROCESSED FOODS / HIGH SODIUM / HIGH SUGAR:
   Instant noodles (Maggi), fried chips (Kurkure, Lays), sugary carbonated drinks, sweets -> "CONSUME_WITH_CAUTION".
6. SAFE WHOLESOME FOODS:
   Thoroughly cooked dal, pasteurized milk/yogurt/paneer, cooked eggs, low-mercury fish (salmon), oats, vegetables, and whole fruits -> "SAFE".

CRITICAL INSTRUCTION: If the query refers to a non-food item, or if it is just a number (like a barcode) and you are completely unsure what product it is, you MUST return exactly this JSON and nothing else:
{
  "error": "not_food"
}
If it is a raw single ingredient food (like a raw papaya or banana or apple), list that raw item as the single ingredient. For example, if it's papaya, the ingredients list MUST be ['papaya'].

CRITICAL INSTRUCTION FOR NO PERCENTAGES: You strictly MUST NOT output any percentage numbers (no %, no percentages, no xx/100). Explain reasons strictly using ingredients, nutritional factors, and medical safety.

CRITICAL INSTRUCTION FOR LOCALIZATION: You MUST output all string values (like detected_food, items in the ingredients array, and pregnancy_safety_reasons) in the language denoted by code: ${language}. For example, if language is 'mr', output everything in Marathi.`;

    const textResponse = await callGemini([
      {
        parts: [{ text: prompt }]
      }
    ]);

    const firstBrace = textResponse.indexOf('{');
    const lastBrace = textResponse.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      return null;
    }

    const data = JSON.parse(textResponse.substring(firstBrace, lastBrace + 1));
    if (data.error === "not_food") {
      throw new Error("NOT_FOOD");
    }
    if (data.detected_food && data.ingredients) {
      data.source = "text_gemini";
      if (!data.nutrients) {
        data.nutrients = { sugar_g: 0, sodium_mg: 0, caffeine_mg: 0, trans_fat_g: 0, vitamin_a_mcg: 0 };
      }
      data.additives = [];
      data.is_alcoholic = Boolean(data.is_alcoholic);
      data.is_tobacco_or_pan_masala = Boolean(data.is_tobacco_or_pan_masala);
      if (Array.isArray(data.pregnancy_safety_reasons)) {
        data.pregnancy_safety_reasons = data.pregnancy_safety_reasons
          .map((r: any) => String(r).replace(/\b100%\s*/gi, "fully ").replace(/\b\d+%\s*/gi, "").replace(/%/g, "").trim())
          .filter(Boolean);
      }
      return data;
    }
    return null;
  } catch (e: any) {
    if (e.message === "NOT_FOOD") throw e;
    console.error("Error calling Gemini Text:", e);
    return null;
  }
}

export function generateSimpleExplanation(classification: string, ruleHits: any[]) {
  if (ruleHits.length === 0) {
    if (classification === "AVOID_DURING_PREGNANCY") {
      return "This food is generally not recommended during pregnancy due to inherent risks.";
    } else if (classification === "CONSUME_WITH_CAUTION") {
      return "This food should be consumed in moderation.";
    }
    return "This food is generally safe to consume during pregnancy as part of a balanced diet.";
  }

  const avoidReasons = ruleHits.filter(r => r.severity === "AVOID_DURING_PREGNANCY").map(r => r.message);
  const cautionReasons = ruleHits.filter(r => r.severity === "CONSUME_WITH_CAUTION").map(r => r.message);

  let explanation = "";
  if (avoidReasons.length > 0) {
    explanation += "Highly Unsafe: " + avoidReasons.join(" ") + " ";
  }
  if (cautionReasons.length > 0) {
    explanation += "Caution: " + cautionReasons.join(" ");
  }
  return explanation.trim();
}

export async function checkAllergiesWithAI(foodName: string, ingredients: string[], userAllergies: string[]): Promise<string[]> {
  if (!userAllergies || userAllergies.length === 0) return [];
  if (!ingredients || ingredients.length === 0) return [];

  try {
    const prompt = `You are a medical allergy assistant.
Food: ${foodName}
Ingredients: ${ingredients.join(", ")}
User Allergies: ${userAllergies.join(", ")}

Analyze the ingredients and determine if ANY of the user's allergies are present. 
Consider derivatives, hidden names, scientific names, and broad categories (e.g. if allergy is "dairy", flag "casein", "whey", "butter", "milk").
You MUST output a single raw JSON array containing ONLY the names of the user's allergies that are triggered. If none are triggered, output an empty array [].
Output EXACTLY valid JSON and nothing else, no markdown formatting.
Example output:
["Dairy", "Peanuts"]`;

    const textResponse = await callGemini([
      {
        parts: [{ text: prompt }]
      }
    ]);

    const firstBracket = textResponse.indexOf('[');
    const lastBracket = textResponse.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1) {
      const triggered = JSON.parse(textResponse.substring(firstBracket, lastBracket + 1));
      if (Array.isArray(triggered)) {
        return triggered.map(a => String(a));
      }
    }
    return [];
  } catch (e) {
    console.error("Error in checkAllergiesWithAI:", e);
    return [];
  }
}
