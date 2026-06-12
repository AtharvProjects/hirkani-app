import { motion } from "framer-motion";
import { X, Heart } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { SafetyBadge } from "./Badge";
import type { ScanResult } from "@/lib/api";

interface Props {
  result: ScanResult;
  onClose: () => void;
  onSaveFavorite: () => void;
  isSaved: boolean;
}

export function FoodSafetyResult({ result, onClose, onSaveFavorite, isSaved }: Props) {
  return (
    <motion.div key="result" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42, ease: [0.34, 1.1, 0.64, 1] }} className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-widest mb-1 text-pink-500">
            Search Result
          </div>
          <h2 className="text-[24px] font-black" style={{ color: "var(--text-primary)" }}>{result.detected_food}</h2>
        </div>
        <button onClick={onClose} className="glass-card mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform active:scale-90">
          <X size={15} style={{ color: "var(--text-secondary)" }} />
        </button>
      </div>
      
      {/* Product Image Card */}
      {result.image_url && (
        <div className="relative w-full h-[180px] rounded-[24px] overflow-hidden border border-white/20 shadow-md">
          <img
            src={result.image_url}
            alt={result.detected_food}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>
      )}

      <SafetyBadge classification={result.classification} />

      {/* Safety Score Card */}
      <GlassCard glow>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-extrabold tracking-widest uppercase text-muted" style={{ color: "var(--text-muted)" }}>
              Safety Score
            </div>
            <div className="text-[28px] font-black mt-0.5" style={{ color: result.classification === "SAFE" ? "#059669" : result.classification === "CONSUME_WITH_CAUTION" ? "#D97706" : "#DC2626" }}>
              {result.safety_score}/100
            </div>
          </div>
          <div
            className="w-14 h-14 rounded-full border-4 flex items-center justify-center font-black text-[15px]"
            style={{
              borderColor: result.classification === "SAFE" ? "#059669" : result.classification === "CONSUME_WITH_CAUTION" ? "#D97706" : "#DC2626",
              color: result.classification === "SAFE" ? "#059669" : result.classification === "CONSUME_WITH_CAUTION" ? "#D97706" : "#DC2626",
              background: "rgba(255, 255, 255, 0.25)",
            }}
          >
            {result.safety_score}
          </div>
        </div>
      </GlassCard>

      {/* Why? section */}
      <GlassCard title="Why?" glow>
        <ul className="space-y-2.5">
          {result.why_reasons.map((reason, idx) => (
            <li key={idx} className="flex items-start gap-2 text-[14px] font-bold leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              <span style={{ color: result.classification === "SAFE" ? "#059669" : result.classification === "CONSUME_WITH_CAUTION" ? "#D97706" : "#DC2626", marginTop: "2px" }}>•</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </GlassCard>

      {/* Trimester Risk (if any) */}
      {result.trimester_risk && (
        <GlassCard title="Trimester Risk" glow>
          <div className="text-[14px] font-extrabold uppercase tracking-wide" style={{ color: "#DC2626" }}>
            {result.trimester_risk}
          </div>
        </GlassCard>
      )}

      {/* Ingredients Analysis section */}
      {result.ingredients_analysis && result.ingredients_analysis.length > 0 && (
        <GlassCard title="Ingredients Analysis">
          <div className="space-y-3">
            {result.ingredients_analysis.map((ing, idx) => (
              <div key={idx} className="flex items-center justify-between pb-3 last:pb-0" style={{ borderBottom: "1px solid rgba(180,120,140,0.12)" }}>
                <span className="text-[13px] font-extrabold" style={{ color: "var(--text-primary)" }}>
                  {ing.name}
                </span>
                <span className="text-[11px] font-extrabold px-3 py-1 rounded-full uppercase" style={{
                  background: ing.safety === "Safe" ? "rgba(16,185,129,0.12)" : ing.safety === "Moderate" ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)",
                  color: ing.safety === "Safe" ? "#10B981" : ing.safety === "Moderate" ? "#F5980B" : "#EF4444",
                  border: `1.5px solid ${ing.safety === "Safe" ? "rgba(16,185,129,0.25)" : ing.safety === "Moderate" ? "rgba(245,158,11,0.25)" : "rgba(239,68,68,0.25)"}`
                }}>
                  {ing.safety}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Recommended frequency (if caution/safe) */}
      {result.recommendation && (
        <GlassCard title="Recommended">
          <div className="text-[14px] font-bold" style={{ color: "var(--text-secondary)" }}>
            {result.recommendation}
          </div>
        </GlassCard>
      )}

      {/* Alternatives Card */}
      {result.alternatives && result.alternatives.length > 0 && (
        <GlassCard title={result.classification === "AVOID_DURING_PREGNANCY" ? "Safer Alternative" : "Better Alternative"}>
          <div className="flex flex-wrap gap-2 mb-4">
            {result.alternatives.map((a) => (
              <span
                key={a}
                className="rounded-full px-4 py-1.5 text-[12px] font-extrabold"
                style={{
                  background: "rgba(244,88,122,0.10)",
                  color: "var(--pink-hot)",
                  border: "1px solid rgba(244,88,122,0.20)",
                }}
              >
                {a}
              </span>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Save Button */}
      <GlassCard>
        <button
          onClick={onSaveFavorite}
          disabled={isSaved}
          className={`h-[52px] w-full text-[15px] flex items-center justify-center rounded-[22px] font-extrabold transition-all duration-200 ${
            isSaved
              ? "bg-green-100 border border-green-200 text-green-700 cursor-not-allowed shadow-none"
              : "btn-primary"
          }`}
        >
          {isSaved ? (
            "Saved to Favorites ✨"
          ) : (
            <>
              <Heart size={16} className="mr-2" fill="rgba(255,255,255,0.25)" />
              Save to Favorites
            </>
          )}
        </button>
      </GlassCard>

      {/* Sources Section */}
      {result.sources && result.sources.length > 0 && (
        <div className="pt-3 pb-6 text-center">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.25em] mb-1.5 opacity-80" style={{ color: "var(--text-muted)" }}>
            Sources
          </div>
          <div className="text-[13px] font-extrabold" style={{ color: "var(--text-secondary)" }}>
            {result.sources.join(" • ")}
          </div>
        </div>
      )}
    </motion.div>
  );
}
