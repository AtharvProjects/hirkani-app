"use client";

import { useEffect, useState } from "react";
import { Baby, Salad, ShieldAlert, Edit3, Heart, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PregnancyTrackerWidget } from "@/components/PregnancyTrackerWidget";
import { Share } from '@capacitor/share';

import { GlassCard } from "@/components/GlassCard";
import { OnboardingProfile } from "@/components/OnboardingProfile";
import { PageTransition } from "@/components/mobile/PageTransition";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { getMobileState } from "@/components/mobile/auth";
import { api } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.34, 1.1, 0.64, 1] } },
};

export default function ProfileScreen() {
  const isAuthed = useAppStore(state => state.isAuthed);
  const profile = useAppStore(state => state.profile);
  const favorites = useAppStore(state => state.favorites);

  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteModal, setDeleteModal] = useState<number | null>(null);
  const [modalState, setModalState] = useState<{ title: string, message: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    // Background refresh
    getMobileState(true).then((state) => {
      if (state.authed) {
        useAppStore.getState().setAuthed(true);
        if (state.profileDone) {
          api.getProfile().catch(console.error);
          api.favorites().catch(console.error);
        }
      }
    });
  }, []);

  async function handleDeleteFavorite(id: number) {
    setDeleteModal(null);
    try {
      await api.deleteFavorite(id);
      await api.favorites(); // Refreshes Zustand
    } catch (e) {
      setModalState({ title: "Error", message: "Failed to remove favorite: " + (e as Error).message });
    }
  }

  const handleExportToDoctor = async () => {
    if (!profile) return;
    
    let text = `🌸 Hirkani Pregnancy Summary for ${profile.name || 'Mama'}\n\n`;
    text += `📅 Estimated Due Date (EDD): ${useAppStore.getState().dueDate || 'Not set'}\n`;
    text += `🤰 Current Stage: Week ${profile.pregnancy_week || 1} (Trimester ${profile.trimester || 1})\n`;
    text += `🥗 Diet: ${profile.diet_preference || 'General'}\n`;
    text += `⚠️ Allergies: ${profile.allergies?.length ? profile.allergies.join(', ') : 'None'}\n`;
    text += `🏥 Conditions: ${profile.medical_conditions?.length ? profile.medical_conditions.join(', ') : 'None'}\n`;
    if (profile.doctor_restrictions) text += `🛑 Restrictions: ${profile.doctor_restrictions}\n`;
    
    if (favorites.length > 0) {
      text += `\n💖 Top Favorite Foods:\n`;
      favorites.slice(0, 10).forEach(f => {
        text += `- ${f.food_name} (${f.last_classification.replace(/_/g, " ")})\n`;
      });
    }

    try {
      if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform()) {
        await Share.share({
          title: 'My Pregnancy Summary',
          text: text,
          dialogTitle: 'Share with Doctor',
        });
      } else if (navigator.share) {
        await navigator.share({ title: 'Pregnancy Summary', text: text });
      } else {
        alert("Sharing not supported on this browser.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!mounted) {
    return (
      <PageTransition>
        <ScreenHeader title="My Profile" subtitle="Your pregnancy wellness dashboard" />
        <div className="h-10" />
      </PageTransition>
    );
  }

  return (
    <>
      <PageTransition>
        <ScreenHeader title="My Profile" subtitle="Your pregnancy wellness dashboard" />

        {!isAuthed ? (
          <GlassCard>
            <p className="text-[14px] font-semibold" style={{ color: "var(--text-secondary)" }}>
              Sign in from Home to access your profile 🌸
            </p>
          </GlassCard>
        ) : null}

        {isAuthed && (!profile || isEditing) ? (
          <OnboardingProfile
            initialData={profile}
            onDone={() => {
              setIsEditing(false);
              api.getProfile().catch(console.error);
            }}
            onCancel={profile ? () => setIsEditing(false) : undefined}
          />
        ) : null}

        {isAuthed && profile && !isEditing ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="pb-6 space-y-4"
          >
            <motion.div variants={staggerItem}>
              <PregnancyTrackerWidget
                pregnancyWeek={profile.pregnancy_week || 1}
                trimester={profile.trimester || 1}
                onEditProfile={() => setIsEditing(true)}
              />
            </motion.div>

            {/* Details */}
            <motion.div variants={staggerItem}>
              <GlassCard title="Details">
                <div className="space-y-0">
                  {[
                    { icon: Baby, label: "Age", value: `${profile.age || ""} years` },
                    { icon: Salad, label: "Diet", value: profile.diet_preference || "" },
                  ].map(({ icon: Icon, label, value }, i) => (
                    <div
                      key={label}
                      className="flex items-center justify-between py-3.5"
                      style={{
                        borderBottom: i === 0 ? "1px solid rgba(180,120,140,0.10)" : "none",
                      }}
                    >
                      <span
                        className="flex items-center gap-2.5 text-[13px] font-bold"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-full"
                          style={{ background: "rgba(244,88,122,0.10)", border: "1px solid rgba(244,88,122,0.15)" }}
                        >
                          <Icon size={13} style={{ color: "var(--pink-hot)" }} />
                        </div>
                        {label}
                      </span>
                      <span className="text-[14px] font-extrabold" style={{ color: "var(--text-primary)" }}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Health Alerts */}
            <motion.div variants={staggerItem}>
              <GlassCard title="Health Alerts">
                <div className="space-y-4">
                  <div>
                    <div
                      className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider mb-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <ShieldAlert size={13} style={{ color: "var(--pink-hot)" }} />
                      Conditions
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.medical_conditions?.length ? (
                        profile.medical_conditions.map((c) => (
                          <span
                            key={c}
                            className="rounded-full px-3 py-1 text-[12px] font-extrabold"
                            style={{
                              background: "rgba(254,202,202,0.60)",
                              backdropFilter: "blur(8px)",
                              color: "#7F1D1D",
                              border: "1px solid rgba(239,68,68,0.20)",
                            }}
                          >
                            {c}
                          </span>
                        ))
                      ) : (
                        <span className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>
                          None 🎉
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    style={{ borderTop: "1px solid rgba(180,120,140,0.10)", paddingTop: "16px" }}
                  >
                    <div
                      className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider mb-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <Heart size={13} style={{ color: "var(--pink-hot)" }} />
                      Allergies
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.allergies?.length ? (
                        profile.allergies.map((a) => (
                          <span
                            key={a}
                            className="rounded-full px-3 py-1 text-[12px] font-extrabold"
                            style={{
                              background: "rgba(254,243,199,0.70)",
                              backdropFilter: "blur(8px)",
                              color: "#78350F",
                              border: "1px solid rgba(245,158,11,0.20)",
                            }}
                          >
                            {a}
                          </span>
                        ))
                      ) : (
                        <span className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>
                          None 🎉
                        </span>
                      )}
                    </div>
                  </div>

                  {profile.doctor_restrictions && (
                    <div style={{ borderTop: "1px solid rgba(180,120,140,0.10)", paddingTop: "16px" }}>
                      <span
                        className="block text-[11px] font-extrabold uppercase tracking-wider mb-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Doctor Restrictions
                      </span>
                      <span className="text-[14px] font-bold" style={{ color: "var(--text-primary)" }}>
                        {profile.doctor_restrictions}
                      </span>
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>

            {/* Favorite Foods */}
            <motion.div variants={staggerItem}>
              <GlassCard title="Favorite Foods 💖">
                {favorites.length > 0 ? (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {favorites.map((fav) => (
                        <motion.div
                          key={fav.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10, transition: { duration: 0.2 } }}
                          className="flex items-center justify-between py-2.5 last:pb-0"
                          style={{ borderBottom: "1px solid rgba(180,120,140,0.10)" }}
                        >
                          <div>
                            <div className="text-[14px] font-bold" style={{ color: "var(--text-primary)" }}>
                              {fav.food_name}
                            </div>
                            <div className="text-[11px] font-semibold mt-0.5" style={{ color: "var(--text-muted)" }}>
                              {fav.last_classification.replace(/_/g, " ")}
                            </div>
                          </div>
                          <button
                            onClick={() => setDeleteModal(fav.id)}
                            className="text-[12px] font-extrabold text-red-500 hover:text-red-600 transition-colors active:scale-95 px-3 py-1.5 rounded-full"
                            style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239,68,68,0.15)" }}
                          >
                            Remove
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <p className="text-[13px] font-medium text-center py-2" style={{ color: "var(--text-muted)" }}>
                    No favorite foods saved yet 🌸
                  </p>
                )}
              </GlassCard>
            </motion.div>

            <motion.div variants={staggerItem} className="flex gap-2">
              <button className="btn-ghost h-[56px] flex-1 px-1 text-[13.5px] whitespace-nowrap" onClick={() => setIsEditing(true)}>
                <Edit3 size={16} className="mr-1.5" />
                Edit Profile
              </button>
              <button 
                className="btn-primary h-[56px] flex-1 px-1 text-[13.5px] whitespace-nowrap" 
                onClick={handleExportToDoctor}
                style={{ background: "rgba(14, 165, 233, 0.9)", boxShadow: "0 8px 24px rgba(14, 165, 233, 0.25)" }}
              >
                <Share2 size={16} className="mr-1.5" />
                Share w/ Doctor
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </PageTransition>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
               style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-[28px] p-6 shadow-2xl glass-card-premium"
            >
              <h3 className="text-[18px] font-black font-display mb-2" style={{ color: "var(--text-primary)" }}>Remove Favorite?</h3>
              <p className="text-[14px] font-medium mb-6 leading-relaxed" style={{ color: "var(--text-secondary)" }}>Are you sure you want to remove this item from your favorites?</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteModal(null)}
                  className="px-5 py-2.5 rounded-[18px] text-[14px] font-bold transition-all active:scale-[0.97]"
                  style={{ background: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.50)", color: "var(--text-primary)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteFavorite(deleteModal)}
                  className="px-5 py-2.5 rounded-[18px] text-[14px] font-bold transition-all text-white active:scale-[0.97]"
                  style={{ background: "linear-gradient(135deg, #EF4444, #FCA5A5)", boxShadow: "0 4px 12px rgba(239,68,68,0.25)" }}
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* General Modal */}
      <AnimatePresence>
        {modalState && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
               style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-[28px] p-6 shadow-2xl glass-card-premium"
            >
              <h3 className="text-[18px] font-black font-display mb-2" style={{ color: "var(--text-primary)" }}>{modalState.title}</h3>
              <p className="text-[14px] font-medium mb-6 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{modalState.message}</p>
              <div className="flex justify-end">
                <button onClick={() => setModalState(null)} className="btn-primary px-6 py-2.5 h-auto text-[14px]">OK</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
