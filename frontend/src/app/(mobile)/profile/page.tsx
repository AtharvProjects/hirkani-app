"use client";

import { useEffect, useState } from "react";
import { Baby, Salad, ShieldAlert, Edit3, Star, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { PregnancyTrackerWidget } from "@/components/PregnancyTrackerWidget";

import { GlassCard } from "@/components/GlassCard";
import { OnboardingProfile } from "@/components/OnboardingProfile";
import { PageTransition } from "@/components/mobile/PageTransition";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { getMobileState } from "@/components/mobile/auth";
import { api, PregnancyProfile } from "@/lib/api";

const trimesterLabel = (t: number) =>
  t === 1 ? "First Trimester" : t === 2 ? "Second Trimester" : "Third Trimester";

export default function ProfileScreen() {
  const [authed, setAuthed] = useState(() => {
    if (typeof window !== 'undefined') return !!localStorage.getItem('hk_profile');
    return false;
  });
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window !== 'undefined') return !localStorage.getItem('hk_profile');
    return true;
  });
  const [profile, setProfile] = useState<PregnancyProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('hk_profile');
      return cached ? JSON.parse(cached) : null;
    }
    return null;
  });
  const [isEditing, setIsEditing] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [deleteModal, setDeleteModal] = useState<number | null>(null);
  const [modalState, setModalState] = useState<{ title: string, message: string } | null>(null);

  async function loadFavorites() {
    try {
      const favs = await api.favorites();
      setFavorites((favs ?? []) as any[]);
    } catch (e) {
      console.error("Failed to load favorites", e);
    }
  }

  async function load() {
    try {
      const p = await api.getProfile();
      setProfile(p ?? null);
      if (p) {
        await loadFavorites();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDeleteFavorite(id: number) {
    setDeleteModal(null);
    try {
      await api.deleteFavorite(id);
      await loadFavorites();
    } catch (e) {
      setModalState({ title: "Error", message: "Failed to remove favorite: " + (e as Error).message });
    }
  }

  useEffect(() => {
    getMobileState().then(async (state) => {
      setAuthed(state.authed);
      if (state.authed) {
        // Only load if not cached or we just want to fetch in background (it will update state later)
        if (!profile) {
          await load();
        } else {
          loadFavorites(); // profile is already there, just load favorites
          // We can also fetch profile in background to update cache
          api.getProfile().then(p => { if (p) setProfile(p); }).catch(console.error);
        }
      }
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <PageTransition>
        <ScreenHeader title="My Profile" subtitle="Your pregnancy wellness dashboard" />
        <div className="h-10" />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <ScreenHeader title="My Profile" subtitle="Your pregnancy wellness dashboard" />

      {!authed ? (
        <GlassCard>
          <p className="text-[14px] font-semibold" style={{ color: "var(--text-secondary)" }}>
            Sign in from Home to access your profile 🌸
          </p>
        </GlassCard>
      ) : null}

      {authed && (!profile || isEditing) ? (
        <OnboardingProfile
          initialData={profile}
          onDone={() => {
            setIsEditing(false);
            load();
          }}
          onCancel={profile ? () => setIsEditing(false) : undefined}
        />
      ) : null}

      {authed && profile && !isEditing ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.34, 1.1, 0.64, 1] }}
          className="pb-6"
        >
          <PregnancyTrackerWidget
            pregnancyWeek={profile.pregnancy_week || 1}
            trimester={profile.trimester || 1}
            onEditProfile={() => setIsEditing(true)}
          />

          {/* Details */}
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
                    borderBottom: i === 0 ? "1px solid rgba(180,120,140,0.12)" : "none",
                  }}
                >
                  <span
                    className="flex items-center gap-2.5 text-[13px] font-semibold"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-full"
                      style={{ background: "rgba(244,88,122,0.10)" }}
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

          {/* Health Alerts */}
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
                style={{ borderTop: "1px solid rgba(180,120,140,0.12)", paddingTop: "16px" }}
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
                <div style={{ borderTop: "1px solid rgba(180,120,140,0.12)", paddingTop: "16px" }}>
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

          {/* Favorite Foods */}
          <GlassCard title="Favorite Foods 💖">
            {favorites.length > 0 ? (
              <div className="space-y-3">
                {favorites.map((fav) => (
                  <div
                    key={fav.id}
                    className="flex items-center justify-between py-2.5 last:pb-0"
                    style={{
                      borderBottom: "1px solid rgba(180,120,140,0.12)",
                    }}
                  >
                    <div>
                      <div className="text-[14px] font-bold" style={{ color: "var(--text-primary)" }}>
                        {fav.food_name}
                      </div>
                      <div className="text-[11px] font-semibold opacity-60 mt-0.5" style={{ color: "var(--text-secondary)" }}>
                        {fav.last_classification.replace(/_/g, " ")}
                      </div>
                    </div>
                    <button
                      onClick={() => setDeleteModal(fav.id)}
                      className="text-[12px] font-extrabold text-red-500 hover:text-red-600 transition-colors active:scale-95 px-3 py-1.5 rounded-full"
                      style={{ background: "rgba(239, 68, 68, 0.08)" }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] font-medium text-center py-2" style={{ color: "var(--text-muted)" }}>
                No favorite foods saved yet 🌸
              </p>
            )}
          </GlassCard>

          <button className="btn-primary h-[56px] w-full text-[16px] mt-4" onClick={() => setIsEditing(true)}>
            <Edit3 size={17} className="mr-2" />
            Edit Profile
          </button>
        </motion.div>
      ) : null}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm rounded-[24px] p-6 shadow-2xl glass-card" style={{ background: "rgba(255,255,255,0.95)" }}>
            <h3 className="text-[18px] font-black mb-2" style={{ color: "var(--text-primary)" }}>Remove Favorite?</h3>
            <p className="text-[14px] font-semibold mb-6 leading-relaxed" style={{ color: "var(--text-secondary)" }}>Are you sure you want to remove this item from your favorites?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteModal(null)} className="px-5 py-2.5 rounded-[16px] text-[14px] font-bold transition-all bg-gray-100 text-gray-600 active:scale-95">Cancel</button>
              <button onClick={() => handleDeleteFavorite(deleteModal)} className="px-5 py-2.5 rounded-[16px] text-[14px] font-bold transition-all text-white active:scale-95" style={{ background: "#EF4444" }}>Remove</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* General Modal */}
      {modalState && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm rounded-[24px] p-6 shadow-2xl glass-card" style={{ background: "rgba(255,255,255,0.95)" }}>
            <h3 className="text-[18px] font-black mb-2" style={{ color: "var(--text-primary)" }}>{modalState.title}</h3>
            <p className="text-[14px] font-semibold mb-6 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{modalState.message}</p>
            <div className="flex justify-end">
              <button onClick={() => setModalState(null)} className="px-5 py-2.5 rounded-[16px] text-[14px] font-bold transition-all text-white active:scale-95" style={{ background: "var(--pink-hot)" }}>OK</button>
            </div>
          </motion.div>
        </div>
      )}
    </PageTransition>
  );
}
