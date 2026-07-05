"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, X, Baby, Activity, Ruler, Heart } from "lucide-react";
import { Portal } from "@/components/Portal";

// Pregnancy milestone data by trimester
const MILESTONES: Record<number, { size: string; development: string; tip: string }> = {
  4: { size: "Poppy seed", development: "Heart begins to form", tip: "Start taking folic acid daily" },
  5: { size: "Sesame seed", development: "Brain and spinal cord forming", tip: "Avoid raw foods and deli meats" },
  6: { size: "Lentil", development: "Heart starts beating", tip: "Stay hydrated with 8+ glasses of water" },
  7: { size: "Blueberry", development: "Arms and legs developing", tip: "Include iron-rich foods like spinach" },
  8: { size: "Raspberry", development: "Fingers and toes forming", tip: "Get plenty of rest" },
  9: { size: "Cherry", development: "Baby can make tiny movements", tip: "Eat small, frequent meals for nausea" },
  10: { size: "Strawberry", development: "All vital organs formed", tip: "Continue prenatal vitamins" },
  11: { size: "Fig", development: "Baby can open and close fists", tip: "Start gentle exercise routines" },
  12: { size: "Lime", development: "Reflexes are developing", tip: "First trimester screening time" },
  13: { size: "Peach", development: "Vocal cords forming", tip: "You may start feeling more energetic" },
  14: { size: "Lemon", development: "Baby can squint and frown", tip: "Start sleeping on your side" },
  15: { size: "Apple", development: "Bones hardening", tip: "Increase calcium intake" },
  16: { size: "Avocado", development: "Baby can hear sounds", tip: "Talk and sing to your baby" },
  17: { size: "Pear", development: "Fat layer forming under skin", tip: "Watch for round ligament pain" },
  18: { size: "Bell pepper", development: "Baby may start sucking thumb", tip: "Anatomy scan week!" },
  19: { size: "Mango", development: "Sensory brain areas developing", tip: "You might feel first kicks" },
  20: { size: "Banana", development: "Halfway there! Baby swallows amniotic fluid", tip: "Celebrate your halfway milestone" },
  21: { size: "Carrot", development: "Eyebrows and eyelids formed", tip: "Stay active with prenatal yoga" },
  22: { size: "Papaya", development: "Grip is getting stronger", tip: "Eat omega-3 rich foods" },
  23: { size: "Grapefruit", development: "Baby responds to sound", tip: "Start thinking about birth plan" },
  24: { size: "Corn on the cob", development: "Lungs developing branches", tip: "Glucose screening test time" },
  25: { size: "Cauliflower", development: "Baby can sense light", tip: "Practice relaxation breathing" },
  26: { size: "Lettuce head", development: "Eyes begin to open", tip: "Start monitoring kick counts" },
  27: { size: "Broccoli", development: "Baby can dream (REM sleep!)", tip: "Third trimester begins soon!" },
  28: { size: "Eggplant", development: "Baby can blink", tip: "Start planning your nursery" },
  29: { size: "Butternut squash", development: "Bones are fully developed", tip: "Extra rest is important now" },
  30: { size: "Cabbage", development: "Baby's brain growing rapidly", tip: "Keep protein intake high" },
  31: { size: "Coconut", development: "All five senses are working", tip: "Start packing hospital bag" },
  32: { size: "Jicama", development: "Toenails are visible", tip: "Practice labor positions" },
  33: { size: "Pineapple", development: "Bones hardening (except skull)", tip: "Stay well-hydrated" },
  34: { size: "Cantaloupe", development: "Lungs nearly mature", tip: "Rest with feet elevated" },
  35: { size: "Honeydew melon", development: "Kidneys fully developed", tip: "Watch for signs of preeclampsia" },
  36: { size: "Romaine lettuce", development: "Baby dropping into pelvis", tip: "Finalize your birth plan" },
  37: { size: "Swiss chard bunch", development: "Baby is considered early term", tip: "Know the signs of labor" },
  38: { size: "Leek", development: "Organ systems all functional", tip: "Get as much sleep as possible" },
  39: { size: "Watermelon", development: "Brain still rapidly developing", tip: "Relax and wait for labor signs" },
  40: { size: "Small pumpkin", development: "Baby is fully developed! 🎉", tip: "Your baby could arrive any day!" },
};

function getMilestone(week: number) {
  if (week < 4) return { size: "Tiny seed", development: "Implantation happening", tip: "Start prenatal vitamins right away" };
  if (week > 40) return MILESTONES[40];
  return MILESTONES[week] || MILESTONES[Math.min(week, 40)];
}

function getBabyStage(week: number): { image: string; sizePx: number; label: string } {
  if (week <= 12) return { image: "/baby-stage1.png", sizePx: 120, label: "Embryo" };
  if (week <= 24) return { image: "/baby-stage2.png", sizePx: 160, label: "Fetus" };
  if (week <= 34) return { image: "/baby-stage3.png", sizePx: 200, label: "Baby" };
  return { image: "/baby-stage4.png", sizePx: 220, label: "Full Term" };
}

interface Props {
  pregnancyWeek?: number;
  trimester?: number;
  onEditProfile?: () => void;
}

export function PregnancyTrackerWidget({ pregnancyWeek = 1, trimester = 1, onEditProfile }: Props) {
  const [showDetails, setShowDetails] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  const displayWeek = Math.max(1, Math.min(42, pregnancyWeek + weekOffset));
  const milestone = getMilestone(displayWeek);
  const displayTrimester = displayWeek <= 13 ? 1 : displayWeek <= 26 ? 2 : 3;
  const progressPercent = Math.min((displayWeek / 40) * 100, 100);
  const daysRemaining = Math.max(0, (40 - displayWeek) * 7);
  const babyStage = getBabyStage(displayWeek);

  const calendarDays = useMemo(() => {
    const today = new Date();
    const list = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      list.push({
        offset: i,
        date: d.getDate(),
        dayLabel: d.toLocaleString("default", { weekday: "short" }),
        isToday: i === 0,
      });
    }
    return list;
  }, []);

  const trimesterColor = displayTrimester === 1 ? "#10B981" : displayTrimester === 2 ? "#F59E0B" : "#F4587A";
  const trimesterLabel = displayTrimester === 1 ? "1st Trimester" : displayTrimester === 2 ? "2nd Trimester" : "3rd Trimester";

  return (
    <>
      <div className="glass-card-premium w-full mb-5" style={{ padding: 0 }}>
        {/* Animated aura blobs behind the baby */}
        <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full opacity-25 pointer-events-none animate-pulse-glow"
          style={{ background: "radial-gradient(circle, var(--pink-hot), transparent)", filter: "blur(20px)" }} />
        <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full opacity-20 pointer-events-none animate-float"
          style={{ background: "radial-gradient(circle, var(--peach), transparent)", filter: "blur(20px)" }} />

        <div className="flex items-center justify-between px-5 pt-5 pb-3 relative z-10">
          <button
            onClick={() => setWeekOffset(o => Math.max(o - 1, -(pregnancyWeek - 1)))}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-transform active:scale-[0.85]"
            style={{ background: "rgba(244,88,122,0.10)", border: "1px solid rgba(244,88,122,0.20)", backdropFilter: "blur(8px)" }}
          >
            <ChevronLeft size={16} style={{ color: "var(--pink-hot)" }} />
          </button>

          <div className="text-center">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.22em]" style={{ color: "var(--text-muted)" }}>
              {trimesterLabel}
            </div>
            <div className="text-[22px] font-black tracking-tight font-display" style={{ color: "var(--text-primary)" }}>
              Week {displayWeek}
            </div>
          </div>

          <button
            onClick={() => setWeekOffset(o => Math.min(o + 1, 42 - pregnancyWeek))}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-transform active:scale-[0.85]"
            style={{ background: "rgba(244,88,122,0.10)", border: "1px solid rgba(244,88,122,0.20)", backdropFilter: "blur(8px)" }}
          >
            <ChevronRight size={16} style={{ color: "var(--pink-hot)" }} />
          </button>
        </div>

        <div className="flex items-center justify-between px-4 pb-3 relative z-10">
          {calendarDays.map((day) => (
            <div key={day.offset} className="flex flex-col items-center gap-1">
              <span className={`text-[9px] font-extrabold uppercase tracking-wider transition-colors duration-300 ${day.isToday ? 'text-[var(--pink-hot)]' : ''}`}
                style={{ color: day.isToday ? undefined : "var(--text-muted)" }}>
                {day.dayLabel}
              </span>
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold transition-all duration-300 ${
                  day.isToday ? 'shadow-md scale-110' : ''
                }`}
                style={day.isToday ? {
                  background: "linear-gradient(135deg, var(--pink-hot), var(--coral))",
                  color: "#fff",
                  fontWeight: 900,
                  boxShadow: "0 4px 12px rgba(244,88,122,0.35)",
                } : {
                  color: "var(--text-secondary)",
                }}
              >
                {day.date}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center px-5 pt-2 pb-5 relative z-10">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.25em] mb-2"
            style={{ color: trimesterColor }}>
            {babyStage.label}
          </div>

          <motion.div
            key={babyStage.image}
            initial={{ scale: 0.85, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative mb-3 flex items-center justify-center"
            style={{ width: `${babyStage.sizePx}px`, height: `${babyStage.sizePx}px` }}
          >
            <div className="absolute inset-[-20px] rounded-full"
              style={{ background: `radial-gradient(circle, rgba(255,200,210,0.40), transparent 70%)` }} />
            <img
              src={babyStage.image}
              alt={`Baby at week ${displayWeek}`}
              className="w-full h-full object-contain drop-shadow-2xl relative z-10"
              style={{
                WebkitMaskImage: "radial-gradient(circle at center, black 45%, transparent 75%)",
                maskImage: "radial-gradient(circle at center, black 45%, transparent 75%)",
              }}
            />
          </motion.div>

          <h2 className="text-[24px] font-black tracking-tight mb-1 font-display" style={{ color: "var(--text-primary)" }}>
            {displayWeek} weeks
          </h2>
          <p className="text-[14px] font-bold mb-4" style={{ color: "var(--text-secondary)" }}>
            Baby is the size of a <span style={{ color: "var(--pink-hot)", fontWeight: 900 }}>{milestone.size}</span>
          </p>

          <div className="w-full mb-5">
            <div className="flex justify-between text-[10px] font-extrabold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
              <span>Week 1</span>
              <span>{daysRemaining > 0 ? `${daysRemaining} days to go` : "Due any day! 🎉"}</span>
              <span>Week 40</span>
            </div>
            <div className="h-2.5 w-full rounded-full overflow-hidden relative" style={{ background: "rgba(255,255,255,0.40)", border: "1px solid rgba(255,255,255,0.60)", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)" }}>
              <motion.div
                className="absolute left-0 top-0 bottom-0 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1.2, ease: [0.34, 1.1, 0.64, 1] }}
                style={{
                  background: "linear-gradient(90deg, var(--pink-hot), var(--coral))",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.30)",
                }}
              />
            </div>
          </div>

          <button
            onClick={() => setShowDetails(true)}
            className="btn-ghost w-full h-[52px] text-[15px]"
          >
            <Calendar size={17} className="mr-2" />
            View Pregnancy Details
          </button>
        </div>
      </div>

      <Portal>
        <AnimatePresence>
          {showDetails && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100] flex items-end justify-center" 
              style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", willChange: "opacity" }}
            >
              <div
                className="absolute inset-0"
                onClick={() => setShowDetails(false)}
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 240 }}
                className="relative w-full max-w-[440px] rounded-t-[32px] p-6 pb-6 border-t border-white/40 shadow-2xl flex flex-col max-h-[85vh]"
                style={{ background: "rgba(255, 255, 255, 0.75)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", willChange: "transform" }}
              >
                <div className="w-12 h-1 bg-black/10 rounded-full mx-auto mb-4 shrink-0" />
                <button
                  onClick={() => setShowDetails(false)}
                  className="absolute top-6 right-5 h-9 w-9 rounded-full flex items-center justify-center transition-transform active:scale-90"
                  style={{ background: "rgba(255,255,255,0.50)", border: "1px solid rgba(255,255,255,0.60)", backdropFilter: "blur(8px)" }}
                >
                  <X size={16} style={{ color: "var(--text-secondary)" }} />
                </button>

                <h3 className="text-[22px] font-black mb-1 font-display" style={{ color: "var(--text-primary)" }}>
                  Week {displayWeek} Details
                </h3>
                <p className="text-[12px] font-extrabold mb-5 uppercase tracking-wider" style={{ color: trimesterColor }}>
                  {trimesterLabel} · {daysRemaining > 0 ? `${daysRemaining} days remaining` : "Due any day!"}
                </p>

                <div className="flex-1 overflow-y-auto space-y-3.5 scrollbar-hide">
                  <div className="rounded-[24px] p-5" style={{ background: "rgba(255,255,255,0.60)", border: "1px solid rgba(255,255,255,0.70)", boxShadow: "0 4px 16px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.60)" }}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full shrink-0"
                        style={{ background: "rgba(244,88,122,0.12)" }}>
                        <Ruler size={18} style={{ color: "var(--pink-hot)" }} />
                      </div>
                      <div>
                        <div className="text-[11px] font-extrabold uppercase tracking-wider mb-0.5" style={{ color: "var(--text-muted)" }}>Baby Size</div>
                        <div className="text-[16px] font-black" style={{ color: "var(--text-primary)" }}>{milestone.size}</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[24px] p-5" style={{ background: "rgba(255,255,255,0.60)", border: "1px solid rgba(255,255,255,0.70)", boxShadow: "0 4px 16px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.60)" }}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full shrink-0"
                        style={{ background: "rgba(16,185,129,0.12)" }}>
                        <Baby size={18} style={{ color: "#10B981" }} />
                      </div>
                      <div>
                        <div className="text-[11px] font-extrabold uppercase tracking-wider mb-0.5" style={{ color: "var(--text-muted)" }}>Development</div>
                        <div className="text-[14px] font-bold" style={{ color: "var(--text-primary)" }}>{milestone.development}</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[24px] p-5" style={{ background: "rgba(255,255,255,0.60)", border: "1px solid rgba(255,255,255,0.70)", boxShadow: "0 4px 16px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.60)" }}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full shrink-0"
                        style={{ background: "rgba(245,158,11,0.12)" }}>
                        <Heart size={18} style={{ color: "#F59E0B" }} />
                      </div>
                      <div>
                        <div className="text-[11px] font-extrabold uppercase tracking-wider mb-0.5" style={{ color: "var(--text-muted)" }}>Tip for This Week</div>
                        <div className="text-[14px] font-bold" style={{ color: "var(--text-primary)" }}>{milestone.tip}</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[24px] p-5" style={{ background: "rgba(244,88,122,0.04)", border: "1px solid rgba(244,88,122,0.10)" }}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full shrink-0"
                        style={{ background: "rgba(244,88,122,0.10)" }}>
                        <Activity size={18} style={{ color: "var(--pink-hot)" }} />
                      </div>
                      <div>
                        <div className="text-[11px] font-extrabold uppercase tracking-wider mb-0.5" style={{ color: "var(--text-muted)" }}>Progress</div>
                        <div className="text-[15px] font-black" style={{ color: "var(--text-primary)" }}>{Math.round(progressPercent)}% complete</div>
                      </div>
                    </div>
                    <div className="h-2.5 w-full rounded-full overflow-hidden relative" style={{ background: "rgba(255,255,255,0.50)", border: "1px solid rgba(255,255,255,0.60)" }}>
                      <div className="absolute left-0 top-0 bottom-0 rounded-full" style={{
                        width: `${progressPercent}%`,
                        background: "linear-gradient(90deg, var(--pink-hot), var(--coral))",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.30)",
                      }} />
                    </div>
                    <div className="flex justify-between mt-2.5 mb-1 text-[10px] font-extrabold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                      <span>Conception</span>
                      <span>Due Date</span>
                    </div>
                  </div>
                  <div className="h-24 w-full shrink-0" />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}
