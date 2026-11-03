import { supabase } from './supabase';
import { useAppStore } from '@/store/useAppStore';
import { evaluatePregnancySafety } from './rulesEngine';
import { barcodeStage, searchStage, autocompleteStage } from './foodPipeline';
import { geminiVisionScan, geminiTextScan, generateSimpleExplanation } from './llm';
import { getDailyTips } from './recommendations';
import { logger } from './logger';

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
  // Enhanced Engine Fields (from FoodAnalysisResult integration)
  analysis_id?: string;
  overall_status?: 'generally_appropriate' | 'limit' | 'caution' | 'avoid' | 'insufficient_data' | 'not_suitable_for_profile';
  allergen_detections?: Array<{
    ingredientName: string;
    matchedAllergen: string;
    confidence: string;
    severity: string;
  }>;
  benefits_details?: Array<{
    benefitId: string;
    category: string;
    description: string;
  }>;
  concerns_details?: Array<{
    concernId: string;
    category: string;
    severity: string;
    description: string;
    recommendation?: string;
  }>;
  personalized_insights?: Array<{
    flagId: string;
    type: string;
    severity: string;
    message: string;
    action: string;
  }>;
  pregnancy_flags?: Array<{
    flagId: string;
    trimester?: number;
    week?: number;
    category: string;
    message: string;
    reasoning: string;
  }>;
  reasoning_chain?: {
    summary: string;
    scoreBreakdown: Record<string, string>;
    decisionTree: Array<{
      nodeId: string;
      decision: string;
      reasoning: string;
    }>;
  };
  evidence_sources?: Array<{
    sourceId: string;
    sourceName: string;
    sourceType: string;
    url?: string;
    evidenceLevel: string;
  }>;
  engine_version?: string;
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
  preferences?: any;
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
  score?: number;
}

export interface RecommendationResponse {
  category: string;
  items: RecommendationItem[];
}

export function calculatePregnancyFromDueDate(dueDateStr: string | null) {
  if (!dueDateStr) return null;
  const dueDate = new Date(dueDateStr);
  if (isNaN(dueDate.getTime())) return null;

  const today = new Date();
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Total pregnancy is 280 days (40 weeks).
  // Days pregnant = 280 - days until due date
  const daysPregnant = 280 - diffDays;
  
  let week = Math.floor(daysPregnant / 7) + 1;
  // Clamp week between 1 and 42
  if (week < 1) week = 1;
  if (week > 42) week = 42;
  
  const trimester = week <= 13 ? 1 : week <= 26 ? 2 : 3;
  return { week, trimester };
}

async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

async function storeScan(data: any, scanType: string, payloadStr: string): Promise<ScanResult> {
  const { data: { user } } = await supabase.auth.getUser();
  const profile = (await api.getProfile()) || useAppStore.getState().profile || {};
  
  let aiAllergies: string[] = [];
  if (profile.allergies && profile.allergies.length > 0) {
    const { checkAllergiesWithAI } = await import('./llm');
    aiAllergies = await checkAllergiesWithAI(data.detected_food, data.ingredients || [], profile.allergies);
  }
  
  const evalResult = await evaluatePregnancySafety(
    data.detected_food,
    data.ingredients || [],
    data.nutrients || {},
    profile,
    aiAllergies
  );

  // Safety Classification Fail-Safe Arbitration:
  // If EITHER the rules engine OR AI flagged alcohol, pan masala, or AVOID -> final is AVOID_DURING_PREGNANCY
  const aiClass = String(data.classification || "").toUpperCase();
  const isAiAvoid = aiClass === "AVOID_DURING_PREGNANCY" || aiClass === "AVOID" || Boolean(data.is_alcoholic) || Boolean(data.is_tobacco_or_pan_masala);
  const isRulesAvoid = evalResult.final === "AVOID_DURING_PREGNANCY";

  const isAiCaution = aiClass === "CONSUME_WITH_CAUTION" || aiClass === "CAUTION";
  const isRulesCaution = evalResult.final === "CONSUME_WITH_CAUTION";

  let finalClassification: SafetyClass = "SAFE";
  if (isRulesAvoid || isAiAvoid) {
    finalClassification = "AVOID_DURING_PREGNANCY";
  } else if (isRulesCaution || isAiCaution) {
    finalClassification = "CONSUME_WITH_CAUTION";
  }

  // If finalClassification became AVOID but rulesEngine originally thought SAFE or CAUTION:
  if (finalClassification === "AVOID_DURING_PREGNANCY" && evalResult.final !== "AVOID_DURING_PREGNANCY") {
    evalResult.final = "AVOID_DURING_PREGNANCY";
    evalResult.safetyScore = 15;
    evalResult.recommendation = "Do not consume during pregnancy";
    evalResult.sources = ["WHO", "CDC", "FDA"];
    if (data.is_alcoholic && !evalResult.ruleHits.some(r => r.key === "alcohol_beverage")) {
      evalResult.ruleHits.push({ key: "alcohol_beverage", severity: "AVOID_DURING_PREGNANCY", message: "Alcohol is unsafe at any level during pregnancy." });
    }
    if (data.is_tobacco_or_pan_masala && !evalResult.ruleHits.some(r => r.key === "pan_masala_tobacco")) {
      evalResult.ruleHits.push({ key: "pan_masala_tobacco", severity: "AVOID_DURING_PREGNANCY", message: "Pan masala and betel nut are toxic to fetal development." });
    }
    const { generateDetailedPregnancyReasons } = await import('./rulesEngine');
    evalResult.whyReasons = generateDetailedPregnancyReasons(
      data.detected_food,
      data.ingredients || [],
      data.nutrients || {},
      "AVOID_DURING_PREGNANCY",
      evalResult.ruleHits,
      profile
    );
  } else if (finalClassification === "CONSUME_WITH_CAUTION" && evalResult.final === "SAFE") {
    evalResult.final = "CONSUME_WITH_CAUTION";
    evalResult.safetyScore = 65;
    evalResult.recommendation = "Consume in moderation";
    const { generateDetailedPregnancyReasons } = await import('./rulesEngine');
    evalResult.whyReasons = generateDetailedPregnancyReasons(
      data.detected_food,
      data.ingredients || [],
      data.nutrients || {},
      "CONSUME_WITH_CAUTION",
      evalResult.ruleHits,
      profile
    );
  }

  const explanation = generateSimpleExplanation(evalResult.final, evalResult.ruleHits);
  const imageUrl = data.image_url || null;

  // Combine reasons from rulesEngine and Gemini AI (if available)
  const baseReasons = evalResult.whyReasons || [];
  const aiReasons = (data.pregnancy_safety_reasons || []) as string[];
  
  const combinedReasons: string[] = [...baseReasons];
  for (const ar of aiReasons) {
    if (!ar) continue;
    // Don't include AI reasons that contradict the final safety verdict
    if (evalResult.final === "AVOID_DURING_PREGNANCY") {
      if (/safe|wholesome|free from alcohol|pathogen-free|balanced nutritional/i.test(ar) && !/unsafe|not safe|avoid|harm/i.test(ar)) {
        continue;
      }
    } else if (evalResult.final === "SAFE") {
      if (/unsafe|avoid|toxic|danger|carcinogen|defect|miscarriage|fatal/i.test(ar)) {
        continue;
      }
    }
    if (!combinedReasons.some(br => br.toLowerCase().includes(ar.toLowerCase()) || ar.toLowerCase().includes(br.toLowerCase()))) {
      combinedReasons.push(ar);
    }
  }

  // Strictly strip any percentages from all reasons
  const { stripPercentages } = await import('./rulesEngine');
  const finalWhyReasons = combinedReasons.map(r => stripPercentages(r)).filter(Boolean);

  const dbRecordToInsert = {
    user_id: user?.id,
    scan_type: scanType ? scanType.substring(0, 20) : scanType,
    input_value: payloadStr ? payloadStr.substring(0, 255) : payloadStr, // Assuming input_value might be longer
    detected_food: data.detected_food,
    ingredients: JSON.stringify(data.ingredients || []),
    nutrients: JSON.stringify(data.nutrients || {}),
    additives: "[]",
    classification: evalResult.final === "AVOID_DURING_PREGNANCY" ? "AVOID" : evalResult.final,
    explanation,
    rule_hits: JSON.stringify(evalResult.ruleHits),
    alternatives: JSON.stringify(evalResult.alternatives),
    references: JSON.stringify(evalResult.references),
    thumbnail_base64: (typeof window !== 'undefined' && (window as any)._lastTinyThumb) ? (window as any)._lastTinyThumb : null
  };

  // Skip database insert if guest user
  if (!user) {
    return {
      ...dbRecordToInsert,
      id: Date.now(),
      created_at: new Date().toISOString(),
      ingredients: data.ingredients,
      nutrients: data.nutrients,
      why_reasons: finalWhyReasons,
      safety_score: evalResult.safetyScore,
      trimester_risk: evalResult.trimesterRisk,
      ingredients_analysis: evalResult.ingredientsAnalysis,
      recommendation: evalResult.recommendation,
      sources: evalResult.sources,
      nutrient_insights: evalResult.nutrientInsights
    } as any;
  }

  let { data: inserted, error } = await supabase.from('scan_records').insert(dbRecordToInsert).select().single();
  
  if (error && error.message.includes('thumbnail_base64')) {
    console.warn("thumbnail_base64 column missing in Supabase, retrying without it.");
    const { thumbnail_base64, ...dbRecordWithoutThumbnail } = dbRecordToInsert;
    const retryResult = await supabase.from('scan_records').insert(dbRecordWithoutThumbnail).select().single();
    inserted = retryResult.data;
    error = retryResult.error;
  }

  if (error) {
    console.error("Failed to save scan record:", JSON.stringify(error, null, 2));
    logger.error(error, "Supabase storeScan failure");
  } else if (inserted) {
    if (typeof window !== 'undefined') {
      const store = useAppStore.getState();
      const enrichedRecord = {
        ...inserted,
        why_reasons: JSON.stringify(finalWhyReasons),
        nutrient_insights: JSON.stringify(evalResult.nutrientInsights),
        ingredients_analysis: JSON.stringify(evalResult.ingredientsAnalysis)
      };
      store.setScanHistory([enrichedRecord, ...store.scanHistory]);
      
      if (imageUrl && inserted.id) {
        // Only store very small downscaled thumbnails in local storage (done in UI)
        store.setScanThumbnail(inserted.id.toString(), imageUrl);
      }
      
      // Increment streak if safe
      if (evalResult.final === "SAFE") {
        store.incrementStreak();
      }
    }
  }

  // Always return the original correctly typed arrays back to the frontend React components
  return {
    ...dbRecordToInsert,
    classification: evalResult.final as SafetyClass,
    id: inserted?.id,
    ingredients: data.ingredients || [],
    nutrients: data.nutrients || {},
    rule_hits: evalResult.ruleHits,
    alternatives: evalResult.alternatives,
    safety_score: evalResult.safetyScore,
    why_reasons: finalWhyReasons,
    trimester_risk: evalResult.trimesterRisk,
    ingredients_analysis: evalResult.ingredientsAnalysis,
    recommendation: evalResult.recommendation,
    sources: evalResult.sources,
    nutrient_insights: evalResult.nutrientInsights,
    references: evalResult.references,
    image_url: imageUrl
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
    
    // IKEA Effect: Sync guest profile to server if they just created one and have no server profile
    const guestProfile = useAppStore.getState().profile;
    const serverProfile = await api.getProfile().catch(() => null);
    if (!serverProfile && guestProfile) {
      await api.saveProfile(guestProfile).catch(console.error);
    }
    
    await api.getProfile().catch(console.error);
    useAppStore.getState().setAuthed(true);
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
    
    // IKEA Effect: Sync guest profile to server if they just created one
    const guestProfile = useAppStore.getState().profile;
    const serverProfile = await api.getProfile().catch(() => null);
    if (!serverProfile && guestProfile) {
      await api.saveProfile(guestProfile).catch(console.error);
    }
    
    await api.getProfile().catch(console.error);
    useAppStore.getState().setAuthed(true);
    return data;
  },

  login: async (body: { email: string; password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: body.email, password: body.password });
    if (error) throw new Error(error.message);
    const { clearMobileStateCache } = await import('@/components/mobile/auth');
    clearMobileStateCache();
    await api.getProfile().catch(console.error);
    useAppStore.getState().setAuthed(true);
    return data;
  },

  saveProfile: async (body: PregnancyProfile) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const state = useAppStore.getState();
    const prefs = {
      dueDate: state.dueDate,
      dailyWater: state.dailyWater,
      tookVitamin: state.tookVitamin,
      lastTrackedDate: state.lastTrackedDate,
      streakCount: state.streakCount,
      lastStreakDate: state.lastStreakDate,
      language: state.language
    };
    
    // If no user, just save locally for guest onboarding
    if (!user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('hk_profile', JSON.stringify(body));
        useAppStore.getState().setProfile(body);
      }
      return body;
    }
    
    const payload = { 
      user_id: user.id, 
      ...body,
      allergies: Array.isArray(body.allergies) ? JSON.stringify(body.allergies) : body.allergies,
      medical_conditions: Array.isArray(body.medical_conditions) ? JSON.stringify(body.medical_conditions) : body.medical_conditions,
      preferences: prefs
    };
    
    let result = await supabase
      .from('pregnancy_profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (result.error && result.error.message.includes('preferences')) {
      console.warn("Preferences column missing in Supabase, retrying without it.");
      const { preferences, ...payloadWithoutPrefs } = payload;
      result = await supabase
        .from('pregnancy_profiles')
        .upsert(payloadWithoutPrefs, { onConflict: 'user_id' })
        .select()
        .single();
    }

    if (result.error) throw new Error(result.error.message);
    const data = result.data;
    
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
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('hk_profile', JSON.stringify(data));
      useAppStore.getState().setProfile(data);
    }

    const { clearMobileStateCache } = await import('@/components/mobile/auth');
    clearMobileStateCache();
    return data;
  },

  syncPreferences: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // Silent return for guest users
      
      const state = useAppStore.getState();
      const prefs = {
        dueDate: state.dueDate,
        dailyWater: state.dailyWater,
        tookVitamin: state.tookVitamin,
        lastTrackedDate: state.lastTrackedDate,
        streakCount: state.streakCount,
        lastStreakDate: state.lastStreakDate,
        language: state.language
      };
      await supabase
        .from('pregnancy_profiles')
        .update({ preferences: prefs })
        .eq('user_id', user.id);
    } catch (e) {
      console.error("Failed to sync preferences", e);
    }
  },

  getProfile: async (): Promise<PregnancyProfile | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return useAppStore.getState().profile; // Use local profile for guests
    
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
      if (typeof data.preferences === 'string') {
        try { data.preferences = JSON.parse(data.preferences); } catch (e) {}
      }
      if (data.preferences) {
        useAppStore.getState().hydratePreferences(data.preferences);
      }
      
      // Merge name from auth metadata if not in profile
      if (!data.name && user.user_metadata?.full_name) {
        data.name = user.user_metadata.full_name;
      }
      
      // Auto-increment week if dueDate is set
      const state = useAppStore.getState();
      const dueDate = state.dueDate;
      if (dueDate) {
        const calc = calculatePregnancyFromDueDate(dueDate);
        if (calc) {
          let updated = false;
          if (data.pregnancy_week !== calc.week) {
            data.pregnancy_week = calc.week;
            updated = true;
          }
          if (data.trimester !== calc.trimester) {
            data.trimester = calc.trimester;
            updated = true;
          }
          // Optionally sync to db here, but updating local is enough for now
          if (updated) {
            supabase.from('pregnancy_profiles').update({ pregnancy_week: calc.week, trimester: calc.trimester }).eq('user_id', user.id).then();
          }
        }
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('hk_profile', JSON.stringify(data));
        useAppStore.getState().setProfile(data);
      }
    }
    
    return data;
  },

  analyzeBarcode: async (barcode: string, frameData?: string): Promise<ScanResult> => {
    try {
      let data = await barcodeStage(barcode);
      if (!data) {
        console.log("Barcode not found in OFF, falling back to Gemini for:", barcode);
        if (frameData) {
          try {
            const lang = useAppStore.getState().language || 'en';
            data = await geminiVisionScan(frameData, "image/jpeg", lang);
          } catch (visionErr: any) {
            console.warn("Vision scan fallback failed, trying text scan:", visionErr);
            if (visionErr.message === "NOT_FOOD") {
              throw visionErr; // Do not fallback to text scan if it's explicitly not food
            }
          }
        }
        if (!data) {
           const lang = useAppStore.getState().language || 'en';
           data = await geminiTextScan(`Product with Barcode ${barcode}`, lang);
        }
      }
      if (!data) throw new Error("Failed to analyze barcode");
      return storeScan(data, "barcode", barcode);
    } catch (error) {
      logger.error(error, "analyzeBarcode");
      throw error;
    }
  },

  analyzeText: async (scanType: "ocr" | "image" | "search", payload: string): Promise<ScanResult> => {
    try {
      let data;
      if (scanType === "search") {
        data = await searchStage(payload);
        if (!data) {
          const lang = useAppStore.getState().language || 'en';
          data = await geminiTextScan(payload, lang);
        }
      } else {
        data = { detected_food: payload, ingredients: [payload], source: "text" };
      }
      if (!data) throw new Error("Failed to analyze text");
      return storeScan(data, scanType, payload);
    } catch (error) {
      logger.error(error, "analyzeText");
      throw error;
    }
  },

  uploadImage: async (fileOrDataUrl: File | string, fileName: string = "food_photo.jpg"): Promise<ScanResult> => {
    try {
      let base64 = "";
      let mimeType = "image/jpeg";
      if (typeof fileOrDataUrl === "string") {
        base64 = fileOrDataUrl;
        if (fileOrDataUrl.includes(",")) {
          const commaIdx = fileOrDataUrl.indexOf(",");
          const prefix = fileOrDataUrl.substring(0, commaIdx);
          base64 = fileOrDataUrl.substring(commaIdx + 1);
          const mimeMatch = prefix.match(/data:([^;]+)/);
          if (mimeMatch) mimeType = mimeMatch[1];
        }
      } else {
        base64 = await fileToBase64(fileOrDataUrl);
        mimeType = fileOrDataUrl.type || "image/jpeg";
        fileName = fileOrDataUrl.name || fileName;
      }
      const lang = useAppStore.getState().language || 'en';
      const data = await geminiVisionScan(base64, mimeType, lang);
      if (!data) throw new Error("Could not detect food in this image. Please try another angle.");
      return storeScan(data, "image", fileName);
    } catch (error) {
      logger.error(error, "uploadImage");
      throw error;
    }
  },

  autocomplete: async (q: string): Promise<AutocompleteItem[]> => {
    return autocompleteStage(q);
  },

  history: async (): Promise<ScanResult[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('scan_records')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
      
    if (error) return [];
      
      const store = useAppStore.getState();
      store.setScanHistory(data);
      
      // Hydrate thumbnails & fix classification length limits
      data.forEach(record => {
        if (record.classification === "AVOID") {
          record.classification = "AVOID_DURING_PREGNANCY";
        }
        if (record.thumbnail_base64 && record.id) {
          store.setScanThumbnail(record.id.toString(), record.thumbnail_base64);
        }
      });
      
      return data;
  },

  tips: async () => {
    const profile = await api.getProfile();
    return getDailyTips(profile);
  },

  favorites: async (): Promise<{ id: number; food_name: string; last_classification: string }[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('favorite_foods')
      .select('id, food_name, last_classification')
      .eq('user_id', user.id);
    if (error) return [];
    
    useAppStore.getState().setFavorites(data);
    return data;
  },

  addFavorite: async (foodName: string, classification: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Must be logged in to save favorites");
    
    const { data, error } = await supabase
      .from('favorite_foods')
      .insert({ user_id: user.id, food_name: foodName, last_classification: classification })
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
