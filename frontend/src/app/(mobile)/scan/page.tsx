"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, Heart, ScanLine, X } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

import { SafetyBadge } from "@/components/Badge";
import { GlassCard } from "@/components/GlassCard";
import { UnifiedScanInterface } from "@/components/UnifiedScanInterface";
import { PageTransition } from "@/components/mobile/PageTransition";
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from "@zxing/library";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { getMobileState } from "@/components/mobile/auth";
import { api, ScanResult } from "@/lib/api";
import { FoodSafetyResult } from "@/components/FoodSafetyResult";

function ScanContent() {
  const searchParams = useSearchParams();
  const [authed, setAuthed] = useState(false);
  const [profileDone, setProfileDone] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

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
    });
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

  async function handleQuickBarcode(code: string) {
    setIsSearching(true);
    setResult(null);
    try {
      const res = await api.analyzeBarcode(code.trim());
      setResult(res);
    } catch (e) {
      console.warn("Barcode lookup failed:", e);
      const foodName = prompt(
        `Barcode "${code}" was not found in the food database.\n\nPlease type the product or food name manually to search:`
      );
      if (foodName && foodName.trim()) {
        try {
          const res = await api.analyzeText("search", foodName.trim());
          setResult(res);
        } catch (searchErr: any) {
          alert("Search failed: " + searchErr.message);
        }
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
      } catch (scaleErr) {
        console.warn("Failed to downscale captured image, decoding original:", scaleErr);
      }

      const hints = new Map();
      hints.set(DecodeHintType.TRY_HARDER, true);

      const reader = new BrowserMultiFormatReader(hints);
      try {
        const decoded = await reader.decodeFromImageUrl(decodedSrc);
        URL.revokeObjectURL(url);
        if (decoded && decoded.getText()) {
          const res = await api.analyzeBarcode(decoded.getText().trim());
          setResult(res);
          return;
        }
      } catch {
        URL.revokeObjectURL(url);
      }

      // No barcode found in image — fallback to AI Vision Scan directly (using local Ollama)
      try {
        const res = await api.uploadImage(file);
        setResult(res);
        return;
      } catch (aiErr: any) {
        console.warn("AI scan failed, falling back to manual entry:", aiErr);
      }

      // Fallback: Prompt user to type food name
      const foodName = prompt(
        "No barcode or image recognized automatically.\n\nPlease type the food/product name to search:"
      );
      if (foodName && foodName.trim()) {
        const res = await api.analyzeText("search", foodName.trim());
        setResult(res);
      }
    } catch (e: any) {
      alert("Scan failed: " + e.message);
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

  if (isLoading) {
    return (
      <PageTransition>
        <ScreenHeader title="Scan Food" subtitle="Barcode, label OCR, or food image" />
      </PageTransition>
    );
  }

  if (!authed || !profileDone) {
    return (
      <PageTransition>
        <ScreenHeader title="Scan Food" subtitle="Barcode, label OCR, or food image" />
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
        title="Scan Food"
        subtitle="Tap camera or enter label details"
        right={
          <div
            className="flex h-11 w-11 items-center justify-center rounded-full"
            style={{
              background: "rgba(244,88,122,0.12)",
              border: "1.5px solid rgba(244,88,122,0.25)",
              backdropFilter: "blur(12px)",
            }}
          >
            <Sparkles size={18} style={{ color: "var(--pink-hot)" }} />
          </div>
        }
      />

      {/* Loading state */}
      {isSearching ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-8 mb-5 flex flex-col items-center justify-center text-center"
        >
          <div
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: "rgba(244,88,122,0.10)", border: "2px solid rgba(244,88,122,0.20)" }}
          >
            <ScanLine size={24} style={{ color: "var(--pink-hot)" }} className="animate-pulse" />
          </div>
          <div className="text-[15px] font-extrabold mb-1" style={{ color: "var(--text-primary)" }}>
            Searching internet...
          </div>
          <div className="text-[13px] font-semibold" style={{ color: "var(--text-muted)" }}>
            Checking pregnancy safety 🌸
          </div>
        </motion.div>
      ) : null}

      <div className={isSearching ? "opacity-50 pointer-events-none" : ""}>
        <UnifiedScanInterface 
          onBarcodeDetected={handleQuickBarcode} 
          onImageCaptured={handleImageCaptured} 
          onResult={setResult} 
        />
      </div>

      {result ? (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 180 }}
          className="absolute inset-0 z-50 overflow-y-auto px-5 pt-6 pb-6 flex flex-col"
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
          <div className="h-28 w-full shrink-0" />
        </motion.div>
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
