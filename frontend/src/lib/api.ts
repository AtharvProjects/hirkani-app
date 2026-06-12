import { supabase } from './supabase';
import { evaluatePregnancySafety } from './rulesEngine';
import { barcodeStage, searchStage, autocompleteStage } from './foodPipeline';
import { geminiVisionScan, generateSimpleExplanation } from './llm';
import { getDailyTips } from './recommendations';

export type SafetyClass = "SAFE" | "CONSUME_WITH_CAUTION" | "AVOID_DURING_PREGNANCY";

export interface ScanResult {
  id?: number;
  detected_food: string;
  classification: SafetyClass;
  explanation: string;
  nutrient_insights: { name: string; benefit: string }[];
  references: { title: string; url: string }[];
  alternatives: string[];
  rule_hits: { key: string; severity: string; message: string }[];
  safety_score: number;
  why_reasons: string[];
  trimester_risk?: string | null;
  ingredients_analysis: { name: string; safety: string }[];
  recommendation?: string | null;
  sources: string[];
  image_url?: string | null;
  created_at?: string;
  user_id?: string;
  input_value?: string;
  scan_type?: string;
  ingredients?: any[];
  nutrients?: any;
}

export interface AutocompleteItem {
  name: string;
  image?: string;
  code?: string;
}

export interface PregnancyProfile {
  id?: number;
  name?: string;
  age?: number;
  pregnancy_week?: number;
  diet_preference?: string;
  allergies?: string[];
  medical_conditions?: string[];
  doctor_restrictions?: string;
  trimester?: number;
}

export interface RecommendationItem {
  name: string;
  sub: string;
  img: string;
  bg: string;
  safety: "SAFE" | "CONSUME_WITH_CAUTION" | "AVOID_DURING_PREGNANCY";
  reasons: string[];
  benefit: string;
  tags: string[];
}

export interface RecommendationResponse {
  category: string;
  items: RecommendationItem[];
}

async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

async function storeScan(data: any, scanType: string, payloadStr: string): Promise<ScanResult> {
  const user = await getUser();
  const profile = await api.getProfile() || {};
  
  const evalResult = evaluatePregnancySafety(
    data.detected_food,
    data.ingredients || [],
    data.nutrients || {},
    profile
  );

  const explanation = generateSimpleExplanation(evalResult.final, evalResult.ruleHits);
  const imageUrl = data.image_url || null;

  const dbRecord = {
    user_id: user.id,
    scan_type: scanType,
    input_value: payloadStr,
    detected_food: data.detected_food,
    ingredients: JSON.stringify(data.ingredients || []),
    nutrients: JSON.stringify(data.nutrients || {}),
    classification: evalResult.final,
    explanation,
    rule_hits: JSON.stringify(evalResult.ruleHits),
    alternatives: JSON.stringify(evalResult.alternatives),
    safety_score: evalResult.safetyScore,
    why_reasons: JSON.stringify(evalResult.whyReasons),
    trimester_risk: evalResult.trimesterRisk,
    ingredients_analysis: JSON.stringify(evalResult.ingredientsAnalysis),
    recommendation: evalResult.recommendation,
    sources: JSON.stringify(evalResult.sources),
    nutrient_insights: JSON.stringify(evalResult.nutrientInsights),
    references: JSON.stringify([{ title: "WHO maternal nutrition guidance", url: "https://www.who.int/health-topics/pregnancy" }]),
    image_url: imageUrl
  };

  const { data: inserted, error } = await supabase.from('scan_records').insert(dbRecord).select().single();
  if (error) console.error("Failed to save scan record:", JSON.stringify(error, null, 2));

  // Always return the original correctly typed arrays back to the frontend React components
  return {
    ...dbRecord,
    classification: evalResult.final as SafetyClass,
    id: inserted?.id,
    ingredients: data.ingredients || [],
    nutrients: data.nutrients || {},
    rule_hits: evalResult.ruleHits,
    alternatives: evalResult.alternatives,
    why_reasons: evalResult.whyReasons,
    ingredients_analysis: evalResult.ingredientsAnalysis,
    sources: evalResult.sources,
    nutrient_insights: evalResult.nutrientInsights,
    references: [{ title: "WHO maternal nutrition guidance", url: "https://www.who.int/health-topics/pregnancy" }]
  };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = error => reject(error);
  });
}

export const api = {
  googleLogin: async (credential: string) => {
    const { data, error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: credential });
    if (error) throw new Error(error.message);
    const { clearMobileStateCache } = await import('@/components/mobile/auth');
    clearMobileStateCache();
    return data;
  },

  signup: async (body: { name: string; email: string; password: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email: body.email, password: body.password,
      options: { data: { full_name: body.name } }
    });
    if (error) throw new Error(error.message);
    if (data.user && !data.session) {
      throw new Error("Please check your email to verify your account before logging in.");
    }
    const { clearMobileStateCache } = await import('@/components/mobile/auth');
    clearMobileStateCache();
    return data;
  },

  login: async (body: { email: string; password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: body.email, password: body.password });
    if (error) throw new Error(error.message);
    const { clearMobileStateCache } = await import('@/components/mobile/auth');
    clearMobileStateCache();
    return data;
  },

  saveProfile: async (body: PregnancyProfile) => {
    const user = await getUser();
    const payload = { 
      user_id: user.id, 
      ...body,
      allergies: Array.isArray(body.allergies) ? JSON.stringify(body.allergies) : body.allergies,
      medical_conditions: Array.isArray(body.medical_conditions) ? JSON.stringify(body.medical_conditions) : body.medical_conditions,
    };
    
    const { data, error } = await supabase
      .from('pregnancy_profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();
    if (error) throw new Error(error.message);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('hk_profile', JSON.stringify(data));
    }

    const { clearMobileStateCache } = await import('@/components/mobile/auth');
    clearMobileStateCache();
    return data;
  },

  getProfile: async (): Promise<PregnancyProfile | null> => {
    const user = await getUser();
    const { data, error } = await supabase
      .from('pregnancy_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    
    if (data) {
      if (typeof data.allergies === 'string') {
        try { data.allergies = JSON.parse(data.allergies); } 
        catch (e) { data.allergies = data.allergies.replace(/[{}]/g, '').split(',').filter(Boolean); }
      }
      if (typeof data.medical_conditions === 'string') {
        try { data.medical_conditions = JSON.parse(data.medical_conditions); } 
        catch (e) { data.medical_conditions = data.medical_conditions.replace(/[{}]/g, '').split(',').filter(Boolean); }
      }
      if (!Array.isArray(data.allergies)) data.allergies = [];
      if (!Array.isArray(data.medical_conditions)) data.medical_conditions = [];
      
      // Merge name from auth metadata if not in profile
      if (!data.name && user.user_metadata?.full_name) {
        data.name = user.user_metadata.full_name;
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('hk_profile', JSON.stringify(data));
      }
    }
    
    return data;
  },

  analyzeBarcode: async (barcode: string): Promise<ScanResult> => {
    const data = await barcodeStage(barcode);
    if (!data) throw new Error("Failed to analyze barcode");
    return storeScan(data, "barcode", barcode);
  },

  analyzeText: async (scanType: "ocr" | "image" | "search", payload: string): Promise<ScanResult> => {
    let data;
    if (scanType === "search") {
      data = await searchStage(payload);
    } else {
      data = { detected_food: payload, ingredients: [payload], source: "text" };
    }
    if (!data) throw new Error("Failed to analyze text");
    return storeScan(data, scanType, payload);
  },

  uploadImage: async (file: File): Promise<ScanResult> => {
    const base64 = await fileToBase64(file);
    const data = await geminiVisionScan(base64, file.type);
    if (!data) throw new Error("Failed to process image with Vision AI");
    return storeScan(data, "image", file.name);
  },

  autocomplete: async (q: string): Promise<AutocompleteItem[]> => {
    return autocompleteStage(q);
  },

  history: async (): Promise<any[]> => {
    const user = await getUser();
    const { data, error } = await supabase
      .from('scan_records')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) return [];
    return data;
  },

  tips: async () => {
    const profile = await api.getProfile();
    return getDailyTips(profile);
  },

  favorites: async (): Promise<{ id: number; food_name: string; last_classification: string }[]> => {
    const user = await getUser();
    const { data, error } = await supabase
      .from('favorite_foods')
      .select('id, food_name, last_classification')
      .eq('user_id', user.id);
    if (error) return [];
    return data;
  },

  addFavorite: async (food_name: string, last_classification: string) => {
    const user = await getUser();
    const { data, error } = await supabase
      .from('favorite_foods')
      .insert({ user_id: user.id, food_name, last_classification })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  deleteFavorite: async (favorite_id: number) => {
    const { error } = await supabase.from('favorite_foods').delete().eq('id', favorite_id);
    if (error) throw new Error(error.message);
    return true;
  },

  getRecommendations: async (profile?: PregnancyProfile | null): Promise<RecommendationResponse[]> => {
    const { getProfileRecommendations } = await import('./recommendations');
    const p = profile || await api.getProfile();
    return getProfileRecommendations(p);
  }
};
