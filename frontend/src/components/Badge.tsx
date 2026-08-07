"use client";

import { SafetyClass } from "@/lib/api";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { motion } from "framer-motion";

export function SafetyBadge({ classification }: { classification: SafetyClass }) {
  const map = {
    SAFE: {
      label: "✅ SAFE TO EAT",
      sublabel: "Great choice for your pregnancy journey ✨",
      icon: CheckCircle2,
      cls: "badge-safe",
      iconColor: "#059669",
      glowColor: "rgba(16,185,129,0.12)",
    },
    CONSUME_WITH_CAUTION: {
      label: "⚠️ EAT IN MODERATION",
      sublabel: "Enjoy in moderation — ask your doctor 💛",
      icon: AlertTriangle,
      cls: "badge-caution",
      iconColor: "#D97706",
      glowColor: "rgba(245,158,11,0.12)",
    },
    AVOID_DURING_PREGNANCY: {
      label: "❌ NOT RECOMMENDED",
      sublabel: "Not recommended for expecting mothers 🚫",
      icon: XCircle,
      cls: "badge-avoid",
      iconColor: "#DC2626",
      glowColor: "rgba(239,68,68,0.12)",
    },
  }[classification];

  const Icon = map.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.34, 1.2, 0.64, 1] }}
      className={`w-full rounded-[24px] px-6 py-5 text-center flex flex-col items-center justify-center mb-4 ${map.cls}`}
    >
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.15, duration: 0.45, type: "spring", stiffness: 300, damping: 20 }}
        className="flex h-14 w-14 items-center justify-center rounded-full mb-3"
        style={{
          background: "var(--glass-bg-medium)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: `0 4px 16px ${map.glowColor}, inset 0 1px 0 var(--glass-bg-medium)`,
        }}
      >
        <Icon size={28} style={{ color: map.iconColor }} />
      </motion.div>
      <div className="text-[14px] font-extrabold tracking-widest mb-1">{map.label}</div>
      <div className="text-[12px] font-semibold opacity-80">{map.sublabel}</div>
    </motion.div>
  );
}
