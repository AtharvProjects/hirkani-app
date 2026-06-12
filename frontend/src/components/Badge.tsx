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
    },
    CONSUME_WITH_CAUTION: {
      label: "⚠️ EAT IN MODERATION",
      sublabel: "Enjoy in moderation — ask your doctor 💛",
      icon: AlertTriangle,
      cls: "badge-caution",
      iconColor: "#D97706",
    },
    AVOID_DURING_PREGNANCY: {
      label: "❌ NOT RECOMMENDED",
      sublabel: "Not recommended for expecting mothers 🚫",
      icon: XCircle,
      cls: "badge-avoid",
      iconColor: "#DC2626",
    },
  }[classification];

  const Icon = map.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.34, 1.2, 0.64, 1] }}
      className={`w-full rounded-[28px] px-6 py-5 text-center flex flex-col items-center justify-center mb-4 ${map.cls}`}
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full mb-3"
        style={{ background: "rgba(255,255,255,0.50)", backdropFilter: "blur(12px)" }}
      >
        <Icon size={28} style={{ color: map.iconColor }} />
      </div>
      <div className="text-[14px] font-extrabold tracking-widest mb-1">{map.label}</div>
      <div className="text-[12px] font-semibold opacity-80">{map.sublabel}</div>
    </motion.div>
  );
}
