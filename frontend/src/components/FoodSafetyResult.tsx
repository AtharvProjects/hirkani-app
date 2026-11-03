"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X, Heart, Utensils, CheckCircle2, AlertTriangle, XCircle, Shield, ShieldCheck, ShieldAlert, Info, Target } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { useTranslation } from "@/lib/i18n";
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

function formatReason(reason: string) {
  // Strictly strip any accidental percentage
  const clean = reason
    .replace(/\b100%\s*/gi, "fully ")
    .replace(/\b\d+%\s*/gi, "")
    .replace(/%/g, "")
    .trim();
  const colonIndex = clean.indexOf(":");
  if (colonIndex > 0 && colonIndex < 45) {
    const title = clean.substring(0, colonIndex).trim();
    const body = clean.substring(colonIndex + 1).trim();
    return { title, body };
  }
  return { title: null, body: clean };
}

export function FoodSafetyResult({ result, onClose, onSaveFavorite, isSaved }: Props) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  
  const rawClass = String(result.classification || "").toUpperCase();
  const normalizedClass: "SAFE" | "CONSUME_WITH_CAUTION" | "AVOID_DURING_PREGNANCY" = 
    (rawClass === "AVOID" || rawClass === "AVOID_DURING_PREGNANCY")
      ? "AVOID_DURING_PREGNANCY"
      : (rawClass === "CAUTION" || rawClass === "CONSUME_WITH_CAUTION")
      ? "CONSUME_WITH_CAUTION"
      : "SAFE";

  const isSafe = normalizedClass === "SAFE";
  const isCaution = normalizedClass === "CONSUME_WITH_CAUTION";
  
  const mapping = {
    SAFE: {
      label: t('scan.safeLabel'),
      sublabel: t('scan.safeSub'),
      icon: CheckCircle2,
      themeColor: "#059669",
      gradient: "linear-gradient(to bottom, rgba(16,185,129,0) 0%, rgba(16,185,129,0.2) 100%)",
      glassBg: "rgba(16, 185, 129, 0.15)",
      bgGradient: "bg-gradient-to-br from-green-100 to-green-50"
    },
    CONSUME_WITH_CAUTION: {
      label: t('scan.cautionLabel'),
      sublabel: t('scan.cautionSub'),
      icon: AlertTriangle,
      themeColor: "#D97706",
      gradient: "linear-gradient(to bottom, rgba(245,158,11,0) 0%, rgba(245,158,11,0.2) 100%)",
      glassBg: "rgba(245, 158, 11, 0.15)",
      bgGradient: "bg-gradient-to-br from-amber-100 to-amber-50"
    },
    AVOID_DURING_PREGNANCY: {
      label: t('scan.avoidLabel'),
      sublabel: t('scan.avoidSub'),
      icon: XCircle,
      themeColor: "#DC2626",
      gradient: "linear-gradient(to bottom, rgba(239,68,68,0) 0%, rgba(239,68,68,0.2) 100%)",
      glassBg: "rgba(239, 68, 68, 0.15)",
      bgGradient: "bg-gradient-to-br from-red-100 to-red-50"
    },
  };
  
  const map = mapping[normalizedClass] || mapping["SAFE"];

  const StatusIcon = map.icon;

  return (
    <motion.div
      ref={containerRef}
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
        border: "1px solid var(--glass-bg-medium)",
        backgroundColor: "var(--glass-bg-elevated)",
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
              background: "var(--glass-bg-elevated)",
              backdropFilter: "blur(8px)",
              border: `1px solid var(--glass-bg-elevated)`
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

      {/* Pregnancy Safety Analysis Card (Why Safe / Why Caution / Why Not to Eat) */}
      <motion.div variants={staggerItem}>
        <GlassCard glow>
          <div className="flex items-center gap-3 mb-3.5 pb-3 border-b" style={{ borderColor: `${map.themeColor}22` }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl shrink-0 shadow-sm" style={{ background: map.glassBg }}>
              {isSafe ? (
                <ShieldCheck size={22} style={{ color: map.themeColor }} />
              ) : isCaution ? (
                <AlertTriangle size={22} style={{ color: map.themeColor }} />
              ) : (
                <XCircle size={22} style={{ color: map.themeColor }} />
              )}
            </div>
            <div>
              <h3 className="text-[15px] font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
                {isSafe
                  ? (t('scan.whySafeTitle') || "Why It Is Safe to Consume")
                  : isCaution
                  ? (t('scan.whyCautionTitle') || "Why to Consume with Caution")
                  : (t('scan.whyAvoidTitle') || "Why Not to Eat During Pregnancy")}
              </h3>
              <p className="text-[11px] font-semibold" style={{ color: "var(--text-muted)" }}>
                {isSafe
                  ? (t('scan.whySafeSub') || "Nutritional benefits & pregnancy safety reasons")
                  : isCaution
                  ? (t('scan.whyCautionSub') || "Ingredients & nutritional factors requiring moderation")
                  : (t('scan.whyAvoidSub') || "Critical ingredients & health risks for mother and baby")}
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {result.why_reasons && result.why_reasons.length > 0 ? (
              result.why_reasons.map((rawReason, idx) => {
                const { title, body } = formatReason(rawReason);
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-[18px] text-[13px] leading-snug flex items-start gap-3 transition-all"
                    style={{
                      background: isSafe
                        ? "rgba(16, 185, 129, 0.06)"
                        : isCaution
                        ? "rgba(245, 158, 11, 0.06)"
                        : "rgba(239, 68, 68, 0.06)",
                      border: `1px solid ${map.themeColor}20`,
                    }}
                  >
                    <span className="shrink-0 mt-1 flex h-4 w-4 items-center justify-center rounded-full" style={{ background: map.glassBg }}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: map.themeColor }} />
                    </span>
                    <div className="flex-1">
                      {title && (
                        <span className="font-extrabold mr-1.5" style={{ color: map.themeColor }}>
                          {title}:
                        </span>
                      )}
                      <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        {body}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-3.5 rounded-[18px] text-[13px] font-medium" style={{ color: "var(--text-muted)" }}>
                {isSafe
                  ? "Contains safe, pregnancy-friendly ingredients supporting maternal and fetal wellness."
                  : "Review ingredients and consult your doctor before consuming."}
              </div>
            )}
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
            background: "linear-gradient(135deg, var(--accent-main) 0%, #8E8E93 100%)",
            color: "white"
          } : {}}
        >
          {isSaved ? (
            "Saved to Favorites ✨"
          ) : (
            <>
              <Heart size={20} className="mr-2" fill="var(--glass-bg-elevated)" />
              Add to Favorites
            </>
          )}
        </button>
      </motion.div>

    </motion.div>
  );
}
