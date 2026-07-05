"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  variant?: "default" | "strong" | "premium" | "subtle";
  glow?: boolean;
  interactive?: boolean;
}

export function GlassCard({
  title,
  children,
  className = "",
  variant = "default",
  glow = false,
  interactive = false,
}: GlassCardProps) {
  const variantClass =
    variant === "premium"
      ? "glass-card-premium"
      : variant === "strong"
        ? "glass-card-strong"
        : "glass-card";

  return (
    <motion.section
      whileTap={interactive ? { scale: 0.98 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`${variantClass} p-5 mb-4 ${glow ? "glow-pink" : ""} ${className}`}
      style={{ position: "relative" }}
    >
      {title ? (
        <h3
          className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.20em]"
          style={{ color: "var(--text-muted)" }}
        >
          {title}
        </h3>
      ) : null}
      <div className="relative z-[2]">{children}</div>
    </motion.section>
  );
}
