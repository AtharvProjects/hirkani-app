export async function geminiVisionScan(base64Image: string, mimeType: string = "image/jpeg") {
  try {
    const prompt = `Analyze this food or product image for a pregnant woman's safety assistant. Identify the food item/product accurately. If it has a label, read the ingredients list and brand. You MUST output a single raw JSON object matching this schema exactly without markdown formatting or code blocks:
{
  "detected_food": "Name of food/product, e.g. Papaya",
  "ingredients": ["ingredient 1", "ingredient 2"],
  "nutrients": {
    "sugar_g": 0.0,
    "sodium_mg": 0.0,
    "caffeine_mg": 0.0,
    "trans_fat_g": 0.0,
    "vitamin_a_mcg": 0.0
  }
}
CRITICAL INSTRUCTION: If the image clearly DOES NOT contain any food, beverage, or consumable product (e.g., it is a piece of clothing, furniture, person, or random object), you MUST return exactly this JSON and nothing else:
{
  "error": "not_food"
}

If it is a raw single ingredient food (like a raw papaya or banana or apple), list that raw item as the single ingredient. For example, if it's papaya, the ingredients list MUST be ['papaya'].`;

    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("Missing OpenRouter API Key");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://hirkani.app",
        "X-Title": "Hirkani App",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: base64Image.startsWith('data:') ? base64Image : `data:${mimeType || 'image/jpeg'};base64,${base64Image}` } }
            ]
          }
        ]
      })
    });

    const result = await response.json();
    if (!response.ok) {
      console.error("OpenRouter error:", result);
      return null;
    }

    let textResponse = result.choices[0].message.content;
    
    // Robust JSON extraction
    const firstBrace = textResponse.indexOf('{');
    const lastBrace = textResponse.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      textResponse = textResponse.substring(firstBrace, lastBrace + 1);
    }

    const data = JSON.parse(textResponse);
    if (data.error === "not_food") {
      throw new Error("NOT_FOOD");
    }

    if (data.detected_food && data.ingredients) {
      data.source = "vision_openrouter";
      if (!data.nutrients) {
        data.nutrients = { sugar_g: 0, sodium_mg: 0, caffeine_mg: 0, trans_fat_g: 0, vitamin_a_mcg: 0 };
      }
      data.additives = [];
      return data;
    }
    return null;
  } catch (e: any) {
    if (e.message === "NOT_FOOD") throw e;
    console.error("Error calling OpenRouter Vision:", e);
    return null;
  }
}

export async function geminiTextScan(foodName: string) {
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
  }
}
CRITICAL INSTRUCTION: If the query refers to a non-food item, or if it is just a number (like a barcode) and you are completely unsure what product it is, you MUST return exactly this JSON and nothing else:
{
  "error": "not_food"
}
If it is a raw single ingredient food (like a raw papaya or banana or apple), list that raw item as the single ingredient. For example, if it's papaya, the ingredients list MUST be ['papaya'].`;

    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("Missing OpenRouter API Key");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://hirkani.app",
        "X-Title": "Hirkani App",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const result = await response.json();
    if (!response.ok) return null;

    let textResponse = result.choices[0].message.content;
    // Robust JSON extraction
    const firstBrace = textResponse.indexOf('{');
    const lastBrace = textResponse.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      textResponse = textResponse.substring(firstBrace, lastBrace + 1);
    }

    const data = JSON.parse(textResponse);
    if (data.error === "not_food") {
      throw new Error("NOT_FOOD");
    }
    if (data.detected_food && data.ingredients) {
      data.source = "text_openrouter";
      if (!data.nutrients) {
        data.nutrients = { sugar_g: 0, sodium_mg: 0, caffeine_mg: 0, trans_fat_g: 0, vitamin_a_mcg: 0 };
      }
      data.additives = [];
      return data;
    }
    return null;
  } catch (e: any) {
    if (e.message === "NOT_FOOD") throw e;
    console.error("Error calling OpenRouter Text:", e);
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

    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    if (!apiKey) return [];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://hirkani.app",
        "X-Title": "Hirkani App",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        max_tokens: 100,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const result = await response.json();
    if (!response.ok) return [];

    let textResponse = result.choices[0].message.content.trim();
    const firstBracket = textResponse.indexOf('[');
    const lastBracket = textResponse.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1) {
      textResponse = textResponse.substring(firstBracket, lastBracket + 1);
    }

    const triggered = JSON.parse(textResponse);
    if (Array.isArray(triggered)) {
      return triggered.map(a => String(a));
    }
    return [];
  } catch (e) {
    console.error("Error in checkAllergiesWithAI:", e);
    return [];
  }
}
