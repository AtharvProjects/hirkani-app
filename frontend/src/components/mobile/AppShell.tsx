"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, ScanLine, Settings, UserRound } from "lucide-react";

const tabs = [
  { href: "/home",     label: "Home",     icon: Home },
  { href: "/scan",     label: "Scan",     icon: ScanLine },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/profile",  label: "Profile",  icon: UserRound },
];

import { useAppStore } from "@/store/useAppStore";
import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";

export function useKeyboardOpen() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      // If the window inner height is less than 80% of the screen height, the keyboard is likely open.
      if (window.screen && window.innerHeight < window.screen.height * 0.65) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
    }
    
    // Check initial state
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  return isOpen;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile } = useAppStore();
  const isProfileIncomplete = !profile;
  const isKeyboardOpen = useKeyboardOpen();
  const { t } = useTranslation();

  return (
    <div
      className="mobile-shell relative"
      style={{ margin: "0 auto", display: "flex", flexDirection: "column", height: "100dvh" }}
    >
      {/* ── Premium Aurora Animated Background ── */}
      <div className="aurora-bg">
        <div className="aurora-blob-3" />
        <div className="aurora-blob-4" />
        <div className="aurora-noise" />
      </div>

      {/* Scrollable content area */}
      <div className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden px-5 py-5 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: [0.34, 1.1, 0.64, 1] }}
        >
          {children}
          <div className="h-32 w-full shrink-0" />
        </motion.div>
      </div>

      {/* ── Floating Glass Navigation Bar ── */}
      {!isProfileIncomplete && !isKeyboardOpen && (
        <nav
          className="absolute z-50"
        style={{
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "calc(100% - 40px)",
        }}
      >
        <div
          className="relative flex items-center justify-between gap-1 px-2 py-2"
          style={{
            borderRadius: "32px",
            background: "rgba(255, 255, 255, 0.22)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            border: "1px solid var(--glass-bg-medium)",
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.08),
              0 2px 8px rgba(0, 0, 0, 0.04),
              inset 0 1px 0 var(--glass-bg-medium),
              inset 0 -1px 0 rgba(255, 255, 255, 0.10),
              inset 0 0 14px 4px rgba(255, 255, 255, 0.06)
            `,
          }}
        >
          {/* Top edge highlight */}
          <div
            className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none"
            style={{
              borderRadius: "32px 32px 0 0",
              background: "linear-gradient(90deg, transparent 10%, var(--glass-bg-elevated) 50%, transparent 90%)",
            }}
          />

          {tabs.map((tab) => {
            const active = pathname?.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 transition-transform active:scale-90"
              >
                {active && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0"
                    style={{
                      borderRadius: "26px",
                      background: "rgba(255, 255, 255, 0.35)",
                      backdropFilter: "blur(16px)",
                      WebkitBackdropFilter: "blur(16px)",
                      border: "1px solid rgba(255, 255, 255, 0.5)",
                      boxShadow: `
                        0 8px 24px rgba(0, 0, 0, 0.08),
                        inset 0 1px 1px rgba(255, 255, 255, 0.8),
                        inset 0 -1px 1px rgba(255, 255, 255, 0.2)
                      `,
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 38, mass: 0.7 }}
                  />
                )}
                <motion.div
                  animate={{
                    scale: active ? 1.15 : 1,
                    y: active ? -1 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="relative z-10"
                >
                  <Icon
                    size={20}
                    className="transition-colors duration-200"
                    style={{ color: active ? "var(--text-primary)" : "var(--text-muted)" }}
                  />
                </motion.div>
                <motion.span
                  animate={{
                    opacity: active ? 1 : 0.7,
                    scale: active ? 1 : 0.95,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="relative z-10 text-[10px] leading-none transition-colors duration-200"
                  style={{
                    color: active ? "var(--text-primary)" : "var(--text-muted)",
                    fontWeight: active ? 800 : 600,
                  }}
                >
                  {t(`nav.${tab.label.toLowerCase()}`)}
                </motion.span>
              </Link>
            );
          })}
        </div>
      </nav>
      )}
    </div>
  );
}
