"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Shield, Smartphone, LogOut, Lock, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

import { GlassCard } from "@/components/GlassCard";
import { PageTransition } from "@/components/mobile/PageTransition";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";

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
      className="flex items-center justify-between rounded-[20px] p-4 cursor-pointer transition-colors active:bg-white/10"
      style={{ background: "rgba(255,255,255,0.45)", border: "1.5px solid rgba(255,255,255,0.65)" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full shrink-0"
          style={{ background: "rgba(244,88,122,0.10)", border: "1px solid rgba(244,88,122,0.18)" }}
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
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: [0.34, 1.1, 0.64, 1] }}
        className="pb-6 space-y-4"
      >
        {/* Notifications */}
        <GlassCard title="Notifications">
          <SettingRow
            icon={Bell}
            label="Daily Nutrition Tips"
            sublabel="Get personalized pregnancy tips every morning"
            checked={tips}
            onChange={handleTipsChange}
          />
        </GlassCard>

        {/* Experience */}
        <GlassCard title="Experience">
          <SettingRow
            icon={Smartphone}
            label="Haptic Feedback"
            sublabel="iOS-style touch responses"
            checked={haptics}
            onChange={handleHapticsChange}
          />
        </GlassCard>


        {/* Privacy */}
        <GlassCard title="Privacy & Security">
          <div
            className="rounded-[20px] p-4"
            style={{ background: "rgba(255,255,255,0.45)", border: "1.5px solid rgba(255,255,255,0.65)" }}
          >
            <div className="flex items-start gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.22)" }}
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
            style={{ background: "rgba(244,88,122,0.06)", border: "1px solid rgba(244,88,122,0.14)" }}
          >
            <p className="text-[11px] font-semibold leading-relaxed uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Disclaimer: This app provides guidance only and does not replace professional medical advice. Always consult your healthcare provider.
            </p>
          </div>
        </GlassCard>

        {/* About */}
        <GlassCard title="About">
          <div
            className="rounded-[20px] px-4 py-3.5 flex items-center justify-between"
            style={{ background: "rgba(255,255,255,0.45)", border: "1.5px solid rgba(255,255,255,0.65)" }}
          >
            <div>
              <div className="text-[14px] font-extrabold" style={{ color: "var(--text-primary)" }}>Hirkani</div>
              <div className="text-[12px] font-semibold" style={{ color: "var(--text-muted)" }}>
                Pregnancy Food Safety App · v1.0
              </div>
            </div>
            <div className="text-[24px]">🌸</div>
          </div>
        </GlassCard>

        {/* Logout */}
        <button
          className="w-full h-[56px] rounded-[28px] text-[15px] font-extrabold flex items-center justify-center gap-2 transition-transform active:scale-95"
          style={{
            background: "rgba(254,202,202,0.60)",
            border: "1.5px solid rgba(239,68,68,0.25)",
            color: "#DC2626",
            backdropFilter: "blur(16px)",
          }}
          onClick={() => {
            localStorage.removeItem("hirkani_token");
            router.push("/home");
            router.refresh();
          }}
        >
          <LogOut size={18} />
          Log Out
        </button>
      </motion.div>
    </PageTransition>
  );
}
