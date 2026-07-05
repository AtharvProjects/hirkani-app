"use client";

import { useState, useEffect } from "react";
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
import { api, ScanResult, AutocompleteItem, RecommendationResponse, RecommendationItem } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";
import { setupPushNotifications } from "@/lib/notifications";
import { App } from "@capacitor/app";
import AnimatedLoadingSkeleton from "@/components/AnimatedLoadingSkeleton";


/* ─── Glass Bottom Sheet wrapper ─── */
function GlassBottomSheet({ children, onClose, maxH = "82vh" }: { children: React.ReactNode; onClose: () => void; maxH?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-end justify-center" 
      style={{ background: "rgba(0,0,0,0.30)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", willChange: "opacity" }}
    >
      <div className="absolute inset-0" onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 240 }}
        className="relative w-full max-w-[440px] rounded-t-[32px] p-6 pb-6 flex flex-col"
        style={{
          maxHeight: maxH,
          background: "rgba(255, 255, 255, 0.70)", // slightly more opaque to reduce expensive background-blending
          backdropFilter: "blur(24px)", // slightly reduced blur for much better performance
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.50)",
          borderBottom: "none",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.60)",
          willChange: "transform", // Hardware acceleration!
        }}
      >
        <div className="w-12 h-1 rounded-full mx-auto mb-4 shrink-0" style={{ background: "rgba(0,0,0,0.12)" }} />
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Home Screen (after auth) ─── */
function MainHome() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [searchResult, setSearchResult] = useState<ScanResult | null>(null);
  const [isSearchingFull, setIsSearchingFull] = useState(false);
  const [searchError, setSearchError] = useState("");
  const profile = useAppStore(state => state.profile);
  const history = useAppStore(state => state.scanHistory);
  const streakCount = useAppStore(state => state.streakCount);
  const dailyWater = useAppStore(state => state.dailyWater);
  const tookVitamin = useAppStore(state => state.tookVitamin);
  const incrementWater = useAppStore(state => state.incrementWater);
  const toggleVitamin = useAppStore(state => state.toggleVitamin);
  const resetHabitsIfNeeded = useAppStore(state => state.resetHabitsIfNeeded);
  const [isSaved, setIsSaved] = useState(false);

  // States for pregnancy profile personalization & interactivity
  const [activeCategory, setActiveCategory] = useState("Veggies");
  const [recommendations, setRecommendations] = useState<RecommendationResponse[]>([]);
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(true);
  const [loadedImagesCount, setLoadedImagesCount] = useState(0);

  useEffect(() => {
    setLoadedImagesCount(0);
  }, [activeCategory, recommendations]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: number; title: string; body: string; type: "info" | "warning" | "success" }>>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [safetyFilter, setSafetyFilter] = useState<"ALL" | "SAFE_ONLY" | "NO_AVOID">("ALL");
  const [showSeeAllModal, setShowSeeAllModal] = useState(false);
  const [selectedRecItem, setSelectedRecItem] = useState<RecommendationItem | null>(null);
  const [recSearchQuery, setRecSearchQuery] = useState("");

  useEffect(() => {
    // Optionally trigger a silent background refresh, but we rely on Zustand for instant UI
    api.history().catch(console.error);
    api.getProfile().catch(console.error);
    resetHabitsIfNeeded();
    setupPushNotifications();

    const appStateListener = App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        useAppStore.getState().resetHabitsIfNeeded();
      }
    });

    return () => {
      appStateListener.then(listener => listener.remove()).catch(() => {});
    };
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

  useEffect(() => {
    const list = [];
    if (profile) {
      list.push({
        id: 1,
        title: "💧 Hydration Target (2.5L - 3.0L)",
        body: `Drink at least 8-10 glasses of water today. Proper hydration is critical to support your baby's amniotic fluid levels.`,
        type: "info" as const
      });
      if (profile.trimester === 1) {
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
      } else if (profile.trimester === 2) {
        list.push({
          id: 2,
          title: "🦴 Calcium Phase (Trimester 2)",
          body: "Your baby's skeleton is developing rapidly. Boost calcium with pasteurized dairy, curd, or calcium-fortified snacks.",
          type: "success" as const
        });
      } else if (profile.trimester === 3) {
        list.push({
          id: 2,
          title: "💪 Iron Boost (Trimester 3)",
          body: "Prepare for birth! Boost your iron intake with spinach and chia seeds to support higher blood volume and prevent anemia.",
          type: "success" as const
        });
      }

      const conds = (profile.medical_conditions || []).map((c: string) => c.toLowerCase());
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

    setIsRecommendationsLoading(true);
    api.getRecommendations(profile).then((res) => {
      setRecommendations(res);
    }).catch(console.error)
      .finally(() => setIsRecommendationsLoading(false));
  }, [profile]);

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
          <div
            className="h-12 w-12 overflow-hidden rounded-full"
            style={{
              border: "2px solid rgba(255,255,255,0.60)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.06), inset 0 0 8px rgba(255,255,255,0.30)",
              backdropFilter: "blur(8px)",
            }}
          >
            <img src="/logo.png" alt="Hirkani" className="h-full w-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
                {new Date().getHours() < 12 ? "Good Morning" : new Date().getHours() < 18 ? "Good Afternoon" : "Good Evening"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-[17px] font-extrabold font-display" style={{ color: "var(--text-primary)" }}>
                {profile?.name ? `${profile.name} ✨` : "Mama ✨"}
              </div>
              {streakCount > 0 && (
                <div className="px-2 py-0.5 rounded-full flex items-center gap-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 backdrop-blur-sm">
                  <span className="text-[11px] font-black text-amber-700">🔥 {streakCount} Day{streakCount > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowNotifications(true)}
          className="glass-card flex h-11 w-11 items-center justify-center rounded-full transition-transform active:scale-90 relative"
          style={{ padding: 0, marginBottom: 0, borderRadius: "50%" }}
        >
          <Bell size={18} style={{ color: "var(--text-primary)" }} />
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 h-3 w-3 rounded-full border border-white" style={{ background: "var(--pink-hot)", boxShadow: "0 2px 6px rgba(244,88,122,0.40)" }} />
          )}
        </button>
      </header>

      {/* ── Daily Insight Card ── */}
      {profile && notifications.find(n => n.type === "info" || n.type === "success") && (
        <div className="mb-6 p-4 rounded-[22px] flex items-start gap-3 shadow-sm" style={{ background: "rgba(255, 255, 255, 0.45)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.6)" }}>
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm text-[16px]">
            💡
          </div>
          <div>
            <div className="text-[13px] font-black" style={{ color: "var(--text-primary)" }}>
              {notifications.find(n => n.type === "info" || n.type === "success")?.title}
            </div>
            <div className="text-[11.5px] font-bold mt-0.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {notifications.find(n => n.type === "info" || n.type === "success")?.body}
            </div>
          </div>
        </div>
      )}

      <h1 className="mb-5 text-[34px] font-black leading-[1.1] tracking-tight font-display" style={{ color: "var(--text-primary)" }}>
        Check your<br />cravings
      </h1>
      
      {/* ── Daily Habits Dashboard ── */}
      <div className="mb-7 grid grid-cols-2 gap-3">
        <div 
          onClick={incrementWater}
          className="glass-card p-4 flex flex-col justify-between cursor-pointer transition-transform active:scale-95" 
          style={{ marginBottom: 0, overflow: 'hidden', position: 'relative' }}
        >
          <div 
            className="absolute bottom-0 left-0 right-0 bg-blue-500/20 transition-all duration-500 ease-out" 
            style={{ height: `${(dailyWater / 8) * 100}%` }}
          />
          <div className="relative z-10 flex items-center justify-between mb-2">
            <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: "rgba(59,130,246,0.15)" }}>
              <Droplets size={16} className="text-blue-500" />
            </div>
            <span className="text-[12px] font-black" style={{ color: dailyWater >= 8 ? "#10B981" : "var(--text-muted)" }}>
              {dailyWater}/8
            </span>
          </div>
          <div className="relative z-10">
            <div className="text-[13px] font-black leading-tight" style={{ color: "var(--text-primary)" }}>Water Goal</div>
            <div className="text-[10px] font-bold" style={{ color: "var(--text-muted)" }}>{dailyWater >= 8 ? 'Hydrated!' : 'Tap to drink'}</div>
          </div>
        </div>
        
        <div 
          onClick={toggleVitamin}
          className="glass-card p-4 flex flex-col justify-between cursor-pointer transition-transform active:scale-95" 
          style={{ marginBottom: 0 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-300" 
                 style={{ background: tookVitamin ? "rgba(16,185,129,0.15)" : "rgba(244,88,122,0.15)" }}>
              <Pill size={16} style={{ color: tookVitamin ? "#10B981" : "var(--pink-hot)" }} />
            </div>
            <div className={`h-5 w-5 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${tookVitamin ? 'border-emerald-500 bg-emerald-500' : 'border-[var(--text-muted)] bg-transparent'}`}>
              {tookVitamin && <Check size={12} className="text-white" />}
            </div>
          </div>
          <div>
            <div className="text-[13px] font-black leading-tight" style={{ color: "var(--text-primary)" }}>Vitamins</div>
            <div className="text-[10px] font-bold" style={{ color: "var(--text-muted)" }}>{tookVitamin ? 'Taken today' : 'Tap to mark'}</div>
          </div>
        </div>
      </div>

      <div className="relative mb-7">
        <div className="relative z-50">
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
              setShowSuggestions(true);
            }}
            onBlur={() => {
              // Delay hiding so suggestion clicks can register
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            onKeyDown={(e) => { if (e.key === "Enter" && searchQuery.trim()) performSearch(searchQuery.trim()); }}
            className="hk-input pl-11 pr-24 w-full h-[56px]" style={{ borderRadius: "22px" }}
          />
          <div className="absolute inset-y-0 right-2 flex items-center gap-1">
            <button 
              onClick={() => { window.location.href = '/scan'; }}
              className="h-10 w-10 flex items-center justify-center rounded-full transition-transform active:scale-90 hover:bg-black/5"
            >
              <ScanLine size={18} style={{ color: "var(--pink-hot)" }} />
            </button>
            <div className="w-[1px] h-6 bg-black/10" />
            <button
              onClick={() => setShowFilterModal(true)}
              className="h-10 w-10 flex items-center justify-center rounded-full transition-transform active:scale-90 hover:bg-black/5"
            >
              <SlidersHorizontal size={18} style={{ color: "var(--text-primary)" }} />
            </button>
          </div>
          <AnimatePresence>
            {showSuggestions && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="absolute top-[calc(100%+8px)] left-0 w-full overflow-hidden rounded-[22px] z-[60]"
                style={{
                  background: "rgba(255,255,255,0.75)",
                  backdropFilter: "blur(28px)",
                  WebkitBackdropFilter: "blur(28px)",
                  border: "1px solid rgba(255,255,255,0.50)",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.55)",
                }}>
                {searchQuery.trim().length < 2 && !isTyping ? (
                  <div className="p-4">
                    <div className="text-[11px] font-black uppercase tracking-wider mb-3 px-1" style={{ color: "var(--text-muted)" }}>Quick Searches</div>
                    <div className="flex flex-wrap gap-2">
                      {["Milk", "Coffee", "Apple", "Sushi"].map(q => (
                        <button key={q} onClick={() => performSearch(q)} className="px-3 py-1.5 rounded-full text-[13px] font-bold bg-white/50 border border-white/60 shadow-sm transition-transform active:scale-95" style={{ color: "var(--text-primary)" }}>{q}</button>
                      ))}
                    </div>
                  </div>
                ) : isTyping ? (
                  <div className="px-5 py-4 text-[13px] font-bold text-center" style={{ color: "var(--text-muted)" }}>Finding suggestions...</div>
                ) : (
                  <ul className="max-h-64 overflow-y-auto scrollbar-hide py-2">
                    {suggestions.map((s, i) => (
                      <li key={i}>
                        <button
                          onClick={() => performSearch(s.name, s.code)}
                          className="w-full px-5 py-2.5 text-left text-[14px] font-bold transition-colors hover:bg-white/30 flex items-center justify-between"
                          style={{ color: "var(--text-primary)" }}
                        >
                          <span className="flex items-center gap-3.5 min-w-0">
                            {s.image ? (
                              <img
                                src={s.image}
                                alt={s.name}
                                className="w-10 h-10 object-contain rounded-xl shrink-0"
                                style={{ background: "rgba(255,255,255,0.40)", border: "1px solid rgba(255,255,255,0.35)" }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(244,88,122,0.08)" }}>
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
      </div>

      <AnimatePresence mode="wait">
        {isSearchingFull ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card p-8 flex flex-col items-center justify-center text-center" style={{ marginBottom: "16px" }}>
            <Sparkles size={28} style={{ color: "var(--pink-hot)" }} className="animate-pulse mb-3" />
            <div className="text-[16px] font-extrabold" style={{ color: "var(--text-primary)" }}>Analysing with AI...</div>
            <div className="text-[13px] font-semibold mt-1" style={{ color: "var(--text-muted)" }}>Checking pregnancy safety 🌸</div>
          </motion.div>
        ) : searchError ? (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 text-center" style={{ marginBottom: "16px" }}>
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
                  <motion.button
                    key={label}
                    onClick={() => setActiveCategory(label)}
                    whileTap={{ scale: 0.95 }}
                    className={`flex shrink-0 items-center gap-2.5 rounded-full px-5 py-3 text-[14px] font-black transition-all ${
                      active ? "shadow-lg" : "text-gray-600 hover:bg-white/50"
                    }`}
                    style={active ? {
                      background: "linear-gradient(135deg, #FF2A5F, #FF5E4D)",
                      color: "#fff",
                      boxShadow: "0 8px 20px rgba(255,42,95,0.25), inset 0 1px 1px rgba(255,255,255,0.3)",
                      border: "none"
                    } : {
                      background: "rgba(255,255,255,0.40)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      border: "1px solid rgba(255,255,255,0.6)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
                    }}
                  >
                    <Icon size={16} strokeWidth={active ? 2.5 : 2} style={{ color: active ? "#fff" : "var(--pink-hot)" }} />
                    {label}
                  </motion.button>
                );
              })}
            </div>

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-[20px] font-extrabold font-display" style={{ color: "var(--text-primary)" }}>Recommended</h2>
                {profile?.pregnancy_week && (
                  <p className="text-[11px] font-bold" style={{ color: "var(--text-muted)" }}>Best for Week {profile.pregnancy_week}</p>
                )}
              </div>
              <button
                onClick={() => setShowSeeAllModal(true)}
                className="text-[12px] font-bold transition-opacity active:opacity-65 flex items-center gap-0.5"
                style={{ color: "var(--text-secondary)" }}
              >
                See all →
              </button>
            </div>

            <div className="relative">
              {(isRecommendationsLoading || (dashboardFilteredItems.length > 0 && loadedImagesCount < dashboardFilteredItems.length)) && (
                <div className="absolute inset-0 z-20 w-full h-full">
                  <AnimatedLoadingSkeleton />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4" style={{ opacity: (isRecommendationsLoading || (dashboardFilteredItems.length > 0 && loadedImagesCount < dashboardFilteredItems.length)) ? 0 : 1, transition: 'opacity 0.3s' }}>
                {dashboardFilteredItems.length > 0 ? (
                  dashboardFilteredItems.map((item, index) => (
                    <motion.div
                      key={item.name}
                      onClick={() => setSelectedRecItem(item)}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.34, 1.1, 0.64, 1] }}
                      whileTap={{ scale: 0.97 }}
                      className="glass-card group relative flex flex-col overflow-hidden rounded-[24px] p-4 cursor-pointer"
                      style={{ marginBottom: 0 }}
                    >
                      <div className="absolute inset-0 rounded-[24px]" style={{ background: `linear-gradient(160deg, ${item.bg} 0%, transparent 60%)` }} />
                      <div className="relative flex h-24 items-center justify-center mb-2 overflow-hidden rounded-[18px]">
                        <img 
                          src={item.img} 
                          alt={item.name} 
                          onLoad={() => setLoadedImagesCount(prev => prev + 1)}
                          onError={() => setLoadedImagesCount(prev => prev + 1)}
                          className="h-full w-full object-cover rounded-[18px] drop-shadow-xl transition-transform duration-500 group-hover:scale-105" 
                        />
                      </div>
                      <h3 className="relative z-[2] text-[14px] font-extrabold line-clamp-1" style={{ color: "var(--text-primary)" }}>{item.name}</h3>
                      <p className="relative z-[2] text-[11px] font-semibold mb-2 line-clamp-1" style={{ color: "var(--text-muted)" }}>{item.sub}</p>
                      <span
                        className="relative z-[2] inline-flex items-center self-start rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider"
                        style={{
                          background: item.safety === "SAFE" ? "rgba(16,185,129,0.10)" : "rgba(245,158,11,0.10)",
                          color: item.safety === "SAFE" ? "#065F46" : "#B45309",
                          border: `1px solid ${item.safety === "SAFE" ? "rgba(16,185,129,0.20)" : "rgba(245,158,11,0.20)"}`,
                          backdropFilter: "blur(6px)",
                        }}
                      >
                        {item.safety === "SAFE" ? "✓ SAFE" : "⚠️ CAUTION"}
                      </span>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-6 font-semibold text-[13px]" style={{ color: "var(--text-muted)" }}>
                    No items match this filter
                  </div>
                )}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Notifications Bottom Sheet ── */}
      <Portal>
        <AnimatePresence>
          {showNotifications && (
            <GlassBottomSheet onClose={() => setShowNotifications(false)}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-[19px] font-black font-display" style={{ color: "var(--text-primary)" }}>Pregnancy Updates</h3>
                  <p className="text-[11px] font-bold mt-0.5" style={{ color: "var(--text-muted)" }}>Tailored health alerts for your profile</p>
                </div>
                <button onClick={() => setShowNotifications(false)} className="glass-card flex h-8 w-8 items-center justify-center rounded-full active:scale-90 transition-transform" style={{ padding: 0, marginBottom: 0, borderRadius: "50%" }}>
                  <X size={16} style={{ color: "var(--text-secondary)" }} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-hide">
                {notifications.map((n, i) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.35, ease: [0.34, 1.1, 0.64, 1] }}
                    className="p-5 rounded-[20px] flex gap-3.5"
                    style={{
                      background: n.type === "warning" ? "rgba(254,242,242,0.40)" : n.type === "success" ? "rgba(240,253,250,0.40)" : "rgba(240,249,255,0.40)",
                      border: `1px solid ${n.type === "warning" ? "rgba(252,165,165,0.25)" : n.type === "success" ? "rgba(153,246,228,0.25)" : "rgba(186,230,253,0.25)"}`,
                      backdropFilter: "blur(12px)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)",
                    }}
                  >
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full shadow-sm" style={{
                      background: "rgba(255,255,255,0.55)",
                      color: n.type === "warning" ? "#F59E0B" : n.type === "success" ? "#10B981" : "#0EA5E9",
                      backdropFilter: "blur(8px)",
                    }}>
                      {n.type === "warning" ? <Sparkles size={13} /> : n.type === "success" ? <Check size={14} /> : <ArrowRight size={13} />}
                    </div>
                    <div>
                      <h4 className="text-[13.5px] font-black leading-tight" style={{ color: "var(--text-primary)" }}>{n.title}</h4>
                      <p className="text-[12px] font-bold mt-1 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{n.body}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="h-6 w-full shrink-0" />
            </GlassBottomSheet>
          )}
        </AnimatePresence>
      </Portal>

      {/* ── Filter Bottom Sheet ── */}
      <Portal>
        <AnimatePresence>
          {showFilterModal && (
            <GlassBottomSheet onClose={() => setShowFilterModal(false)}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-[19px] font-black font-display" style={{ color: "var(--text-primary)" }}>Filter Food Recommendations</h3>
                  <p className="text-[11px] font-bold mt-0.5" style={{ color: "var(--text-muted)" }}>Restrict listings by pregnancy safety classification</p>
                </div>
                <button onClick={() => setShowFilterModal(false)} className="glass-card h-8 w-8 flex items-center justify-center rounded-full transition-transform active:scale-90" style={{ padding: 0, marginBottom: 0, borderRadius: "50%" }}>
                  <X size={15} style={{ color: "var(--text-secondary)" }} />
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
                      className="w-full text-left p-5 rounded-[20px] transition-all flex items-center justify-between"
                      style={{
                        background: selected ? "rgba(244,88,122,0.08)" : "rgba(255,255,255,0.30)",
                        border: `1.5px solid ${selected ? "var(--pink-hot)" : "rgba(255,255,255,0.40)"}`,
                        backdropFilter: "blur(8px)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.30)",
                      }}
                    >
                      <div className="min-w-0 pr-4">
                        <div className="text-[14px] font-black" style={{ color: "var(--text-primary)" }}>{opt.label}</div>
                        <div className="text-[11px] font-bold mt-0.5 leading-tight" style={{ color: "var(--text-muted)" }}>{opt.desc}</div>
                      </div>
                      {selected && (<div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--pink-hot)", boxShadow: "0 4px 12px rgba(244,88,122,0.30)" }}><Check size={13} className="text-white" /></div>)}
                    </button>
                  );
                })}
              </div>
            </GlassBottomSheet>
          )}
        </AnimatePresence>
      </Portal>

      {/* ── Recommendation Detail ── */}
      <Portal>
        <AnimatePresence>
          {selectedRecItem && (
            <div className="fixed inset-0 z-[150] flex items-end justify-center" style={{ background: "rgba(0,0,0,0.30)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}>
              <div className="absolute inset-0" onClick={() => setSelectedRecItem(null)} />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 26, stiffness: 220 }}
                className="relative w-full max-w-[440px] rounded-t-[32px] p-6 pb-6 flex flex-col max-h-[88vh] overflow-y-auto scrollbar-hide"
                style={{
                  background: "rgba(255,255,255,0.70)",
                  backdropFilter: "blur(32px)",
                  WebkitBackdropFilter: "blur(32px)",
                  border: "1px solid rgba(255,255,255,0.50)",
                  borderBottom: "none",
                  boxShadow: "0 -8px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.65)",
                }}
              >
                <div className="w-12 h-1 rounded-full mx-auto mb-4 shrink-0" style={{ background: "rgba(0,0,0,0.10)" }} />
                <div className="flex justify-between items-start mb-4">
                  <div className="min-w-0 pr-4">
                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "var(--pink-hot)" }}>Premium Recommendation</span>
                    <h3 className="text-[22px] font-black font-display leading-tight mt-0.5" style={{ color: "var(--text-primary)" }}>{selectedRecItem.name}</h3>
                    <p className="text-[12px] font-bold mt-1" style={{ color: "var(--text-muted)" }}>{selectedRecItem.sub}</p>
                  </div>
                  <button onClick={() => setSelectedRecItem(null)} className="glass-card h-9 w-9 shrink-0 flex items-center justify-center rounded-full transition-transform active:scale-90" style={{ padding: 0, marginBottom: 0, borderRadius: "50%" }}>
                    <X size={16} style={{ color: "var(--text-secondary)" }} />
                  </button>
                </div>
                <div className="w-full h-44 rounded-[20px] overflow-hidden mb-5" style={{ border: "1px solid rgba(255,255,255,0.35)", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                  <img src={selectedRecItem.img} alt={selectedRecItem.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                    style={{
                      background: selectedRecItem.safety === "SAFE" ? "rgba(16,185,129,0.10)" : "rgba(245,158,11,0.10)",
                      color: selectedRecItem.safety === "SAFE" ? "#065F46" : "#B45309",
                      border: `1px solid ${selectedRecItem.safety === "SAFE" ? "rgba(16,185,129,0.20)" : "rgba(245,158,11,0.20)"}`,
                      backdropFilter: "blur(6px)",
                    }}>
                    {selectedRecItem.safety === "SAFE" ? "SAFE TO CONSUME" : "CONSUME IN MODERATION"}
                  </span>
                  {selectedRecItem.tags.map((tag) => <span key={tag} className="px-3 py-1 rounded-full text-[10px] font-black shrink-0" style={{ background: "rgba(244,88,122,0.08)", border: "1px solid rgba(244,88,122,0.15)", color: "var(--pink-hot)" }}>{tag}</span>)}
                </div>
                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="text-[12px] font-black uppercase tracking-wider mb-2" style={{ color: "var(--text-primary)" }}>Pregnancy Benefit</h4>
                    <p className="text-[13px] font-bold leading-relaxed p-3.5 rounded-[18px]" style={{ color: "var(--text-secondary)", background: "rgba(255,255,255,0.35)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.40)" }}>{selectedRecItem.benefit}</p>
                  </div>
                  <div>
                    <h4 className="text-[12px] font-black uppercase tracking-wider mb-2" style={{ color: "var(--text-primary)" }}>Detailed Safety Reasons</h4>
                    <ul className="space-y-2">
                      {selectedRecItem.reasons.map((r, i) => <li key={i} className="text-[13px] font-bold flex items-start gap-2 leading-relaxed" style={{ color: "var(--text-secondary)" }}><span className="mt-1 shrink-0" style={{ color: "var(--pink-hot)" }}>•</span><span>{r}</span></li>)}
                    </ul>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedRecItem(null); setShowSeeAllModal(false); performSearch(selectedRecItem.name); }}
                  className="btn-primary h-12 w-full text-[13.5px] font-black flex items-center justify-center gap-2 rounded-[20px]"
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

      {/* ── See All Modal ── */}
      <Portal>
        <AnimatePresence>
          {showSeeAllModal && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center animate-fade-in" style={{ background: "rgba(0,0,0,0.30)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: [0.34, 1.1, 0.64, 1] }}
                className="relative w-full max-w-[480px] h-[92vh] rounded-[32px] p-6 flex flex-col overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.65)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.50)",
                  boxShadow: "0 16px 64px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.60), inset 0 0 14px 4px rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex items-center justify-between mb-5 shrink-0">
                  <div>
                    <h3 className="text-[20px] font-black font-display" style={{ color: "var(--text-primary)" }}>Pregnancy Foods List</h3>
                    <p className="text-[11px] font-bold mt-0.5" style={{ color: "var(--text-muted)" }}>Cleared items for trimester & conditions</p>
                  </div>
                  <button onClick={() => { setShowSeeAllModal(false); setRecSearchQuery(""); }} className="glass-card h-10 w-10 flex items-center justify-center rounded-full transition-transform active:scale-95" style={{ padding: 0, marginBottom: 0, borderRadius: "50%" }}>
                    <X size={16} style={{ color: "var(--text-secondary)" }} />
                  </button>
                </div>
                <div className="relative mb-5 shrink-0">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none"><Search size={16} style={{ color: "var(--text-muted)" }} /></div>
                  <input type="text" placeholder="Search cleared foods..." value={recSearchQuery} onChange={(e) => setRecSearchQuery(e.target.value)} className="hk-input w-full h-12 pl-11 pr-4 text-[13.5px]" style={{ borderRadius: "18px" }} />
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-32 scrollbar-hide relative z-0" style={{ transform: "translateZ(0)" }}>
                  {recommendations.map((cat) => {
                    const filteredCatItems = cat.items.filter((item) => item.name.toLowerCase().includes(recSearchQuery.toLowerCase()) || item.sub.toLowerCase().includes(recSearchQuery.toLowerCase()));
                    const safetyFiltered = filterBySafety(filteredCatItems);
                    if (safetyFiltered.length === 0) return null;
                    return (
                      <div key={cat.category} className="space-y-2.5">
                        <h4 className="text-[12px] font-black uppercase tracking-wider px-1" style={{ color: "var(--pink-hot)", opacity: 0.8 }}>{cat.category}</h4>
                        <div className="grid grid-cols-1 gap-2.5">
                          {safetyFiltered.map((item) => (
                            <div
                              key={item.name}
                              onClick={() => setSelectedRecItem(item)}
                              className="rounded-[20px] p-3.5 flex items-center justify-between cursor-pointer transition-all group active:scale-[0.99]"
                              style={{
                                background: "rgba(255,255,255,0.85)",
                                border: "1px solid rgba(255,255,255,0.60)",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.50)",
                              }}
                            >
                              <div className="flex items-center gap-3.5 min-w-0">
                                <img src={item.img} alt={item.name} className="w-12 h-12 rounded-[14px] object-cover" style={{ border: "1px solid rgba(255,255,255,0.35)" }} />
                                <div className="min-w-0">
                                  <h5 className="text-[14px] font-black leading-tight transition-colors" style={{ color: "var(--text-primary)" }}>{item.name}</h5>
                                  <p className="text-[11px] font-bold mt-0.5 truncate pr-1" style={{ color: "var(--text-muted)" }}>{item.sub}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider" style={{
                                  background: item.safety === "SAFE" ? "rgba(16,185,129,0.10)" : "rgba(245,158,11,0.10)",
                                  color: item.safety === "SAFE" ? "#065F46" : "#B45309",
                                  border: `1px solid ${item.safety === "SAFE" ? "rgba(16,185,129,0.20)" : "rgba(245,158,11,0.20)"}`,
                                }}>
                                  {item.safety === "SAFE" ? "SAFE" : "CAUTION"}
                                </span>
                                <ChevronRight size={15} style={{ color: "var(--text-muted)" }} />
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

export default function HomeScreen() {
  const isAuthed = useAppStore((state) => state.isAuthed);
  const profile = useAppStore((state) => state.profile);
  
  // Wait for client mount to avoid hydration mismatch with Zustand persist
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    // Trigger background update of auth and profile state
    getMobileState(true).then((state) => {
      if (state.authed) useAppStore.getState().setAuthed(true);
      if (state.profileDone) api.getProfile().catch(console.error);
    });
  }, []);

  if (!mounted) return <div className="min-h-screen w-full" />;

  if (!isAuthed) return <AuthGate onDone={() => useAppStore.getState().setAuthed(true)} />;
  if (!profile) return <OnboardingProfile onDone={() => api.getProfile().catch(console.error)} />;
  
  return <PageTransition><MainHome /></PageTransition>;
}


