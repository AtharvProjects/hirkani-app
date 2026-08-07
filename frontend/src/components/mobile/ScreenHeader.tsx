"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

export function ScreenHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <header className="mb-7 flex items-start justify-between">
      <div>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.34, 1.1, 0.64, 1] }}
          className="text-[10px] font-extrabold uppercase tracking-[0.28em] mb-1"
          style={{ color: "var(--accent-main)", opacity: 0.75 }}
        >
          HIRKANI
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: [0.34, 1.1, 0.64, 1] }}
          className="text-[30px] font-black leading-none tracking-tight font-display"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </motion.h1>
        {subtitle ? (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1, ease: [0.34, 1.1, 0.64, 1] }}
            className="mt-2 text-[14px] font-semibold leading-snug"
            style={{ color: "var(--text-secondary)" }}
          >
            {subtitle}
          </motion.p>
        ) : null}
      </div>
      {right && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.15, ease: [0.34, 1.1, 0.64, 1] }}
        >
          {right}
        </motion.div>
      )}
    </header>
  );
}
