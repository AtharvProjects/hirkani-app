"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Shield, Smartphone, LogOut, Lock, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

import { GlassCard } from "@/components/GlassCard";
import { PageTransition } from "@/components/mobile/PageTransition";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { useAppStore } from "@/store/useAppStore";

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.34, 1.1, 0.64, 1] } },
};

export default function SettingsScreen() {
  const router = useRouter();
  const [tips, setTips] = useState(true);
  const [haptics, setHaptics] = useState(true);

  useEffect(() => {
    const savedTips = localStorage.getItem("hk_setting_tips");
    if (savedTips !== null) setTips(savedTips === "true");
    const savedHaptics = localStorage.getItem("hk_setting_haptics");
    if (savedHaptics !== null) setHaptics(savedHaptics === "true");
  }, []);

  const handleTipsChange = (v: boolean) => {
    setTips(v);
    localStorage.setItem("hk_setting_tips", v.toString());
  };

  const handleHapticsChange = (v: boolean) => {
    setHaptics(v);
    localStorage.setItem("hk_setting_haptics", v.toString());
  };

  const SettingRow = ({
    icon: Icon,
    label,
    sublabel,
    checked,
    onChange,
    iconColor = "var(--pink-hot)",
  }: {
    icon: any;
    label: string;
    sublabel?: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    iconColor?: string;
  }) => (
    <label
      className="flex items-center justify-between rounded-[20px] p-4 cursor-pointer transition-all active:scale-[0.99]"
      style={{
        background: "rgba(255,255,255,0.30)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.40)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full shrink-0"
          style={{
            background: "rgba(244,88,122,0.08)",
            border: "1px solid rgba(244,88,122,0.15)",
            backdropFilter: "blur(8px)",
          }}
        >
          <Icon size={17} style={{ color: iconColor }} />
        </div>
        <div>
          <div className="text-[14px] font-extrabold" style={{ color: "var(--text-primary)" }}>
            {label}
          </div>
          {sublabel && (
            <div className="text-[11px] font-semibold mt-0.5" style={{ color: "var(--text-muted)" }}>
              {sublabel}
            </div>
          )}
        </div>
      </div>
      {/* Toggle */}
      <label className="hk-toggle">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="hk-toggle-slider" />
      </label>
    </label>
  );

  return (
    <PageTransition>
      <ScreenHeader title="Settings" subtitle="Preferences & privacy" />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="pb-6 space-y-4"
      >
        {/* Notifications */}
        <motion.div variants={staggerItem}>
          <GlassCard title="Notifications">
            <SettingRow
              icon={Bell}
              label="Daily Nutrition Tips"
              sublabel="Get personalized pregnancy tips every morning"
              checked={tips}
              onChange={handleTipsChange}
            />
          </GlassCard>
        </motion.div>

        {/* Experience */}
        <motion.div variants={staggerItem}>
          <GlassCard title="Experience">
            <SettingRow
              icon={Smartphone}
              label="Haptic Feedback"
              sublabel="Touch responses on interactions"
              checked={haptics}
              onChange={handleHapticsChange}
            />
          </GlassCard>
        </motion.div>

        {/* Privacy */}
        <motion.div variants={staggerItem}>
          <GlassCard title="Privacy & Security">
            <div
              className="rounded-[20px] p-4"
              style={{
                background: "rgba(255,255,255,0.30)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.40)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)",
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.18)", backdropFilter: "blur(8px)" }}
                >
                  <Lock size={16} style={{ color: "#059669" }} />
                </div>
                <div>
                  <div className="text-[14px] font-extrabold mb-0.5" style={{ color: "var(--text-primary)" }}>
                    End-to-End Encrypted
                  </div>
                  <div className="text-[12px] font-semibold leading-snug" style={{ color: "var(--text-secondary)" }}>
                    Sensitive profile data is encrypted at rest on our secure servers.
                  </div>
                </div>
              </div>
            </div>

            <div
              className="mt-3 rounded-[18px] p-4"
              style={{
                background: "rgba(244,88,122,0.05)",
                border: "1px solid rgba(244,88,122,0.12)",
                backdropFilter: "blur(8px)",
              }}
            >
              <p className="text-[11px] font-semibold leading-relaxed uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Disclaimer: This app provides guidance only and does not replace professional medical advice. Always consult your healthcare provider.
              </p>
            </div>
          </GlassCard>
        </motion.div>

        {/* About */}
        <motion.div variants={staggerItem}>
          <GlassCard title="About">
            <div
              className="rounded-[20px] px-4 py-3.5 flex items-center justify-between"
              style={{
                background: "rgba(255,255,255,0.30)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.40)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)",
              }}
            >
              <div>
                <div className="text-[14px] font-extrabold font-display" style={{ color: "var(--text-primary)" }}>Hirkani</div>
                <div className="text-[12px] font-semibold" style={{ color: "var(--text-muted)" }}>
                  Pregnancy Food Safety App · v1.0
                </div>
              </div>
              <div className="text-[24px]">🌸</div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Logout */}
        <motion.div variants={staggerItem}>
          <button
            className="w-full h-[56px] rounded-[28px] text-[15px] font-extrabold flex items-center justify-center gap-2 transition-transform active:scale-[0.97]"
            style={{
              background: "rgba(254,202,202,0.35)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(239,68,68,0.20)",
              color: "#DC2626",
              boxShadow: "0 4px 16px rgba(239,68,68,0.08), inset 0 1px 0 rgba(255,255,255,0.30)",
            }}
            onClick={() => {
              localStorage.removeItem("hirkani_token");
              useAppStore.getState().clearState();
              router.push("/home");
              router.refresh();
            }}
          >
            <LogOut size={18} />
            Log Out
          </button>
        </motion.div>
      </motion.div>
    </PageTransition>
  );
}
