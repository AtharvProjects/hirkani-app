"use client";

import { useState } from "react";
import { Loader2, Baby, Salad, ShieldAlert, Apple } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

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
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [age, setAge] = useState(initialData?.age ? String(initialData.age) : "");
  const [week, setWeek] = useState(initialData?.pregnancy_week ? String(initialData.pregnancy_week) : "");
  const [diet, setDiet] = useState(initialData?.diet_preference || "Veg");

  const [allergies, setAllergies] = useState<string[]>(() => {
    if (!initialData?.allergies) return [];
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

  const [conditions, setConditions] = useState<string[]>(() => {
    if (!initialData?.medical_conditions) return [];
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

  const submit = async () => {
    setErrorMsg("");

    const parsedAge = parseInt(age);
    if (isNaN(parsedAge) || parsedAge < 13 || parsedAge > 55) {
      setErrorMsg("Age must be between 13 and 55");
      return;
    }

    const parsedWeek = parseInt(week);
    if (isNaN(parsedWeek) || parsedWeek < 1 || parsedWeek > 42) {
      setErrorMsg("Pregnancy week must be between 1 and 42");
      return;
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
        style={{ background: "rgba(244,88,122,0.12)" }}
      >
        <Icon size={14} style={{ color: "var(--pink-hot)" }} />
      </div>
      <span
        className="text-[11px] font-extrabold uppercase tracking-[0.20em]"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.34, 1.1, 0.64, 1] }}
    >
      {/* Header */}
      <div className="mb-6 text-center">
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            background: "rgba(255,255,255,0.55)",
            border: "2px solid rgba(255,255,255,0.80)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 8px 24px rgba(244,88,122,0.20)",
          }}
        >
          <Apple size={28} style={{ color: "var(--pink-hot)" }} />
        </div>
        <h2 className="text-[24px] font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
          Personalize Your Guide
        </h2>
        <p className="text-[13px] font-semibold mt-1" style={{ color: "var(--text-secondary)" }}>
          Help us keep you and your baby safe 🌸
        </p>
      </div>

      {/* Card */}
      <div
        className="rounded-[32px] p-5 space-y-5"
        style={{
          background: "rgba(255,255,255,0.58)",
          border: "1.5px solid rgba(255,255,255,0.80)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          boxShadow: "0 16px 48px rgba(244,88,122,0.12), 0 4px 16px rgba(0,0,0,0.05)",
        }}
      >
        {/* Age & Week */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              className="block text-[11px] font-extrabold uppercase tracking-[0.18em] mb-2 ml-1"
              style={{ color: "var(--text-muted)" }}
            >
              Age
            </label>
            <input
              type="number"
              className="hk-input"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 29"
            />
          </div>
          <div>
            <label
              className="block text-[11px] font-extrabold uppercase tracking-[0.18em] mb-2 ml-1"
              style={{ color: "var(--text-muted)" }}
            >
              Week
            </label>
            <input
              type="number"
              className="hk-input"
              value={week}
              onChange={(e) => setWeek(e.target.value)}
              placeholder="e.g. 18"
            />
          </div>
        </div>

        {/* Diet */}
        <div>
          <SectionLabel icon={Salad} label="Diet Preference" />
          <div className="flex flex-wrap gap-2">
            {DIETS.map((d) => (
              <button
                key={d}
                onClick={() => setDiet(d)}
                className={`hk-chip ${diet === d ? "hk-chip-active" : ""}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div>
          <SectionLabel icon={ShieldAlert} label="Allergies" />
          <div className="flex flex-wrap gap-2">
            {COMMON_ALLERGIES.map((a) => (
              <button
                key={a}
                onClick={() => toggleList(allergies, setAllergies, a)}
                className={`hk-chip ${allergies.includes(a) ? "hk-chip-active" : ""}`}
              >
                {a}
              </button>
            ))}
            <button
              onClick={() => setShowOtherAllergy(!showOtherAllergy)}
              className={`hk-chip ${showOtherAllergy ? "hk-chip-active" : ""}`}
            >
              Other
            </button>
          </div>
          {showOtherAllergy && (
            <input
              className="hk-input mt-3"
              value={otherAllergy}
              onChange={(e) => setOtherAllergy(e.target.value)}
              placeholder="Type other allergies..."
            />
          )}
        </div>

        {/* Medical Conditions */}
        <div>
          <SectionLabel icon={Baby} label="Medical Conditions" />
          <div className="flex flex-wrap gap-2">
            {COMMON_CONDITIONS.map((c) => (
              <button
                key={c}
                onClick={() => toggleList(conditions, setConditions, c)}
                className={`hk-chip ${conditions.includes(c) ? "hk-chip-active" : ""}`}
              >
                {c}
              </button>
            ))}
            <button
              onClick={() => setShowOtherCondition(!showOtherCondition)}
              className={`hk-chip ${showOtherCondition ? "hk-chip-active" : ""}`}
            >
              Other
            </button>
          </div>
          {showOtherCondition && (
            <input
              className="hk-input mt-3"
              value={otherCondition}
              onChange={(e) => setOtherCondition(e.target.value)}
              placeholder="Type other conditions..."
            />
          )}
        </div>

        {/* Doctor Restrictions */}
        <div>
          <label
            className="block text-[11px] font-extrabold uppercase tracking-[0.18em] mb-2 ml-1"
            style={{ color: "var(--text-muted)" }}
          >
            Doctor Restrictions <span className="normal-case opacity-60">(optional)</span>
          </label>
          <input
            className="hk-input"
            value={restrictions}
            onChange={(e) => setRestrictions(e.target.value)}
            placeholder="e.g. No raw fish"
          />
        </div>

        {errorMsg && (
          <div className="text-xs font-bold text-red-600 bg-red-100/50 border border-red-200/50 p-3 rounded-2xl text-center">
            ⚠️ {errorMsg}
          </div>
        )}

        <div className="flex gap-3 mt-2">
          {onCancel && (
            <button
              type="button"
              className="flex-1 h-[56px] rounded-[22px] font-extrabold text-[15px] border transition-transform active:scale-95 flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.40)",
                border: "1.5px solid rgba(255,255,255,0.70)",
                color: "var(--text-primary)",
              }}
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
          <button
            disabled={loading}
            className="btn-primary flex-1 h-[56px] text-[16px]"
            onClick={submit}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Save Profile →"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
