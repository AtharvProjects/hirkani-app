"use client";

import { motion } from "framer-motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.99 }}
      transition={{
        duration: 0.35,
        ease: [0.34, 1.1, 0.64, 1],
      }}
      className="space-y-0 relative z-10"
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}
