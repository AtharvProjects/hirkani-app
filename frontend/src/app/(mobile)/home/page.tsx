"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, Bell, Leaf, Droplets, Pill, Sparkles, ArrowRight, Settings, ScanLine, Clock, Calendar, Check, X, Info, AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";

import { Portal } from "@/components/Portal";
import { AuthGate } from "@/components/AuthGate";
import { OnboardingProfile } from "@/components/OnboardingProfile";
import { PageTransition } from "@/components/mobile/PageTransition";
import { getMobileState } from "@/components/mobile/auth";
import { FoodSafetyResult } from "@/components/FoodSafetyResult";
import { SafetyBadge } from "@/components/Badge";
import { GlassCard } from "@/components/GlassCard";
import { api, ScanResult, AutocompleteItem, RecommendationResponse, RecommendationItem, PregnancyProfile } from "@/lib/api";
import { useEffect } from "react";


/* ─── Main Home Screen (after auth) ─── */
function MainHome() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [searchResult, setSearchResult] = useState<ScanResult | null>(null);
  const [isSearchingFull, setIsSearchingFull] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [history, setHistory] = useState<Array<{ id: number; detected_food: string; classification: string; explanation: string }>>([]);
  const [isSaved, setIsSaved] = useState(false);

  // States for pregnancy profile personalization & interactivity
  const [activeCategory, setActiveCategory] = useState("Veggies");
  const [recommendations, setRecommendations] = useState<RecommendationResponse[]>([]);
  const [profile, setProfile] = useState<PregnancyProfile | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: number; title: string; body: string; type: "info" | "warning" | "success" }>>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [safetyFilter, setSafetyFilter] = useState<"ALL" | "SAFE_ONLY" | "NO_AVOID">("ALL");
  const [showSeeAllModal, setShowSeeAllModal] = useState(false);
  const [selectedRecItem, setSelectedRecItem] = useState<RecommendationItem | null>(null);
  const [recSearchQuery, setRecSearchQuery] = useState("");

  useEffect(() => {
    api.history().then((h) =>
      setHistory(h as Array<{ id: number; detected_food: string; classification: string; explanation: string }>)
    ).catch(console.error);
  }, []);

  useEffect(() => {
    setIsSaved(false);
  }, [searchResult]);

  useEffect(() => {
    if (searchQuery.trim().length < 2) { setSuggestions([]); setIsTyping(false); return; }
    if (!showSuggestions) return;
    setIsTyping(true);
    const id = setTimeout(async () => {
      try { const results = await api.autocomplete(searchQuery.trim()); setSuggestions(results); }
      catch { setSuggestions([]); }
      finally { setIsTyping(false); }
    }, 400);
    return () => clearTimeout(id);
  }, [searchQuery, showSuggestions]);

  // Load Profile & Recommendations
  useEffect(() => {
    api.getProfile().then((prof) => {
      setProfile(prof);
      const list = [];
      if (prof) {
        list.push({
          id: 1,
          title: "💧 Hydration Target (2.5L - 3.0L)",
          body: `Drink at least 8-10 glasses of water today. Proper hydration is critical to support your baby's amniotic fluid levels.`,
          type: "info" as const
        });
        if (prof.trimester === 1) {
          list.push({
            id: 2,
            title: "👶 Folic Acid Focus (Trimester 1)",
            body: "A daily intake of folic acid is essential to prevent neural tube defects. Focus on spinach, avocados, or your doctor-prescribed prenatal vitamins.",
            type: "success" as const
          });
          list.push({
            id: 3,
            title: "🚫 Listeria Risk Alert",
            body: "Avoid unpasteurized cheese and raw sprouts in your first trimester as they pose higher contamination risks.",
            type: "warning" as const
          });
        } else if (prof.trimester === 2) {
          list.push({
            id: 2,
            title: "🦴 Calcium Phase (Trimester 2)",
            body: "Your baby's skeleton is developing rapidly. Boost calcium with pasteurized dairy, curd, or calcium-fortified snacks.",
            type: "success" as const
          });
        } else if (prof.trimester === 3) {
          list.push({
            id: 2,
            title: "💪 Iron Boost (Trimester 3)",
            body: "Prepare for birth! Boost your iron intake with spinach and chia seeds to support higher blood volume and prevent anemia.",
            type: "success" as const
          });
        }

        const conds = (prof.medical_conditions || []).map((c: string) => c.toLowerCase());
        if (conds.includes("gestational diabetes") || conds.includes("diabetes")) {
          list.push({
            id: 4,
            title: "🩸 Blood Sugar Monitoring",
            body: "Keep glucose levels stable. Limit sugar to <15g per meal. Lean on fiber-rich veggies and sugar-free alternatives.",
            type: "warning" as const
          });
        }
        if (conds.includes("hypertension") || conds.includes("preeclampsia") || conds.includes("high blood pressure")) {
          list.push({
            id: 5,
            title: "❤️ Low Sodium Guidelines",
            body: "Gestational hypertension requires limiting sodium (<1,500mg daily). Avoid canned foods and added table salts.",
            type: "warning" as const
          });
        }
        if (conds.includes("anemia")) {
          list.push({
            id: 6,
            title: "🩸 Iron Absorption Trick",
            body: "Enhance absorption by pairing iron-rich foods (e.g. spinach) with vitamin C sources (e.g. fresh strawberries).",
            type: "info" as const
          });
        }
      } else {
        list.push({
          id: 1,
          title: "🌸 Welcome to Hirkani",
          body: "Fill out your pregnancy profile in the Settings tab to receive fully personalized food safety recommendations.",
          type: "info" as const
        });
      }
      setNotifications(list);
    }).catch(console.error);

    api.getProfile().then(prof => api.getRecommendations(prof)).then((res) => {
      setRecommendations(res);
    }).catch(console.error);
  }, []);

  const performSearch = async (query: string, barcode?: string) => {
    const trimmedQuery = query.trim();
    setSearchQuery(trimmedQuery); 
    setSuggestions([]);
    setShowSuggestions(false);
    setIsSearchingFull(true); setSearchError(""); setSearchResult(null);
    try {
      const isBarcode = /^\d+$/.test(trimmedQuery) && (trimmedQuery.length >= 8 && trimmedQuery.length <= 18);
      const res = (barcode || isBarcode)
        ? await api.analyzeBarcode((barcode || trimmedQuery).trim())
        : await api.analyzeText("search", trimmedQuery);
      setSearchResult(res);
    }
    catch (e) { setSearchError((e as Error).message); }
    finally { setIsSearchingFull(false); }
  };

  const handleSaveFavorite = async () => {
    if (!searchResult) return;
    try {
      await api.addFavorite(searchResult.detected_food, searchResult.classification);
      setIsSaved(true);
    } catch (e: any) {
      alert("Failed to save: " + e.message);
    }
  };

  const filterBySafety = (items: RecommendationItem[]) => {
    if (safetyFilter === "SAFE_ONLY") {
      return items.filter((item) => item.safety === "SAFE");
    }
    if (safetyFilter === "NO_AVOID") {
      return items.filter((item) => item.safety !== "AVOID_DURING_PREGNANCY");
    }
    return items;
  };

  const currentCategoryData = recommendations.find((r) => r.category === activeCategory);
  const rawItems = currentCategoryData?.items || [];
  const dashboardFilteredItems = filterBySafety(rawItems).slice(0, 2);

  return (
    <div className="flex flex-col pb-6 relative z-10">
      <header className="flex items-center justify-between mt-2 mb-7">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-full" style={{ border: "2.5px solid rgba(255,255,255,0.85)", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
            <img src="/logo.png" alt="Hirkani" className="h-full w-full object-cover" />
          </div>
          <div>
            <div className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
              {new Date().getHours() < 12 ? "Good Morning" : new Date().getHours() < 18 ? "Good Afternoon" : "Good Evening"}
            </div>
            <div className="text-[17px] font-extrabold" style={{ color: "var(--text-primary)" }}>
              {profile?.name ? `${profile.name} ✨` : "Mama ✨"}
            </div>
          </div>
        </div>
        <button 
          onClick={() => setShowNotifications(true)}
          className="glass-card flex h-11 w-11 items-center justify-center rounded-full transition-transform active:scale-90 relative animate-fade-in" 
        >
          <Bell size={18} style={{ color: "var(--text-primary)" }} />
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-rose-500 border border-white animate-bounce" />
          )}
        </button>
      </header>

      <h1 className="mb-6 text-[34px] font-black leading-[1.1] tracking-tight" style={{ color: "var(--text-primary)" }}>
        What are you<br />eating today?
      </h1>

      <div className="relative mb-7 flex gap-3">
        <div className="relative flex-1 z-50">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={18} style={{ color: "var(--text-muted)" }} />
          </div>
          <input
            type="text" placeholder="Search any food..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => {
              if (searchQuery.trim().length >= 2) setShowSuggestions(true);
            }}
            onKeyDown={(e) => { if (e.key === "Enter" && searchQuery.trim()) performSearch(searchQuery.trim()); }}
            className="hk-input pl-11 pr-4" style={{ borderRadius: "22px" }}
          />
          <AnimatePresence>
            {showSuggestions && (suggestions.length > 0 || isTyping) && searchQuery.trim().length >= 2 && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="absolute top-[calc(100%+8px)] left-0 w-full overflow-hidden rounded-[22px]"
                style={{ background: "rgba(255,255,255,0.95)", border: "1.5px solid rgba(255,255,255,0.95)", backdropFilter: "blur(28px)", boxShadow: "0 16px 48px rgba(244,88,122,0.18)" }}>
                {isTyping ? <div className="px-5 py-4 text-[13px] font-bold text-center" style={{ color: "var(--text-muted)" }}>Finding suggestions...</div> : (
                  <ul className="max-h-64 overflow-y-auto scrollbar-hide py-2">
                    {suggestions.map((s, i) => (
                      <li key={i}>
                        <button
                          onClick={() => performSearch(s.name, s.code)}
                          className="w-full px-5 py-2.5 text-left text-[14px] font-bold transition-colors hover:bg-pink-50 flex items-center justify-between"
                          style={{ color: "var(--text-primary)" }}
                        >
                          <span className="flex items-center gap-3.5 min-w-0">
                            {s.image ? (
                              <img
                                src={s.image}
                                alt={s.name}
                                className="w-10 h-10 object-contain rounded-xl bg-gray-50 border border-gray-100 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center shrink-0">
                                <Search size={15} style={{ color: "var(--pink-hot)" }} />
                              </div>
                            )}
                            <span className="truncate">{s.name}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button 
          onClick={() => setShowFilterModal(true)}
          className="glass-card flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-[22px] transition-transform active:scale-90" 
        >
          <SlidersHorizontal size={20} style={{ color: "var(--text-primary)" }} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isSearchingFull ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card p-8 flex flex-col items-center justify-center text-center">
            <Sparkles size={28} style={{ color: "var(--pink-hot)" }} className="animate-pulse mb-3" />
            <div className="text-[16px] font-extrabold" style={{ color: "var(--text-primary)" }}>Analysing with AI...</div>
            <div className="text-[13px] font-semibold mt-1" style={{ color: "var(--text-muted)" }}>Checking pregnancy safety 🌸</div>
          </motion.div>
        ) : searchError ? (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 text-center">
            <div className="text-[32px] mb-2">🤔</div>
            <div className="text-[15px] font-extrabold mb-1" style={{ color: "var(--text-primary)" }}>Couldn't identify that food</div>
            <button onClick={() => setSearchError("")} className="btn-primary h-[44px] px-8 text-[14px] mt-3 mx-auto">Try Again</button>
          </motion.div>
        ) : searchResult ? (
          <FoodSafetyResult
            result={searchResult}
            onClose={() => { setSearchResult(null); setSearchQuery(""); }}
            onSaveFavorite={handleSaveFavorite}
            isSaved={isSaved}
          />
        ) : (
          <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-7 flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
              {[
                { label: "Veggies", icon: Leaf },
                { label: "Dairy", icon: Droplets },
                { label: "Vitamins", icon: Pill }
              ].map(({ label, icon: Icon }) => {
                const active = activeCategory === label;
                return (
                  <button 
                    key={label} 
                    onClick={() => setActiveCategory(label)}
                    className={`flex shrink-0 items-center gap-2 rounded-[20px] px-5 py-3 text-[13px] font-extrabold transition-all active:scale-95 ${active ? "btn-primary h-auto shadow-lg" : "glass-card text-[var(--text-secondary)]"}`}
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: active ? "rgba(255,255,255,0.25)" : "rgba(244,88,122,0.10)" }}>
                      <Icon size={13} style={{ color: active ? "#fff" : "var(--pink-hot)" }} />
                    </div>
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[20px] font-extrabold" style={{ color: "var(--text-primary)" }}>Recommended</h2>
              <button 
                onClick={() => setShowSeeAllModal(true)}
                className="text-[12px] font-bold transition-opacity active:opacity-65 flex items-center gap-0.5" 
                style={{ color: "var(--text-secondary)" }}
              >
                See all →
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {dashboardFilteredItems.length > 0 ? (
                dashboardFilteredItems.map((item) => (
                  <motion.div 
                    key={item.name} 
                    onClick={() => setSelectedRecItem(item)}
                    whileTap={{ scale: 0.97 }} 
                    className="glass-card group relative flex flex-col overflow-hidden rounded-[28px] p-4 cursor-pointer"
                  >
                    <div className="absolute inset-0 rounded-[28px]" style={{ background: `linear-gradient(160deg, ${item.bg} 0%, transparent 60%)` }} />
                    <div className="relative flex h-24 items-center justify-center mb-2 overflow-hidden rounded-2xl">
                      <img src={item.img} alt={item.name} className="h-full w-full object-cover rounded-2xl drop-shadow-xl transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <h3 className="text-[14px] font-extrabold line-clamp-1" style={{ color: "var(--text-primary)" }}>{item.name}</h3>
                    <p className="text-[11px] font-semibold mb-2 line-clamp-1" style={{ color: "var(--text-muted)" }}>{item.sub}</p>
                    <span 
                      className="inline-flex items-center self-start rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border"
                      style={{
                        background: item.safety === "SAFE" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
                        color: item.safety === "SAFE" ? "#065F46" : "#B45309",
                        borderColor: item.safety === "SAFE" ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.25)"
                      }}
                    >
                      {item.safety === "SAFE" ? "✓ SAFE" : "⚠️ CAUTION"}
                    </span>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 text-center py-6 text-white/70 font-semibold text-[13px]">
                  No items match this filter
                </div>
              )}
            </div>

            {history.length > 0 && (
              <div className="mt-7">
                <h2 className="text-[18px] font-extrabold mb-4" style={{ color: "var(--text-primary)" }}>Recent Scans</h2>
                <div className="space-y-3">
                  {history.slice(0, 3).map((h) => (
                    <div key={h.id} className="glass-card flex items-center gap-3 p-3.5" style={{ borderRadius: "20px" }}>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: h.classification === "SAFE" ? "rgba(187,247,208,0.60)" : h.classification === "CONSUME_WITH_CAUTION" ? "rgba(253,230,138,0.60)" : "rgba(254,202,202,0.60)" }}>
                        <span className="text-[18px]">{h.classification === "SAFE" ? "✅" : h.classification === "CONSUME_WITH_CAUTION" ? "⚠️" : "🚫"}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-extrabold truncate" style={{ color: "var(--text-primary)" }}>{h.detected_food}</div>
                        <div className="text-[11px] font-semibold truncate" style={{ color: "var(--text-muted)" }}>{h.classification.replace(/_/g, " ")}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Portal>
        <AnimatePresence>
          {showNotifications && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm">
              <div className="absolute inset-0" onClick={() => setShowNotifications(false)} />
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="relative w-full max-w-[440px] rounded-t-[32px] p-6 pb-6 border-t border-white/20 shadow-2xl flex flex-col max-h-[82vh]"
                style={{ background: "rgba(255, 255, 255, 0.92)", backdropFilter: "blur(24px)" }}
              >
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 shrink-0" />
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-[19px] font-black text-slate-800">Pregnancy Updates</h3>
                    <p className="text-[11px] font-bold text-slate-500 mt-0.5">Tailored health alerts for your profile</p>
                  </div>
                  <button onClick={() => setShowNotifications(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 active:scale-90 transition-transform">
                    <X size={16} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-hide">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className="p-5 rounded-2xl border flex gap-3.5 shadow-sm"
                      style={{
                        background: n.type === "warning" ? "rgba(254,242,242,0.60)" : n.type === "success" ? "rgba(240,253,250,0.60)" : "rgba(240,249,255,0.60)",
                        borderColor: n.type === "warning" ? "rgba(252,165,165,0.30)" : n.type === "success" ? "rgba(153,246,228,0.30)" : "rgba(186,230,253,0.30)"
                      }}
                    >
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white shadow-sm" style={{ color: n.type === "warning" ? "#F59E0B" : n.type === "success" ? "#10B981" : "#0EA5E9" }}>
                        {n.type === "warning" ? <Sparkles size={13} /> : n.type === "success" ? <Check size={14} /> : <ArrowRight size={13} />}
                      </div>
                      <div>
                        <h4 className="text-[13.5px] font-black text-slate-800 leading-tight">{n.title}</h4>
                        <p className="text-[12px] font-bold text-slate-600 mt-1 leading-relaxed">{n.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="h-6 w-full shrink-0" />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </Portal>

      <Portal>
        <AnimatePresence>
          {showFilterModal && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm">
              <div className="absolute inset-0" onClick={() => setShowFilterModal(false)} />
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="relative w-full max-w-[440px] rounded-t-[32px] p-6 pb-6 border-t border-white/20 shadow-2xl flex flex-col"
                style={{ background: "rgba(255, 255, 255, 0.90)", backdropFilter: "blur(24px)" }}
              >
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 shrink-0" />
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-[19px] font-black text-slate-800">Filter Food Recommendations</h3>
                    <p className="text-[11px] font-bold text-slate-500 mt-0.5">Restrict listings by pregnancy safety classification</p>
                  </div>
                  <button onClick={() => setShowFilterModal(false)} className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
                    <X size={15} className="text-slate-600" />
                  </button>
                </div>
                <div className="space-y-2.5">
                  {[
                    { value: "ALL", label: "Show All Recommendations", desc: "Show all foods suggested for pregnancy profile." },
                    { value: "NO_AVOID", label: "No High Risk (Caution & Safe)", desc: "Hide foods classified under Avoid during pregnancy." },
                    { value: "SAFE_ONLY", label: "Safe Foods Only", desc: "Strictly show safe classifications, hiding all caution items." }
                  ].map((opt) => {
                    const selected = safetyFilter === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => { setSafetyFilter(opt.value as any); setShowFilterModal(false); }}
                        className="w-full text-left p-5 rounded-2xl border transition-all flex items-center justify-between"
                        style={{ background: selected ? "rgba(244,88,122,0.06)" : "transparent", borderColor: selected ? "var(--pink-hot)" : "rgba(0,0,0,0.06)" }}
                      >
                        <div className="min-w-0 pr-4">
                          <div className="text-[14px] font-black text-slate-800">{opt.label}</div>
                          <div className="text-[11px] font-bold text-slate-500 mt-0.5 leading-tight">{opt.desc}</div>
                        </div>
                        {selected && (<div className="h-6 w-6 rounded-full bg-pink-500 flex items-center justify-center shrink-0"><Check size={13} className="text-white" /></div>)}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </Portal>

      <Portal>
        <AnimatePresence>
          {selectedRecItem && (
            <div className="fixed inset-0 z-[150] flex items-end justify-center bg-black/45 backdrop-blur-sm">
              <div className="absolute inset-0" onClick={() => setSelectedRecItem(null)} />
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 24, stiffness: 210 }}
                className="relative w-full max-w-[440px] rounded-t-[32px] p-6 pb-6 border-t border-white/20 shadow-2xl flex flex-col max-h-[88vh] overflow-y-auto scrollbar-hide"
                style={{ background: "#fff" }}
              >
                <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-4 shrink-0" />
                <div className="flex justify-between items-start mb-4">
                  <div className="min-w-0 pr-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-pink-500">Premium Recommendation</span>
                    <h3 className="text-[22px] font-black text-slate-800 leading-tight mt-0.5">{selectedRecItem.name}</h3>
                    <p className="text-[12px] font-bold text-slate-400 mt-1">{selectedRecItem.sub}</p>
                  </div>
                  <button onClick={() => setSelectedRecItem(null)} className="h-9 w-9 shrink-0 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
                    <X size={16} className="text-slate-600" />
                  </button>
                </div>
                <div className="w-full h-44 rounded-2xl overflow-hidden mb-5 border border-slate-100">
                  <img src={selectedRecItem.img} alt={selectedRecItem.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0"
                    style={{ background: selectedRecItem.safety === "SAFE" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)", color: selectedRecItem.safety === "SAFE" ? "#065F46" : "#B45309", borderColor: selectedRecItem.safety === "SAFE" ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.25)" }}>
                    {selectedRecItem.safety === "SAFE" ? "SAFE TO CONSUME" : "CONSUME IN MODERATION"}
                  </span>
                  {selectedRecItem.tags.map((tag) => <span key={tag} className="px-3 py-1 rounded-full text-[10px] font-black bg-rose-50 border border-rose-100 text-rose-600 shrink-0">{tag}</span>)}
                </div>
                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="text-[12px] font-black text-slate-800 uppercase tracking-wider mb-2">Pregnancy Benefit</h4>
                    <p className="text-[13px] font-bold text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100/50">{selectedRecItem.benefit}</p>
                  </div>
                  <div>
                    <h4 className="text-[12px] font-black text-slate-800 uppercase tracking-wider mb-2">Detailed Safety Reasons</h4>
                    <ul className="space-y-2">
                      {selectedRecItem.reasons.map((r, i) => <li key={i} className="text-[13px] font-bold text-slate-600 flex items-start gap-2 leading-relaxed"><span className="text-rose-500 mt-1 shrink-0">•</span><span>{r}</span></li>)}
                    </ul>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedRecItem(null); setShowSeeAllModal(false); performSearch(selectedRecItem.name); }}
                  className="btn-primary h-12 w-full text-[13.5px] font-black flex items-center justify-center gap-2 rounded-2xl shadow-md animate-pulse"
                >
                  <Sparkles size={15} />
                  Scan Full Safety Profile
                </button>
                <div className="h-24 w-full shrink-0" />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </Portal>

      <Portal>
        <AnimatePresence>
          {showSeeAllModal && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-[480px] h-[92vh] rounded-[32px] p-6 border border-white/20 shadow-2xl flex flex-col overflow-hidden"
                style={{ background: "linear-gradient(135deg, #FFF1F2 0%, #FFF5F5 100%)" }}
              >
                <div className="flex items-center justify-between mb-5 shrink-0">
                  <div>
                    <h3 className="text-[20px] font-black text-slate-800">Pregnancy Foods List</h3>
                    <p className="text-[11px] font-bold text-slate-500 mt-0.5">Cleared items for trimester & conditions</p>
                  </div>
                  <button onClick={() => { setShowSeeAllModal(false); setRecSearchQuery(""); }} className="h-10 w-10 flex items-center justify-center rounded-full bg-white border border-rose-100 shadow-sm hover:scale-95 transition-transform">
                    <X size={16} className="text-slate-600" />
                  </button>
                </div>
                <div className="relative mb-5 shrink-0">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none"><Search size={16} className="text-slate-400" /></div>
                  <input type="text" placeholder="Search cleared foods..." value={recSearchQuery} onChange={(e) => setRecSearchQuery(e.target.value)} className="w-full h-12 pl-11 pr-4 bg-white/80 border border-rose-100 rounded-2xl text-[13.5px] font-bold placeholder:text-slate-400 focus:outline-none focus:border-rose-300 shadow-sm" />
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-32 scrollbar-hide animate-fade-in">
                  {recommendations.map((cat) => {
                    const filteredCatItems = cat.items.filter((item) => item.name.toLowerCase().includes(recSearchQuery.toLowerCase()) || item.sub.toLowerCase().includes(recSearchQuery.toLowerCase()));
                    const safetyFiltered = filterBySafety(filteredCatItems);
                    if (safetyFiltered.length === 0) return null;
                    return (
                      <div key={cat.category} className="space-y-2.5">
                        <h4 className="text-[12px] font-black uppercase tracking-wider text-rose-500/80 px-1">{cat.category}</h4>
                        <div className="grid grid-cols-1 gap-2.5">
                          {safetyFiltered.map((item) => (
                            <div key={item.name} onClick={() => setSelectedRecItem(item)} className="bg-white/90 border border-rose-50/50 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer hover:bg-white transition-all shadow-sm group active:scale-[0.99]">
                              <div className="flex items-center gap-3.5 min-w-0">
                                <img src={item.img} alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-rose-100/50" />
                                <div className="min-w-0">
                                  <h5 className="text-[14px] font-black text-slate-800 leading-tight group-hover:text-rose-500 transition-colors">{item.name}</h5>
                                  <p className="text-[11px] font-bold text-slate-400 mt-0.5 truncate pr-1">{item.sub}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border" style={{ background: item.safety === "SAFE" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)", color: item.safety === "SAFE" ? "#065F46" : "#B45309", borderColor: item.safety === "SAFE" ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.25)" }}>
                                  {item.safety === "SAFE" ? "SAFE" : "CAUTION"}
                                </span>
                                <ChevronRight size={15} className="text-slate-400" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </Portal>
    </div>
  );
}

/* ─── Root Home Page ─── */
export default function HomeScreen() {
  const [step, setStep] = useState<"auth" | "onboarding" | "main" | "loading">("loading");
  const [authed, setAuthed] = useState(false);
  const [profileDone, setProfileDone] = useState(false);

  useEffect(() => {
    getMobileState().then((state) => {
      if (state.authed && state.profileDone) { setAuthed(true); setProfileDone(true); setStep("main"); }
      else if (state.authed) { setAuthed(true); setStep("onboarding"); }
      else { setStep("auth"); }
    });
  }, []);

  return (
    <PageTransition>
      {step === "loading" && (
        <div className="min-h-screen w-full" />
      )}
      {step === "auth" && (
        <AuthGate onDone={() => {
          setStep("loading");
          getMobileState(true).then((state) => {
            setAuthed(state.authed);
            if (state.profileDone) {
              setProfileDone(true);
              setStep("main");
            } else {
              setStep("onboarding");
            }
          });
        }} />
      )}
      {step === "onboarding" && authed && (
        <OnboardingProfile onDone={() => { setProfileDone(true); setStep("main"); }} />
      )}
      {step === "main" && <MainHome />}
    </PageTransition>
  );
}
