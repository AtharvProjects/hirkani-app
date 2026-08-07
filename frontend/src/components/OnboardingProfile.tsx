"use client";

import { useState, useMemo } from "react";
import { Loader2, Baby, Salad, ShieldAlert, Apple, ChevronLeft, ArrowRight, Languages, CheckCircle2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { useTranslation, LanguageCode } from "@/lib/i18n";

// Goal Gradient: Step labels including phantom "Account Created" step
const STEP_LABELS = ["Account Created", "Language", "Profile", "Diet", "Health"];

// Smart Default: Compute a due date ~20 weeks from today (mid-pregnancy)
function getSmartDefaultDueDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 20 * 7); // 20 weeks from now
  return d.toISOString().split('T')[0];
}

// Baby size data for instant gratification preview (IKEA Effect)
const BABY_SIZE_MAP: Record<number, string> = {
  4: "Poppy seed", 8: "Raspberry", 12: "Lime", 16: "Avocado",
  20: "Banana", 24: "Corn on the cob", 28: "Eggplant",
  32: "Jicama", 36: "Romaine lettuce", 40: "Small pumpkin",
};
function getBabySizeForWeek(week: number): string {
  const keys = Object.keys(BABY_SIZE_MAP).map(Number).sort((a, b) => a - b);
  let closest = keys[0];
  for (const k of keys) { if (k <= week) closest = k; }
  return BABY_SIZE_MAP[closest] || "tiny seed";
}

const DIETS = ["Veg", "Non Veg", "Vegan", "Pescatarian"];
const COMMON_ALLERGIES = ["None", "Dairy", "Nuts", "Gluten", "Seafood"];
const COMMON_CONDITIONS = ["None", "Gestational Diabetes", "Anemia", "Hypertension"];

export function OnboardingProfile({
  onDone,
  initialData,
  onCancel,
}: {
  onDone: () => void;
  initialData?: any;
  onCancel?: () => void;
}) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  // Goal Gradient: Visual total includes phantom "Account Created" step
  const visualTotalSteps = 5;
  // Progress includes +1 for the phantom step that's always complete
  const progressPercent = Math.round(((step) / visualTotalSteps) * 100);
  
  const { t, language } = useTranslation();
  const setLanguage = require('@/store/useAppStore').useAppStore((s: any) => s.setLanguage);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Smart Default: Pre-fill age to 28 (India median maternal age)
  const [age, setAge] = useState(initialData?.age ? String(initialData.age) : "28");
  
  const { dueDate: initialDueDate, setDueDate } = require('@/store/useAppStore').useAppStore();
  const [dueDateStr, setDueDateStr] = useState(initialDueDate || "");
  const [week, setWeek] = useState(initialData?.pregnancy_week ? String(initialData.pregnancy_week) : "");
  const [diet, setDiet] = useState(initialData?.diet_preference || "Veg");

  // Smart Default: Pre-select "None" so users scan-and-adjust
  const [allergies, setAllergies] = useState<string[]>(() => {
    if (!initialData?.allergies) return ["None"];
    const predefined = ["None", "Dairy", "Nuts", "Gluten", "Seafood"];
    return initialData.allergies.filter((a: string) => predefined.includes(a));
  });

  const [otherAllergy, setOtherAllergy] = useState(() => {
    if (!initialData?.allergies) return "";
    const predefined = ["None", "Dairy", "Nuts", "Gluten", "Seafood"];
    const customs = initialData.allergies.filter((a: string) => !predefined.includes(a));
    return customs.join(", ");
  });

  const [showOtherAllergy, setShowOtherAllergy] = useState(() => {
    if (!initialData?.allergies) return false;
    const predefined = ["None", "Dairy", "Nuts", "Gluten", "Seafood"];
    return initialData.allergies.some((a: string) => !predefined.includes(a));
  });

  // Smart Default: Pre-select "None" so users scan-and-adjust
  const [conditions, setConditions] = useState<string[]>(() => {
    if (!initialData?.medical_conditions) return ["None"];
    const predefined = ["None", "Gestational Diabetes", "Anemia", "Hypertension"];
    return initialData.medical_conditions.filter((c: string) => predefined.includes(c));
  });

  const [otherCondition, setOtherCondition] = useState(() => {
    if (!initialData?.medical_conditions) return "";
    const predefined = ["None", "Gestational Diabetes", "Anemia", "Hypertension"];
    const customs = initialData.medical_conditions.filter((c: string) => !predefined.includes(c));
    return customs.join(", ");
  });

  const [showOtherCondition, setShowOtherCondition] = useState(() => {
    if (!initialData?.medical_conditions) return false;
    const predefined = ["None", "Gestational Diabetes", "Anemia", "Hypertension"];
    return initialData.medical_conditions.some((c: string) => !predefined.includes(c));
  });

  const [restrictions, setRestrictions] = useState(initialData?.doctor_restrictions || "");

  const toggleList = (list: string[], setList: (v: string[]) => void, item: string) => {
    if (item === "None") { setList(["None"]); return; }
    let filtered = list.filter((x) => x !== "None");
    setList(filtered.includes(item) ? filtered.filter((x) => x !== item) : [...filtered, item]);
  };

  const handleNext = () => {
    setErrorMsg("");
    if (step === 2) {
      const parsedAge = parseInt(age);
      if (isNaN(parsedAge) || parsedAge < 13 || parsedAge > 55) {
        setErrorMsg("Please enter a valid age (13-55).");
        return;
      }
      if (!dueDateStr && !week) {
        setErrorMsg("Please enter either your Due Date or current Pregnancy Week.");
        return;
      }
      let parsedWeek = parseInt(week);
      if (dueDateStr) {
        const calc = require('@/lib/api').calculatePregnancyFromDueDate(dueDateStr);
        if (calc) parsedWeek = calc.week;
      }
      if (isNaN(parsedWeek) || parsedWeek < 1 || parsedWeek > 42) {
        setErrorMsg("Invalid pregnancy week or Due Date.");
        return;
      }
    }
    setStep(s => Math.min(s + 1, totalSteps));
  };

  const submit = async () => {
    setErrorMsg("");
    const parsedAge = parseInt(age);
    let parsedWeek = parseInt(week);
    
    if (dueDateStr) {
      const calc = require('@/lib/api').calculatePregnancyFromDueDate(dueDateStr);
      if (calc) {
        parsedWeek = calc.week;
        setDueDate(dueDateStr);
      }
    }

    setLoading(true);
    try {
      const finalAllergies = [...allergies.filter((a) => a !== "None")];
      if (showOtherAllergy && otherAllergy.trim()) {
        otherAllergy.split(",").forEach((item: string) => {
          const val = item.trim();
          if (val && !finalAllergies.includes(val)) finalAllergies.push(val);
        });
      }
      if (finalAllergies.length === 0) finalAllergies.push("None");

      const finalConditions = [...conditions.filter((c) => c !== "None")];
      if (showOtherCondition && otherCondition.trim()) {
        otherCondition.split(",").forEach((item: string) => {
          const val = item.trim();
          if (val && !finalConditions.includes(val)) finalConditions.push(val);
        });
      }
      if (finalConditions.length === 0) finalConditions.push("None");

      const calculatedTrimester = parsedWeek <= 13 ? 1 : parsedWeek <= 26 ? 2 : 3;

      await api.saveProfile({
        age: parsedAge,
        pregnancy_week: parsedWeek,
        trimester: calculatedTrimester,
        diet_preference: diet,
        allergies: finalAllergies,
        medical_conditions: finalConditions,
        doctor_restrictions: restrictions,
      });
      onDone();
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to save profile. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  const SectionLabel = ({ icon: Icon, label }: { icon: any; label: string }) => (
    <div className="flex items-center gap-2 mb-3">
      <div
        className="flex h-7 w-7 items-center justify-center rounded-full"
        style={{ background: "rgba(0, 122, 255,0.12)", border: "1px solid rgba(0, 122, 255,0.18)" }}
      >
        <Icon size={14} style={{ color: "var(--accent-main)" }} />
      </div>
      <span
        className="text-[11px] font-extrabold uppercase tracking-[0.20em]"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
    </div>
  );

  // IKEA Effect: Compute live pregnancy week from due date for instant gratification
  const computedWeek = useMemo(() => {
    if (!dueDateStr) return parseInt(week) || null;
    try {
      const calc = require('@/lib/api').calculatePregnancyFromDueDate(dueDateStr);
      return calc?.week || null;
    } catch { return null; }
  }, [dueDateStr, week]);

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 50 : -50, opacity: 0 })
  };

  return (
    <div className="flex flex-col">
      {/* Strict Wizard Header */}
      <div className="relative pt-2 pb-4 flex items-center justify-between z-10 shrink-0">
        <div className="w-10 h-10 z-20">
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)} className="flex items-center justify-center w-10 h-10 rounded-full glass-card hover:bg-white/40 active:scale-95 transition-all">
              <ChevronLeft size={20} />
            </button>
          ) : onCancel ? (
            <button onClick={onCancel} className="flex items-center justify-center w-10 h-10 rounded-full glass-card hover:bg-white/40 active:scale-95 transition-all">
              <ChevronLeft size={20} />
            </button>
          ) : null}
        </div>
        
        {/* Goal Gradient: Progress bar with percentage + step labels */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="flex gap-1.5 items-center mt-1">
            {/* Phantom step 0 (Account Created) — always filled */}
            <div className="h-1.5 w-4 rounded-full transition-all duration-500" style={{
              background: "var(--accent-main)"
            }} />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-1.5 w-4 rounded-full transition-all duration-500" style={{
                background: step >= i ? "var(--accent-main)" : "rgba(0,0,0,0.08)"
              }} />
            ))}
            <span className="text-[10px] font-black ml-1.5 tabular-nums" style={{ color: "var(--accent-main)" }}>
              {progressPercent}%
            </span>
          </div>
        </div>
        
        <div className="w-10 h-10 z-20" />
      </div>

      <div className="flex-1 pt-4 flex flex-col">
        {/* Goal Gradient: "Account Created" badge — shown on step 1 */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex items-center gap-2 mx-auto mb-3 px-4 py-2 rounded-full"
            style={{ background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.20)" }}
          >
            <CheckCircle2 size={14} style={{ color: "#10B981" }} />
            <span className="text-[11px] font-black text-emerald-700 uppercase tracking-wider">Account Created</span>
          </motion.div>
        )}

        <div className="mb-6 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              background: "var(--glass-bg-elevated)",
              border: "2px solid var(--glass-bg-elevated)",
              boxShadow: "var(--glass-shadow-elevated)",
            }}
          >
            {step === 1 ? <Languages size={24} style={{ color: "var(--accent-main)" }} /> : <Apple size={24} style={{ color: "var(--accent-main)" }} />}
          </motion.div>
          <h2 className="text-[26px] font-black tracking-tight font-display leading-tight" style={{ color: "var(--text-primary)" }}>
            {step === 1 ? t("onboarding.chooseLanguage") : step === 2 ? "Let's setup your profile" : step === 3 ? "What do you eat?" : "Any health guidelines?"}
          </h2>
          <p className="text-[14px] font-medium mt-1.5" style={{ color: "var(--text-secondary)" }}>
            {step === 1 ? "This applies to all app features." : step === 2 ? "Help us customize your pregnancy food guide." : step === 3 ? "We'll tailor food safety to your diet." : "We'll watch out for these conditions."}
          </p>
        </div>

        <div className="flex-1 relative">
          <AnimatePresence mode="wait" custom={1}>
            <motion.div
              key={step}
              custom={1}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="glass-card-premium p-6 w-full"
            >
              {step === 1 && (
                <div className="space-y-4">
                  {[
                    { code: "en", label: "English" },
                    { code: "mr", label: "मराठी (Marathi)" },
                    { code: "hi", label: "हिन्दी (Hindi)" }
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code); handleNext(); }}
                      className="w-full relative flex items-center justify-between p-4 rounded-[20px] transition-all duration-300"
                      style={{
                        background: language === lang.code ? "rgba(255,255,255,1)" : "var(--glass-bg-medium)",
                        border: language === lang.code ? "2px solid var(--accent-main)" : "1px solid rgba(0,0,0,0.05)",
                        boxShadow: language === lang.code ? "0 8px 24px rgba(0, 122, 255,0.15)" : "none",
                      }}
                    >
                      <span className="text-[16px] font-bold" style={{ color: "var(--text-primary)" }}>{lang.label}</span>
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${language === lang.code ? 'border-[var(--accent-main)]' : 'border-gray-300'}`}>
                        {language === lang.code && <div className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--accent-main)" }} />}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-[0.18em] mb-2 ml-1" style={{ color: "var(--text-muted)" }}>
                      Age
                    </label>
                    <input
                      type="number"
                      className="hk-input text-[16px] px-5 py-4 h-auto"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 29"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-[0.18em] mb-2 ml-1" style={{ color: "var(--text-muted)" }}>
                      Due Date (EDD)
                    </label>
                    <input
                      type="date"
                      className="hk-input text-[16px] px-5 py-4 h-auto"
                      value={dueDateStr}
                      onChange={(e) => {
                        setDueDateStr(e.target.value);
                        setWeek("");
                      }}
                    />
                  </div>
                  
                  {!dueDateStr && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pt-2">
                      <label className="block text-[11px] font-extrabold uppercase tracking-[0.18em] mb-2 ml-1" style={{ color: "var(--text-muted)" }}>
                        Or Manual Week
                      </label>
                      <input
                        type="number"
                        className="hk-input text-[16px] px-5 py-4 h-auto"
                        value={week}
                        onChange={(e) => setWeek(e.target.value)}
                        placeholder="e.g. 18 (if EDD unknown)"
                      />
                    </motion.div>
                  )}
                {/* IKEA Effect: Instant gratification — show baby size preview when due date is entered */}
                {(dueDateStr || week) && computedWeek && computedWeek >= 1 && computedWeek <= 42 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, scale: 1, height: "auto", marginTop: 16 }}
                    className="rounded-[20px] p-4 flex items-center gap-3 overflow-hidden"
                    style={{ background: "rgba(0, 122, 255,0.06)", border: "1px solid rgba(0, 122, 255,0.12)" }}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(0, 122, 255,0.12)" }}>
                      <Baby size={18} style={{ color: "var(--accent-main)" }} />
                    </div>
                    <div>
                      <div className="text-[13px] font-black" style={{ color: "var(--text-primary)" }}>
                        🎉 Week {computedWeek} — Trimester {computedWeek <= 13 ? 1 : computedWeek <= 26 ? 2 : 3}
                      </div>
                      <div className="text-[11px] font-bold mt-0.5" style={{ color: "var(--text-secondary)" }}>
                        Your baby is the size of a <span style={{ color: "var(--accent-main)", fontWeight: 900 }}>{getBabySizeForWeek(computedWeek)}</span>!
                      </div>
                    </div>
                  </motion.div>
                )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <SectionLabel icon={Salad} label="Diet Preference" />
                    <div className="flex flex-wrap gap-2.5">
                      {DIETS.map((d) => (
                        <button key={d} onClick={() => setDiet(d)} className={`hk-chip ${diet === d ? "hk-chip-active" : ""}`}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <SectionLabel icon={ShieldAlert} label="Allergies" />
                    <div className="flex flex-wrap gap-2.5">
                      {COMMON_ALLERGIES.map((a) => (
                        <button key={a} onClick={() => toggleList(allergies, setAllergies, a)} className={`hk-chip ${allergies.includes(a) ? "hk-chip-active" : ""}`}>
                          {a}
                        </button>
                      ))}
                      <button onClick={() => setShowOtherAllergy(!showOtherAllergy)} className={`hk-chip ${showOtherAllergy ? "hk-chip-active" : ""}`}>
                        Other
                      </button>
                    </div>
                    <AnimatePresence>
                      {showOtherAllergy && (
                        <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: "auto", marginTop: 12 }} exit={{ opacity: 0, height: 0, marginTop: 0 }}>
                          <input className="hk-input" value={otherAllergy} onChange={(e) => setOtherAllergy(e.target.value)} placeholder="Type other allergies..." />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <SectionLabel icon={Baby} label="Medical Conditions" />
                    <div className="flex flex-wrap gap-2.5">
                      {COMMON_CONDITIONS.map((c) => (
                        <button key={c} onClick={() => toggleList(conditions, setConditions, c)} className={`hk-chip ${conditions.includes(c) ? "hk-chip-active" : ""}`}>
                          {c}
                        </button>
                      ))}
                      <button onClick={() => setShowOtherCondition(!showOtherCondition)} className={`hk-chip ${showOtherCondition ? "hk-chip-active" : ""}`}>
                        Other
                      </button>
                    </div>
                    <AnimatePresence>
                      {showOtherCondition && (
                        <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: "auto", marginTop: 12 }} exit={{ opacity: 0, height: 0, marginTop: 0 }}>
                          <input className="hk-input" value={otherCondition} onChange={(e) => setOtherCondition(e.target.value)} placeholder="Type other conditions..." />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-[0.18em] mb-2 ml-1" style={{ color: "var(--text-muted)" }}>
                      Doctor Restrictions <span className="normal-case opacity-60">(optional)</span>
                    </label>
                    <input className="hk-input" value={restrictions} onChange={(e) => setRestrictions(e.target.value)} placeholder="e.g. No raw fish" />
                  </div>
                </div>
              )}

              <AnimatePresence>
                {errorMsg && (
                  <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: "auto", marginTop: 16 }} exit={{ opacity: 0, height: 0, marginTop: 0 }} className="overflow-hidden">
                    <div className="text-[13px] font-bold text-red-600 bg-red-100/60 border border-red-200/60 p-3.5 rounded-[16px] text-center backdrop-blur-md">
                      ⚠️ {errorMsg}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="pb-8 pt-6">
          {step < 3 ? (
            <button onClick={handleNext} className="btn-primary w-full h-[56px] text-[16px] rounded-[24px] flex items-center justify-center gap-2">
              Continue <ArrowRight size={18} />
            </button>
          ) : (
            <button onClick={submit} disabled={loading} className="btn-primary w-full h-[56px] text-[16px] rounded-[24px] flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><Sparkles size={16} /> Complete Profile — Almost Done!</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
