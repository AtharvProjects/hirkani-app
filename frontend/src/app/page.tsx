"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";

export default function LandingPage() {
  const router = useRouter();
  const isAuthed = useAppStore((state) => state.isAuthed);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isAuthed) {
      router.replace("/home");
    }
  }, [isAuthed, router]);

  // Prevent flash during hydration/redirect
  if (!mounted || isAuthed) {
    return null;
  }

  const handleAction = () => {
    router.push("/home");
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden z-50">
      {/* Aurora background */}
      <div className="aurora-bg">
        <div className="aurora-blob-3" />
        <div className="aurora-blob-4" />
        <div className="aurora-noise" />
      </div>

      {/* Hero illustration */}
      <div className="relative flex-1 flex items-center justify-center min-h-0 overflow-hidden pt-8 z-10">
        <motion.img
          initial={{ opacity: 0, y: 30, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, ease: [0.34, 1.05, 0.64, 1] }}
          src="/mama-hero.png"
          alt="Pregnant woman illustration"
          className="w-full object-contain"
          style={{
            maxHeight: "100%",
            filter: "drop-shadow(0 20px 40px rgba(160, 48, 112, 0.30))",
            WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
            maskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
          }}
        />
      </div>

      {/* Bottom content overlay */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.6, ease: [0.34, 1.05, 0.64, 1] }}
        className="relative z-10 px-6 pb-12 shrink-0"
      >
        {/* Headline */}
        <h1
          className="text-[30px] leading-[1.18] mb-3 font-display"
          style={{
            color: "var(--text-primary)",
            textShadow: "0 2px 12px rgba(255,255,255,0.8)",
            fontWeight: 300,
          }}
        >
          Welcome to <span style={{ fontWeight: 800 }}>Hirkani!</span> Are{"\n"}
          you <span style={{ fontWeight: 800 }}>pregnant?</span>
        </h1>

        {/* Subtitle */}
        <p className="text-[13px] font-medium mb-6 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Your diet can change with your pregnancy stage. Knowing it
          helps us make better recommendations.
        </p>

        {/* Two side-by-side glass buttons */}
        <div className="flex gap-3 mb-4">
          {/* Ghost glass button */}
          <button
            onClick={handleAction}
            className="flex-1 h-[56px] rounded-[28px] text-[14px] font-bold transition-transform active:scale-[0.97]"
            style={{
              background: "rgba(255,255,255,0.35)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.50)",
              color: "var(--text-primary)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.50), inset 0 0 8px rgba(255,255,255,0.10)",
            }}
          >
            Not yet, but I'm trying
          </button>

          {/* Frosted glass button */}
          <button
            onClick={handleAction}
            className="flex-1 h-[56px] rounded-[28px] text-[14px] font-bold transition-transform active:scale-[0.97]"
            style={{
              background: "rgba(255,255,255,0.45)",
              border: "1px solid rgba(255,255,255,0.60)",
              color: "var(--text-primary)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.55), inset 0 0 10px rgba(255,255,255,0.12)",
            }}
          >
            Yes, I'm pregnant
          </button>
        </div>

        {/* Full-width glass CTA button */}
        <button
          onClick={handleAction}
          className="w-full h-[56px] rounded-[28px] text-[15px] font-bold transition-transform active:scale-[0.97]"
          style={{
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            border: "1px solid rgba(255,255,255,0.60)",
            color: "var(--text-primary)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.60), inset 0 -1px 0 rgba(255,255,255,0.10), inset 0 0 14px 4px rgba(255,255,255,0.08)",
          }}
        >
          About my body
        </button>
      </motion.div>
    </div>
  );
}
