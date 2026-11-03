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

  const handleGetStarted = () => {
    router.push("/signup");
  };

  const handleLogin = () => {
    router.push("/login");
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
          Welcome to <span style={{ fontWeight: 800 }}>Hirkani!</span>
        </h1>

        {/* Subtitle */}
        <p className="text-[13px] font-medium mb-6 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Your clinical pregnancy nutrition & food safety assistant. Scan any food or barcode to verify safety for mother and baby across every trimester.
        </p>

        {/* Primary Get Started Button */}
        <div className="mb-4">
          <button
            onClick={handleGetStarted}
            className="w-full h-[56px] rounded-[28px] text-[15px] font-bold transition-transform active:scale-[0.97] flex items-center justify-center gap-2 text-white shadow-xl"
            style={{
              background: "linear-gradient(135deg, var(--accent-main) 0%, #8E8E93 100%)",
            }}
          >
            Get Started
          </button>
        </div>

        {/* Login link for returning users */}
        <div className="text-center">
          <p className="text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <button 
              onClick={handleLogin} 
              className="font-bold hover:underline" 
              style={{ color: "var(--accent-main)" }}
            >
              Log in
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
