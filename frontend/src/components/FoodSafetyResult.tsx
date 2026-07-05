"use client";

import { motion } from "framer-motion";
import { X, Heart, Utensils, Dna, Bone, Brain, Activity, Leaf, Sparkles, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { GlassCard } from "./GlassCard";
import type { ScanResult, SafetyClass } from "@/lib/api";

interface Props {
  result: ScanResult;
  onClose: () => void;
  onSaveFavorite: () => void;
  isSaved: boolean;
}

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.34, 1.1, 0.64, 1] } },
};

function getIngredientEmoji(name: string) {
  const n = name.toLowerCase();
  if (n.includes('broccoli')) return '🥦';
  if (n.includes('milk') || n.includes('dairy') || n.includes('cheese')) return '🥛';
  if (n.includes('egg')) return '🥚';
  if (n.includes('meat') || n.includes('beef') || n.includes('pork')) return '🥩';
  if (n.includes('chicken') || n.includes('poultry')) return '🍗';
  if (n.includes('fish') || n.includes('salmon')) return '🐟';
  if (n.includes('nut') || n.includes('almond') || n.includes('peanut')) return '🥜';
  if (n.includes('soy')) return '🫘';
  if (n.includes('wheat') || n.includes('flour') || n.includes('bread')) return '🍞';
  if (n.includes('sugar') || n.includes('syrup')) return '🍬';
  if (n.includes('water')) return '💧';
  if (n.includes('salt') || n.includes('sodium')) return '🧂';
  return '🌱';
}

function getNutrientIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("folate") || n.includes("folic")) return <Dna size={22} style={{ color: "#7C3AED" }} />;
  if (n.includes("calcium")) return <Bone size={22} style={{ color: "#9CA3AF" }} />;
  if (n.includes("iron")) return <Brain size={22} style={{ color: "#EF4444" }} />;
  if (n.includes("protein")) return <Activity size={22} style={{ color: "#3B82F6" }} />;
  if (n.includes("fiber")) return <Leaf size={22} style={{ color: "#10B981" }} />;
  return <Sparkles size={22} style={{ color: "var(--pink-hot)" }} />;
}

export function FoodSafetyResult({ result, onClose, onSaveFavorite, isSaved }: Props) {
  const isSafe = result.classification === "SAFE";
  const isCaution = result.classification === "CONSUME_WITH_CAUTION";
  
  const mapping = {
    SAFE: {
      label: "SAFE TO EAT",
      sublabel: "Safe to consume during pregnancy 🌟",
      icon: CheckCircle2,
      themeColor: "#059669",
      gradient: "linear-gradient(to bottom, rgba(16,185,129,0) 0%, rgba(16,185,129,0.2) 100%)",
      glassBg: "rgba(16, 185, 129, 0.15)",
      bgGradient: "bg-gradient-to-br from-green-100 to-green-50"
    },
    CONSUME_WITH_CAUTION: {
      label: "EAT IN MODERATION",
      sublabel: "Enjoy in moderation — ask your doctor 💛",
      icon: AlertTriangle,
      themeColor: "#D97706",
      gradient: "linear-gradient(to bottom, rgba(245,158,11,0) 0%, rgba(245,158,11,0.2) 100%)",
      glassBg: "rgba(245, 158, 11, 0.15)",
      bgGradient: "bg-gradient-to-br from-amber-100 to-amber-50"
    },
    AVOID_DURING_PREGNANCY: {
      label: "NOT RECOMMENDED",
      sublabel: "Not recommended for expecting mothers 🚫",
      icon: XCircle,
      themeColor: "#DC2626",
      gradient: "linear-gradient(to bottom, rgba(239,68,68,0) 0%, rgba(239,68,68,0.2) 100%)",
      glassBg: "rgba(239, 68, 68, 0.15)",
      bgGradient: "bg-gradient-to-br from-red-100 to-red-50"
    },
  };
  
  const map = mapping[result.classification as SafetyClass] || mapping["SAFE"];

  const StatusIcon = map.icon;

  return (
    <motion.div
      key="result"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      <motion.div variants={staggerItem} className="flex items-center justify-between px-1">
        <h2 className="text-[28px] font-black font-display mx-auto" style={{ color: "var(--text-primary)" }}>
          Search Result
        </h2>
        <button
          onClick={onClose}
          className="glass-card absolute right-4 top-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform active:scale-90 z-20"
          style={{ padding: 0 }}
        >
          <X size={16} style={{ color: "var(--text-secondary)" }} />
        </button>
      </motion.div>

      {/* Combined Hero Safety Card */}
      <motion.div variants={staggerItem} className="relative w-full rounded-[28px] overflow-hidden shadow-sm" style={{
        border: "1px solid rgba(255,255,255,0.40)",
        backgroundColor: "rgba(255,255,255,0.6)",
      }}>
        {/* Top half image */}
        <div className="h-[120px] w-full bg-gray-200 relative">
          {result.image_url ? (
            <img src={result.image_url} alt={result.detected_food} className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${map.bgGradient}`}>
              <span className="text-4xl">{getIngredientEmoji(result.detected_food)}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/90" />
        </div>

        {/* Bottom half safety text */}
        <div className="relative pt-6 pb-5 px-4 text-center flex flex-col items-center justify-center -mt-8" style={{
          background: map.gradient,
          backdropFilter: "blur(12px)"
        }}>
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full mb-2 z-10 shadow-md"
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(8px)",
              border: `1px solid rgba(255,255,255,0.8)`
            }}
          >
            <StatusIcon size={30} style={{ color: map.themeColor }} />
          </div>
          <h2 className="text-[20px] font-black mb-1 line-clamp-1 px-4" style={{ color: "var(--text-primary)" }}>
            {result.detected_food}
          </h2>
          <div className="text-[16px] font-black tracking-widest mb-1 mt-1" style={{ color: map.themeColor }}>
            {map.label}
          </div>
          <div className="text-[13px] font-semibold" style={{ color: "var(--text-secondary)" }}>
            {map.sublabel}
          </div>
        </div>
      </motion.div>

      {/* Key Findings Card */}
      <motion.div variants={staggerItem}>
        <GlassCard glow>
          <div className="flex items-start gap-4">
            {/* Animated score ring */}
            <div className="relative w-[70px] h-[70px] shrink-0 mt-1">
              <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
                <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="5" />
                <motion.circle
                  cx="28" cy="28" r="24"
                  fill="none"
                  stroke={map.themeColor}
                  strokeWidth="5" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 24}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 24 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 24 * (1 - result.safety_score / 100) }}
                  transition={{ duration: 1.2, delay: 0.3, ease: [0.34, 1.1, 0.64, 1] }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-black text-[20px] leading-none" style={{ color: map.themeColor }}>
                  {result.safety_score}
                </span>
                <span className="text-[9px] font-extrabold text-gray-400">/100</span>
              </div>
            </div>

            {/* Why reasons */}
            <div className="flex-1 pt-0.5">
              <h3 className="text-[11px] font-black uppercase tracking-[0.15em] mb-2" style={{ color: "var(--text-muted)" }}>
                Key Findings
              </h3>
              <ul className="space-y-2">
                {result.why_reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[13px] font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>
                    <span style={{ color: map.themeColor, marginTop: "1px" }}>•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Trimester Risk (if any) */}
      {result.trimester_risk && (
        <motion.div variants={staggerItem}>
          <GlassCard title="Trimester Risk" glow>
            <div className="text-[14px] font-extrabold uppercase tracking-wide" style={{ color: "#DC2626" }}>
              {result.trimester_risk}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Ingredients Analysis section */}
      {result.ingredients_analysis && result.ingredients_analysis.length > 0 && (
        <motion.div variants={staggerItem}>
          <GlassCard title="Ingredients Analysis">
            <div className="-mx-5 -mb-5 mt-2">
              {result.ingredients_analysis.map((ing, idx) => (
                <div key={idx} className="flex items-center justify-between px-5 py-3.5 border-t" style={{ borderColor: "rgba(180,120,140,0.12)" }}>
                  <div className="flex items-center gap-3">
                    <span className="text-[20px]">{getIngredientEmoji(ing.name)}</span>
                    <span className="text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>
                      {ing.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider" style={{
                    background: ing.safety === "Safe" ? "rgba(16,185,129,0.12)" : ing.safety === "Moderate" ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)",
                    color: ing.safety === "Safe" ? "#065F46" : ing.safety === "Moderate" ? "#92400E" : "#991B1B",
                  }}>
                    {ing.safety === "Safe" ? <span className="flex items-center gap-1"><CheckCircle2 size={12}/> SAFE</span> : ing.safety}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Recommended Consumption */}
      {result.recommendation && (
        <motion.div variants={staggerItem}>
          <GlassCard>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full" style={{ background: "rgba(0,0,0,0.03)" }}>
                <Utensils size={24} style={{ color: "var(--text-muted)" }} />
              </div>
              <div>
                <div className="text-[12px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Recommended Consumption</div>
                <div className="text-[14px] font-bold" style={{ color: "var(--text-primary)" }}>
                  {result.recommendation}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Nutritional Snapshot */}
      {result.nutrient_insights && result.nutrient_insights.length > 0 && (
        <motion.div variants={staggerItem} className="pt-2">
          <h3 className="text-[11px] font-black uppercase tracking-[0.15em] mb-3 px-1" style={{ color: "var(--text-muted)" }}>
            Nutritional Snapshot
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1">
            {result.nutrient_insights.map((nutrient, idx) => (
              <div key={idx} className="flex items-center gap-3 shrink-0 p-3 rounded-[16px]" style={{
                background: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(0,0,0,0.04)",
                minWidth: "150px"
              }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.03)" }}>
                  {getNutrientIcon(nutrient.name)}
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-extrabold text-gray-800">{nutrient.name}</span>
                  <span className="text-[11px] font-medium text-gray-500 leading-tight pr-2">{nutrient.benefit}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Save Button */}
      <motion.div variants={staggerItem} className="pt-2 pb-2">
        <button
          onClick={onSaveFavorite}
          disabled={isSaved}
          className={`h-[56px] w-full text-[16px] flex items-center justify-center rounded-[20px] font-extrabold transition-all duration-300 ${
            isSaved
              ? "bg-white/80 border border-green-200/50 text-green-700 cursor-not-allowed shadow-sm backdrop-blur-md"
              : "shadow-xl"
          }`}
          style={!isSaved ? {
            background: "linear-gradient(135deg, var(--pink-hot) 0%, #FF8A9A 100%)",
            color: "white"
          } : {}}
        >
          {isSaved ? (
            "Saved to Favorites ✨"
          ) : (
            <>
              <Heart size={20} className="mr-2" fill="rgba(255,255,255,0.9)" />
              Add to Favorites
            </>
          )}
        </button>
      </motion.div>

    </motion.div>
  );
}
