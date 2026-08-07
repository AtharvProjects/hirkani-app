"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, CheckCircle2, AlertTriangle, XCircle, Lock, ArrowRight, ScanLine, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { api, ScanResult } from "@/lib/api";

/**
 * RECIPROCITY PRINCIPLE (Principle 3):
 * Give genuine value BEFORE asking for signup.
 * 
 * This page lets users try a single food safety scan without any account.
 * They see real results (classification + score + top reasons),
 * but the full breakdown (ingredients, nutrients, trimester risk) is gated
 * behind a soft signup prompt — not a hard wall.
 *
 * The user already received something valuable, triggering reciprocity:
 * "They gave me useful info for free → I'll sign up to get more."
 */

const POPULAR_FOODS = ["Coffee", "Paneer", "Sushi", "Mango", "Eggs", "Curd"];

export default function TryPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [hasTriedOnce, setHasTriedOnce] = useState(false);

  const performSearch = async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    
    setQuery(trimmed);
    setIsSearching(true);
    setError("");
    setResult(null);

    try {
      const res = await api.analyzeText("search", trimmed);
      setResult(res);
      setHasTriedOnce(true);
    } catch (e) {
      setError((e as Error).message || "Couldn't analyze that food. Try another!");
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusConfig = (classification: string) => {
    switch (classification) {
      case "SAFE":
        return { icon: CheckCircle2, color: "#059669", label: "SAFE TO EAT", bg: "rgba(16,185,129,0.10)" };
      case "CONSUME_WITH_CAUTION":
        return { icon: AlertTriangle, color: "#D97706", label: "USE CAUTION", bg: "rgba(245,158,11,0.10)" };
      default:
        return { icon: XCircle, color: "#DC2626", label: "AVOID", bg: "rgba(239,68,68,0.10)" };
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col overflow-hidden relative" style={{ background: "var(--bg-cream, #FFF8F5)" }}>
      {/* Aurora background */}
      <div className="aurora-bg">
        <div className="aurora-blob-3" />
        <div className="aurora-blob-4" />
        <div className="aurora-noise" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col px-5 pt-4 pb-8 max-w-[480px] mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push("/")}
            className="flex h-10 w-10 items-center justify-center rounded-full glass-card hover:bg-white/40 active:scale-95 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-[20px] font-black font-display tracking-tight" style={{ color: "var(--text-primary)" }}>
              Try a Free Scan
            </h1>
            <p className="text-[12px] font-bold" style={{ color: "var(--text-muted)" }}>
              No signup needed — see if your food is safe
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-5">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={18} style={{ color: "var(--text-muted)" }} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") performSearch(query); }}
            placeholder="Type a food name... e.g. Coffee"
            className="hk-input pl-11 pr-4 w-full h-[56px]"
            style={{ borderRadius: "22px" }}
            autoFocus
          />
        </div>

        {/* Quick Search Chips */}
        {!result && !isSearching && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="text-[10px] font-black uppercase tracking-wider mb-2.5 px-1" style={{ color: "var(--text-muted)" }}>
              Popular searches
            </div>
            <div className="flex flex-wrap gap-2">
              {POPULAR_FOODS.map((food) => (
                <button
                  key={food}
                  onClick={() => performSearch(food)}
                  className="px-4 py-2 rounded-full text-[13px] font-bold transition-transform active:scale-95"
                  style={{
                    background: "var(--glass-bg-elevated)",
                    border: "1px solid var(--glass-bg-medium)",
                    color: "var(--text-primary)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  {food}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        <AnimatePresence mode="wait">
          {isSearching && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card-premium p-8 flex flex-col items-center justify-center text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                style={{ background: "linear-gradient(135deg, var(--accent-main) 0%, #8E8E93 100%)" }}
              >
                <ScanLine size={28} className="text-white" />
              </motion.div>
              <div className="text-[16px] font-black" style={{ color: "var(--text-primary)" }}>Analyzing {query}...</div>
              <div className="text-[13px] font-semibold mt-1" style={{ color: "var(--text-muted)" }}>Checking pregnancy safety 🌸</div>
            </motion.div>
          )}

          {/* Error State */}
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-6 text-center"
            >
              <div className="text-[32px] mb-2">🤔</div>
              <div className="text-[15px] font-extrabold mb-1" style={{ color: "var(--text-primary)" }}>Couldn't identify that food</div>
              <div className="text-[13px] font-medium" style={{ color: "var(--text-muted)" }}>{error}</div>
              <button
                onClick={() => { setError(""); setQuery(""); }}
                className="btn-primary h-[44px] px-8 text-[14px] mt-3 mx-auto"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {/* RECIPROCITY: Partial Result — give real value, gate the deep details */}
          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.34, 1.1, 0.64, 1] }}
              className="space-y-4"
            >
              {/* Safety Classification — FULL (genuine value) */}
              {(() => {
                const config = getStatusConfig(result.classification);
                const StatusIcon = config.icon;
                return (
                  <div
                    className="glass-card-premium p-6 text-center"
                    style={{ borderColor: `${config.color}20` }}
                  >
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-full mx-auto mb-3"
                      style={{ background: config.bg }}
                    >
                      <StatusIcon size={28} style={{ color: config.color }} />
                    </div>
                    <h2 className="text-[20px] font-black mb-1" style={{ color: "var(--text-primary)" }}>
                      {result.detected_food}
                    </h2>
                    <div className="text-[14px] font-black tracking-widest mb-2" style={{ color: config.color }}>
                      {config.label}
                    </div>

                    {/* Safety Score Ring — FULL (genuine value) */}
                    <div className="relative w-[80px] h-[80px] mx-auto my-4">
                      <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
                        <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="5" />
                        <motion.circle
                          cx="28" cy="28" r="24"
                          fill="none"
                          stroke={config.color}
                          strokeWidth="5" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 24}`}
                          initial={{ strokeDashoffset: 2 * Math.PI * 24 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 24 * (1 - result.safety_score / 100) }}
                          transition={{ duration: 1.2, delay: 0.3, ease: [0.34, 1.1, 0.64, 1] }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-black text-[22px] leading-none" style={{ color: config.color }}>
                          {result.safety_score}
                        </span>
                        <span className="text-[9px] font-extrabold text-gray-400">/100</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Top Reasons — FULL (genuine value, limited to 2) */}
              <div className="glass-card-premium p-5">
                <h3 className="text-[11px] font-black uppercase tracking-[0.15em] mb-3" style={{ color: "var(--text-muted)" }}>
                  Key Findings
                </h3>
                <ul className="space-y-2">
                  {result.why_reasons.slice(0, 2).map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[13px] font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>
                      <span style={{ color: getStatusConfig(result.classification).color, marginTop: "1px" }}>•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                  {result.why_reasons.length > 2 && (
                    <li className="flex items-start gap-2 text-[12px] font-bold" style={{ color: "var(--text-muted)" }}>
                      <Lock size={12} style={{ marginTop: "2px" }} />
                      <span>+{result.why_reasons.length - 2} more findings</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* GATED: Blurred sections — show what they're missing */}
              <div className="relative rounded-[24px] overflow-hidden" style={{ background: "var(--glass-bg-elevated)", border: "1px solid var(--glass-bg-medium)" }}>
                <div className="p-5 filter blur-[6px] select-none pointer-events-none opacity-60">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.15em] mb-3" style={{ color: "var(--text-muted)" }}>
                    Ingredients Analysis
                  </h3>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200/50 rounded-full w-3/4" />
                    <div className="h-4 bg-gray-200/50 rounded-full w-1/2" />
                    <div className="h-4 bg-gray-200/50 rounded-full w-2/3" />
                  </div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.15em] mb-3 mt-5" style={{ color: "var(--text-muted)" }}>
                    Trimester-Specific Advice
                  </h3>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200/50 rounded-full w-4/5" />
                    <div className="h-4 bg-gray-200/50 rounded-full w-3/5" />
                  </div>
                </div>
                {/* Unlock overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full mb-3" style={{ background: "rgba(0, 122, 255,0.10)" }}>
                    <Lock size={20} style={{ color: "var(--accent-main)" }} />
                  </div>
                  <div className="text-[14px] font-black text-center px-4" style={{ color: "var(--text-primary)" }}>
                    Full breakdown with ingredients,{"\n"}nutrients & trimester advice
                  </div>
                  <div className="text-[12px] font-bold mt-1" style={{ color: "var(--text-muted)" }}>
                    Create your free profile to unlock
                  </div>
                </div>
              </div>

              {/* CTA: Reciprocity-driven signup prompt */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="pt-2"
              >
                <button
                  onClick={() => router.push("/home")}
                  className="btn-primary w-full h-[56px] text-[15px] rounded-[24px] flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} />
                  Get Complete Breakdown — Free
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => { setResult(null); setQuery(""); }}
                  className="w-full h-[44px] text-[13px] font-bold mt-2 rounded-[20px] transition-transform active:scale-95"
                  style={{ color: "var(--text-muted)" }}
                >
                  Try another food
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom note — only when no result */}
        {!result && !isSearching && !error && (
          <div className="mt-auto pt-8 text-center">
            <p className="text-[12px] font-bold" style={{ color: "var(--text-muted)" }}>
              🔒 No signup required for your first scan
            </p>
            <p className="text-[11px] font-medium mt-1" style={{ color: "var(--text-muted)", opacity: 0.7 }}>
              Already have an account?{" "}
              <button onClick={() => router.push("/home")} className="font-bold underline" style={{ color: "var(--accent-main)" }}>
                Login
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
