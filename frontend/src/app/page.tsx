"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  const handleAction = () => {
    router.push("/home");
  };

  return (
    <div
      className="absolute inset-0 flex flex-col overflow-hidden z-50"
    >
      {/* Hero illustration */}
      <div className="relative flex-1 flex items-center justify-center min-h-0 overflow-hidden pt-8">
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
        <h1 className="text-[30px] leading-[1.18] text-slate-800 mb-3" style={{ textShadow: "0 2px 12px rgba(255,255,255,0.8)", fontWeight: 300 }}>
          Welcome to <span style={{ fontWeight: 800 }}>Hirkani!</span> Are{"\n"}
          you <span style={{ fontWeight: 800 }}>pregnant?</span>
        </h1>

        {/* Subtitle */}
        <p className="text-[13px] font-medium text-slate-600 mb-6 leading-relaxed">
          Your diet can change with your pregnancy stage. Knowing it
          helps us make better recommendations.
        </p>

        {/* Two side-by-side buttons */}
        <div className="flex gap-3 mb-4">
          {/* Ghost button */}
          <button
            onClick={handleAction}
            className="flex-1 h-[56px] rounded-[28px] text-[14px] font-bold transition-transform active:scale-95"
            style={{
              background: "rgba(255,255,255,0.92)",
              color: "#2D1B2E",
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            }}
          >
            Not yet, but I'm trying
          </button>

          {/* Frosted button */}
          <button
            onClick={handleAction}
            className="flex-1 h-[56px] rounded-[28px] text-[14px] font-bold transition-transform active:scale-95"
            style={{
              background: "rgba(255,255,255,0.7)",
              border: "1.5px solid rgba(255,255,255,0.9)",
              color: "#2D1B2E",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            Yes, I'm pregnant
          </button>
        </div>

        {/* Full-width white button */}
        <button
          onClick={handleAction}
          className="w-full h-[56px] rounded-[28px] text-[15px] font-bold transition-transform active:scale-95"
          style={{
            background: "rgba(255,255,255,0.95)",
            color: "#2D1B2E",
            boxShadow: "0 4px 24px rgba(0,0,0,0.14)",
          }}
        >
          About my body
        </button>
      </motion.div>
    </div>
  );
}
