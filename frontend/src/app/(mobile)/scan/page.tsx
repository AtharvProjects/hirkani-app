"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { Sparkles, Heart, ScanLine, X, Clock, ChevronRight, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import Link from "next/link";

import { SafetyBadge } from "@/components/Badge";
import { GlassCard } from "@/components/GlassCard";
import { UnifiedScanInterface } from "@/components/UnifiedScanInterface";
import { PageTransition } from "@/components/mobile/PageTransition";
// Dynamically imported: import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from "@zxing/library";

import { useTranslation } from "@/lib/i18n";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { getMobileState } from "@/components/mobile/auth";
import { api, ScanResult } from "@/lib/api";
import { FoodSafetyResult } from "@/components/FoodSafetyResult";
import { useAppStore } from "@/store/useAppStore";
import { App } from "@capacitor/app";

function AnimatedLoader() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const texts = [
    "Scanning product details...",
    t('scan.analyze'),
    "Decoding ingredients list...",
    "Cross-referencing FDA safety guidelines...",
    "Checking allergy and diet profiles...",
    "Finalizing safety report..."
  ];

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTextIndex(prev => (prev + 1) % texts.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6"
      style={{
        background: "rgba(0, 0, 0, 0.25)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white border border-gray-100 p-8 flex flex-col items-center justify-center relative overflow-hidden w-full max-w-[320px] rounded-[32px] shadow-2xl"
      >
        <motion.div 
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-full shadow-lg z-10"
          style={{
            background: "linear-gradient(135deg, var(--pink-hot) 0%, #FF9A9E 100%)",
          }}
        >
          <ScanLine size={32} className="text-white" />
        </motion.div>
        
        <div className="h-14 flex items-center justify-center text-center overflow-hidden z-10 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={textIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-[17px] font-black tracking-tight font-display w-full"
              style={{ color: "var(--text-primary)" }}
            >
              {texts[textIndex]}
            </motion.div>
          </AnimatePresence>
        </div>
        
        <p className="mt-2 text-[13px] font-semibold text-center z-10" style={{ color: "var(--text-muted)" }}>
          Please wait a moment 🌸
        </p>
      </motion.div>
    </motion.div>,
    document.body
  );
}

function ScanContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);
  const [profileDone, setProfileDone] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState<{title: string, message: string} | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isAppActive, setIsAppActive] = useState(true);
  const scanHistory = useAppStore((state) => state.scanHistory);
  const scanThumbnails = useAppStore((state) => state.scanThumbnails);

  const badgeTone = useMemo(() => {
    if (!result) return "var(--text-primary)";
    if (result.classification === "SAFE") return "#065F46";
    if (result.classification === "CONSUME_WITH_CAUTION") return "#78350F";
    return "#7F1D1D";
  }, [result]);

  useEffect(() => {
    getMobileState().then((state) => {
      setAuthed(state.authed);
      setProfileDone(state.profileDone);
      setIsLoading(false);
      if (state.authed) {
        api.history().catch(console.error);
      }
    });

    const checkVisibility = () => {
      setIsAppActive(document.visibilityState === "visible");
    };
    
    document.addEventListener("visibilitychange", checkVisibility);
    
    let appListener: any;
    if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform()) {
      App.addListener('appStateChange', ({ isActive }) => {
        setIsAppActive(isActive && document.visibilityState === "visible");
      }).then(l => appListener = l).catch(() => {});
    }

    return () => {
      document.removeEventListener("visibilitychange", checkVisibility);
      if (appListener) appListener.remove();
    };
  }, []);

  useEffect(() => {
    setIsSaved(false);
  }, [result]);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q && authed && profileDone) {
      setIsSearching(true);
      api.analyzeText("search", q)
        .then((res) => setResult(res))
        .catch((err) => alert("Search failed: " + err.message))
        .finally(() => setIsSearching(false));
    }
  }, [searchParams, authed, profileDone]);

  async function handleQuickBarcode(code: string, frameData?: string) {
    setIsSearching(true);
    setResult(null);
    try {
      const res = await api.analyzeBarcode(code.trim(), frameData);
      setResult(res);
    } catch (e: any) {
      console.warn("Barcode lookup failed:", e);
      if (e.message?.includes("NOT_FOOD") || String(e).includes("NOT_FOOD")) {
        setScanError({
          title: "Not a Food Product",
          message: "This does not appear to be a food or beverage product. Hirkani only analyzes food items for pregnancy safety."
        });
      } else {
        setScanError({
          title: "Barcode Not Found",
          message: `Barcode "${code}" was not found in the global food database.\n\nPlease tap the pink Camera Shutter button below to scan the ingredients list directly!`
        });
      }
      
      // We don't want to freeze the camera forever
      if (typeof window !== 'undefined') {
         setTimeout(() => {
            // Give them 2 seconds to read the alert, then let them scan again
            setIsSearching(false); 
         }, 500);
      }
    } finally {
      setIsSearching(false);
    }
  }

  async function handleImageCaptured(file: File) {
    setIsSearching(true);
    try {
      const url = URL.createObjectURL(file);
      
      // Downscale image using canvas to maximize barcode detection rate
      let decodedSrc = url;
      try {
        const img = new Image();
        await new Promise((res, rej) => {
          img.onload = res;
          img.onerror = rej;
          img.src = url;
        });

        const maxDim = 1024;
        let width = img.width;
        let height = img.height;
        
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            decodedSrc = canvas.toDataURL("image/jpeg", 0.90);
          }
        }
        
        // Always generate a tiny thumbnail for the history list to prevent localStorage bloat (limit 5MB)
        const thumbDim = 120;
        let tw = img.width; let th = img.height;
        if (tw > th) { th = Math.round((th * thumbDim) / tw); tw = thumbDim; }
        else { tw = Math.round((tw * thumbDim) / th); th = thumbDim; }
        const tCanvas = document.createElement("canvas");
        tCanvas.width = tw; tCanvas.height = th;
        tCanvas.getContext("2d")?.drawImage(img, 0, 0, tw, th);
        const tinyThumb = tCanvas.toDataURL("image/jpeg", 0.50);
        
        // Store it globally for the next step to consume
        (window as any)._lastTinyThumb = tinyThumb;
      } catch (scaleErr) {
        console.warn("Failed to downscale captured image, decoding original:", scaleErr);
      }

      const { BrowserMultiFormatReader, DecodeHintType } = await import("@zxing/library");
      const hints = new Map();
      hints.set(DecodeHintType.TRY_HARDER, true);

      const reader = new BrowserMultiFormatReader(hints);
      try {
        const decoded = await reader.decodeFromImageUrl(decodedSrc);
        if (decoded && decoded.getText()) {
          const res = await api.analyzeBarcode(decoded.getText().trim());
          res.image_url = decodedSrc;
          if (res.id && (window as any)._lastTinyThumb) {
             useAppStore.getState().setScanThumbnail(res.id.toString(), (window as any)._lastTinyThumb);
          }
          setResult(res);
          return;
        }
      } catch {
        // Barcode decode failed, proceed to AI vision
      }

      // No barcode found in image — fallback to AI Vision Scan directly (using local Ollama)
      try {
        const res = await api.uploadImage(file);
        res.image_url = decodedSrc;
        if (res.id && (window as any)._lastTinyThumb) {
           useAppStore.getState().setScanThumbnail(res.id.toString(), (window as any)._lastTinyThumb);
        }
        setResult(res);
        return;
      } catch (aiErr: any) {
        console.warn("AI scan failed, falling back to manual entry:", aiErr);
        if (aiErr.message?.includes("NOT_FOOD") || String(aiErr).includes("NOT_FOOD")) {
          setScanError({
            title: "Not a Food Product",
            message: "We couldn't detect any food or beverage in this image. Please make sure to scan a food item or nutrition label."
          });
          return;
        }
      }

      setScanError({
        title: "Scan Unsuccessful",
        message: "No barcode or food product recognized automatically. Please try taking a clearer photo."
      });
      
    } catch (e: any) {
      setScanError({
        title: "Scan Failed",
        message: e.message || "An unexpected error occurred while scanning."
      });
    } finally {
      setIsSearching(false);
    }
  }

  async function handleSaveFavorite() {
    if (!result) return;
    try {
      await api.addFavorite(result.detected_food, result.classification);
      setIsSaved(true);
    } catch (e: any) {
      alert("Failed to save: " + e.message);
    }
  }

  function handleHistoryClick(scan: any) {
    // History removed per user request
  }

  if (isLoading) {
    return (
      <PageTransition>
        <ScreenHeader title={t('scan.title')} subtitle={t('scan.subtitle')} />
      </PageTransition>
    );
  }

  if (!authed || !profileDone) {
    return (
      <PageTransition>
        <ScreenHeader title={t('scan.title')} subtitle={t('scan.subtitle')} />
        <GlassCard>
          <div className="flex flex-col items-center text-center p-2">
            <p className="text-[14px] font-semibold mb-4" style={{ color: "var(--text-secondary)" }}>
              Complete sign-in and profile setup on Home first 🌸
            </p>
            <Link
              href="/home"
              className="btn-primary w-full h-[48px] flex items-center justify-center text-[14px] font-bold"
            >
              Go to Home Screen
            </Link>
          </div>
        </GlassCard>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <ScreenHeader
        title={t('scan.title')}
        subtitle={t('scan.subtitle')}
        right={
          <div
            className="flex h-11 w-11 items-center justify-center rounded-full"
            style={{
              background: "rgba(244,88,122,0.12)",
              border: "1.5px solid rgba(244,88,122,0.25)",
              backdropFilter: "blur(12px)",
            }}
          >
            <Clock size={18} style={{ color: "var(--pink-hot)" }} />
          </div>
        }
      />

      {/* Animated Full Screen Loader */}
      <AnimatePresence>
        {isSearching && <AnimatedLoader />}
      </AnimatePresence>

      <div className={isSearching ? "opacity-50 pointer-events-none" : ""}>
        <UnifiedScanInterface 
          onBarcodeDetected={handleQuickBarcode} 
          onImageCaptured={handleImageCaptured} 
          onResult={setResult} 
          paused={!!result || !!scanError || isSearching || !isAppActive || pathname !== '/scan'}
        />

        {!isSearching && scanHistory.length > 0 && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-4 px-4">
              <h3 className="text-[18px] font-extrabold font-display" style={{ color: "var(--text-primary)" }}>{t('scan.recent')}</h3>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-4 px-4 snap-x">
              {scanHistory.map((scan) => (
                <div 
                  key={scan.id} 
                  className="shrink-0 w-36 h-36 rounded-[22px] p-4 snap-start relative overflow-hidden flex flex-col justify-between active:scale-[0.97] transition-transform cursor-pointer"
                  style={{
                    background: "rgba(255,255,255,0.40)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.6)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.4)"
                  }}
                  onClick={async () => {
                    const parsed = (field: any) => {
                      if (!field) return [];
                      if (typeof field === 'string') {
                        try { return JSON.parse(field); } catch { return []; }
                      }
                      return field;
                    };
                    
                    let scanData = {
                      ...scan,
                      classification: scan.classification as any,
                      rule_hits: parsed(scan.rule_hits),
                      alternatives: parsed(scan.alternatives),
                      why_reasons: parsed(scan.why_reasons),
                      ingredients_analysis: parsed(scan.ingredients_analysis),
                      sources: parsed(scan.sources),
                      nutrient_insights: parsed(scan.nutrient_insights),
                      references: parsed(scan.references),
                    };

                    // Re-calculate the extended fields if they are missing (e.g., loaded from old DB schema)
                    if (!scanData.why_reasons || scanData.why_reasons.length === 0) {
                      const { evaluatePregnancySafety } = await import('@/lib/rulesEngine');
                      const profile = useAppStore.getState().profile || {};
                      
                      // Extract AI allergies from saved rule_hits so we don't lose them on recalculation
                      const savedRuleHits = parsed(scan.rule_hits) || [];
                      const aiAllergies = savedRuleHits
                        .filter((r: any) => r.key === "allergen_match_ai")
                        .map((r: any) => {
                           const match = r.message.match(/'([^']+)'/);
                           return match ? match[1] : null;
                        })
                        .filter(Boolean);

                      const evalResult = await evaluatePregnancySafety(
                        scanData.detected_food,
                        parsed(scan.ingredients),
                        parsed(scan.nutrients),
                        profile,
                        aiAllergies
                      );
                      
                      scanData.safety_score = evalResult.safetyScore;
                      scanData.why_reasons = evalResult.whyReasons;
                      scanData.trimester_risk = evalResult.trimesterRisk;
                      scanData.ingredients_analysis = evalResult.ingredientsAnalysis;
                      scanData.recommendation = evalResult.recommendation;
                      scanData.sources = evalResult.sources;
                      scanData.nutrient_insights = evalResult.nutrientInsights;
                    }

                    setResult(scanData as ScanResult);
                  }}
                >
                  <div className="absolute top-3 right-3 flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: scan.classification === "SAFE" ? "#10B981" : scan.classification === "CONSUME_WITH_CAUTION" ? "#F59E0B" : "#EF4444" }} />
                  </div>
                  {scanThumbnails[scan.id] ? (
                    <div className="h-12 w-12 rounded-[14px] overflow-hidden mb-2 relative shrink-0" style={{ border: "1px solid rgba(244,88,122,0.15)" }}>
                      <img src={scanThumbnails[scan.id]} alt={scan.detected_food} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-[14px] flex items-center justify-center mb-2 shrink-0" style={{ background: "rgba(244,88,122,0.1)", border: "1px solid rgba(244,88,122,0.15)" }}>
                      <Clock size={20} style={{ color: "var(--pink-hot)" }} />
                    </div>
                  )}
                  <div>
                    <div className="text-[14px] font-black leading-tight line-clamp-2" style={{ color: "var(--text-primary)" }}>
                      {scan.detected_food}
                    </div>
                    <div className="text-[11px] font-bold mt-1" style={{ color: "var(--text-muted)" }}>
                      {new Date(scan.created_at || scan.scanned_at || new Date()).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Large spacer to prevent content from hiding behind the bottom nav bar */}
        <div className="h-32 w-full shrink-0" />
      </div>

      {scanError && typeof document !== "undefined" ? createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center px-4"
            style={{
              background: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-[340px] rounded-[32px] p-6 flex flex-col items-center text-center shadow-2xl relative overflow-hidden"
              style={{
                border: "1px solid rgba(255,255,255,0.8)",
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-rose-50 to-white" />
              
              <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 mb-4 z-10 shadow-sm">
                <AlertTriangle size={32} strokeWidth={2.5} />
              </div>
              
              <h3 className="text-[22px] font-black font-display text-gray-900 mb-2 z-10">
                {scanError.title}
              </h3>
              
              <p className="text-[14px] font-medium text-gray-500 mb-6 z-10 leading-relaxed">
                {scanError.message}
              </p>
              
              <button
                onClick={() => setScanError(null)}
                className="w-full h-[52px] rounded-full text-white font-bold text-[16px] z-10 active:scale-[0.98] transition-transform"
                style={{ background: "var(--pink-hot)", boxShadow: "0 4px 14px rgba(255, 42, 95, 0.3)" }}
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      ) : null}

      {result && typeof document !== "undefined" ? createPortal(
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 180 }}
          className="fixed inset-0 z-[100] overflow-y-auto px-5 pt-6 pb-6 flex flex-col"
          style={{
            background: "rgba(255, 244, 240, 0.98)",
            backdropFilter: "blur(36px)",
            WebkitBackdropFilter: "blur(36px)",
          }}
        >
          <FoodSafetyResult
            result={result}
            onClose={() => setResult(null)}
            onSaveFavorite={handleSaveFavorite}
            isSaved={isSaved}
          />
          <div className="h-32 w-full shrink-0" />
        </motion.div>,
        document.body
      ) : null}
    </PageTransition>
  );
}

export default function ScanScreen() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center">
        <div className="text-[15px] font-bold" style={{ color: "var(--text-muted)" }}>Loading...</div>
      </div>
    }>
      <ScanContent />
    </Suspense>
  );
}
