import { supabase } from './frontend/src/lib/supabase.ts';

async function testInsert() {
  const { data: user } = await supabase.auth.getUser();
  console.log("User:", user?.user?.id);
  
  const record = {
    user_id: user?.user?.id,
    scan_type: "test",
    input_value: "test",
    detected_food: "test",
    ingredients: [],
    nutrients: {},
    classification: "SAFE",
    explanation: "test",
    rule_hits: [],
    alternatives: [],
    safety_score: 100,
    why_reasons: [],
    trimester_risk: null,
    ingredients_analysis: [],
    recommendation: "test",
    sources: [],
    references: [],
    image_url: "test"
  };

  const { data, error } = await supabase.from('scan_records').insert(record).select().single();
  if (error) {
    console.error("Error:", JSON.stringify(error, null, 2));
  } else {
    console.log("Success:", data);
  }
}

testInsert();
