import { NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { profile } = await req.json();

    const trimester = profile?.trimester || 2;
    const conditions = profile?.medical_conditions?.length ? profile.medical_conditions.join(", ") : "none";
    const allergies = profile?.allergies?.length ? profile.allergies.join(", ") : "none";
    const diet = profile?.diet_preference || "general";

    const prompt = `Generate exactly 2 short, medically sound daily pregnancy tips for a woman in trimester ${trimester}. Medical conditions: ${conditions}. Allergies: ${allergies}. Diet: ${diet}. Format as a JSON object with a 'tips' key containing a list of exactly two string tips.
{
  "tips": ["Tip 1", "Tip 2"]
}`;

    const apiKey = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing OpenRouter API Key on server' }, { status: 500 });
    }

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
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter API error:", errText);
      return NextResponse.json({ error: 'Failed to fetch from OpenRouter' }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Tips API Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
