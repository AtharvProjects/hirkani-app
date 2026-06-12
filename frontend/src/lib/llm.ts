import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function geminiVisionScan(base64Image: string, mimeType: string = "image/jpeg") {
  try {
    if (!apiKey) throw new Error("Missing Gemini API Key");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
If it is a raw single ingredient food (like a raw papaya or banana or apple), list that raw item as the single ingredient. For example, if it's papaya, the ingredients list MUST be ['papaya'].`;

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Image,
                mimeType
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const data = JSON.parse(result.response.text());
    if (data.detected_food && data.ingredients) {
      data.source = "vision_gemini";
      if (!data.nutrients) {
        data.nutrients = { sugar_g: 0, sodium_mg: 0, caffeine_mg: 0, trans_fat_g: 0, vitamin_a_mcg: 0 };
      }
      data.additives = [];
      return data;
    }
    return null;
  } catch (e) {
    console.error("Error calling Gemini Vision:", e);
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
