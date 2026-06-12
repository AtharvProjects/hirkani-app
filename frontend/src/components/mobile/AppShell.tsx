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

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div
      className="mobile-shell relative"
      style={{ margin: "0 auto", display: "flex", flexDirection: "column", height: "100dvh" }}
    >
      {/* Layered gradient background (removed to allow glass3d global style to show through) */}

      {/* Scrollable content area */}
      <div className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden px-5 py-5 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: [0.34, 1.1, 0.64, 1] }}
        >
          {children}
          <div className="h-28 w-full shrink-0" />
        </motion.div>
      </div>

      {/* ── Floating Navigation Bar ── */}
      <nav
        className="absolute bottom-5 left-1/2 z-50 -translate-x-1/2"
        style={{ width: "calc(100% - 32px)" }}
      >
        <div
          className="glass-card-strong relative flex items-center justify-between gap-1 rounded-[36px] px-2 py-2"
        >
          {tabs.map((tab) => {
            const active = pathname?.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-transform active:scale-90"
              >
                {active && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-[28px]"
                    style={{
                      background: "linear-gradient(135deg, #F4587A 0%, #FF7961 100%)",
                      boxShadow: "0 6px 20px rgba(244, 88, 122, 0.50)",
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 38, mass: 0.7 }}
                  />
                )}
                <Icon
                  size={20}
                  className="relative z-10 transition-colors duration-200"
                  style={{ color: active ? "#fff" : "var(--text-muted)" }}
                />
                <span
                  className="relative z-10 text-[10px] leading-none transition-colors duration-200"
                  style={{
                    color: active ? "#fff" : "var(--text-muted)",
                    fontWeight: active ? 800 : 600,
                  }}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
