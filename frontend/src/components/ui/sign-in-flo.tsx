"use client";

import React, { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { GoogleSignIn } from "@/components/GoogleSignIn";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface FormFieldProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
  showToggle?: boolean;
  onToggle?: () => void;
  showPassword?: boolean;
}

const AnimatedFormField: React.FC<FormFieldProps> = ({
  type,
  placeholder,
  value,
  onChange,
  icon,
  showToggle,
  onToggle,
  showPassword
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative group">
      <div
        className="relative overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          borderRadius: "18px",
          background: isFocused ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.45)",
          backdropFilter: "blur(12px)",
          border: `1.5px solid ${isFocused ? "rgba(244,88,122,0.45)" : "rgba(255,255,255,0.50)"}`,
          boxShadow: isFocused
            ? "0 4px 16px rgba(244,88,122,0.08), inset 0 1px 2px rgba(255,255,255,0.30)"
            : "0 2px 12px rgba(0,0,0,0.03), inset 0 1px 2px rgba(255,255,255,0.30)",
        }}
      >
        <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200" style={{ color: isFocused ? "var(--pink-hot)" : "var(--text-muted)" }}>
          {icon}
        </div>
        
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full bg-transparent pl-12 pr-12 py-4 font-semibold text-[15px] focus:outline-none"
          style={{ color: "var(--text-primary)" }}
          placeholder=""
        />
        
        <label className={`absolute left-12 transition-all duration-200 ease-in-out pointer-events-none ${
          isFocused || value 
            ? 'top-2 text-[10px] font-extrabold uppercase tracking-wider' 
            : 'top-1/2 -translate-y-1/2 text-[15px] font-semibold'
        }`} style={{ color: isFocused || value ? "var(--pink-hot)" : "var(--text-muted)" }}>
          {placeholder}
        </label>

        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

export const Component: React.FC<{ initialIsSignUp?: boolean; onSuccess?: () => void }> = ({ initialIsSignUp = false, onSuccess }) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) {
      setErrorMsg("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      if (isSignUp) {
        await api.signup({ name, email, password });
      } else {
        await api.login({ email, password });
      }
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/home");
      }
    } catch (e) {
      setErrorMsg((e as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setEmail("");
    setPassword("");
    setName("");
    setShowPassword(false);
    setErrorMsg("");
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-5 relative overflow-hidden bg-transparent">
      
      {/* ── Premium Aurora Animated Background ── */}
      <div className="aurora-bg">
        <div className="aurora-blob-3" />
        <div className="aurora-blob-4" />
        <div className="aurora-noise" />
      </div>
      
      <div className="relative z-10 w-full max-w-[400px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.34, 1.1, 0.64, 1] }}
          className="glass-card-premium rounded-[32px] p-8 shadow-2xl"
          style={{
            background: "rgba(255,255,255,0.60)",
            backdropFilter: "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
          }}
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 shadow-sm" style={{
              background: "rgba(244,88,122,0.12)", border: "1px solid rgba(244,88,122,0.20)"
            }}>
              <User size={28} style={{ color: "var(--pink-hot)" }} />
            </div>
            <h1 className="text-[28px] font-black font-display tracking-tight" style={{ color: "var(--text-primary)" }}>
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-[14px] font-medium mt-1" style={{ color: "var(--text-secondary)" }}>
              {isSignUp ? 'Sign up to personalize your guide' : 'Sign in to continue your journey'}
            </p>
          </div>

          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3.5 rounded-[16px] text-[13px] font-bold text-center" style={{
                  background: "rgba(254,202,202,0.50)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: "#B91C1C",
                  backdropFilter: "blur(8px)",
                }}>
                  {errorMsg}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {isSignUp && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <AnimatedFormField
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    icon={<User size={18} />}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatedFormField
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} />}
            />

            <AnimatedFormField
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={18} />}
              showToggle
              onToggle={() => setShowPassword(!showPassword)}
              showPassword={showPassword}
            />

            <div className="flex items-center justify-between pt-2 pb-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5 rounded-[6px]" style={{
                  background: rememberMe ? "var(--pink-hot)" : "rgba(255,255,255,0.50)",
                  border: `1.5px solid ${rememberMe ? "var(--pink-hot)" : "rgba(255,255,255,0.80)"}`,
                  transition: "all 0.2s ease"
                }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="absolute opacity-0 cursor-pointer"
                  />
                  {rememberMe && <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></motion.svg>}
                </div>
                <span className="text-[13px] font-bold" style={{ color: "var(--text-secondary)" }}>Remember me</span>
              </label>
              
              {!isSignUp && (
                <button
                  type="button"
                  className="text-[13px] font-extrabold transition-opacity hover:opacity-80"
                  style={{ color: "var(--pink-hot)" }}
                >
                  Forgot password?
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full h-[56px] text-[16px] mt-2"
            >
              <span className={`transition-opacity duration-200 ${isSubmitting ? 'opacity-0' : 'opacity-100'}`}>
                {isSignUp ? 'Create Account' : 'Sign In'}
              </span>
              
              {isSubmitting && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full" style={{ borderTop: "1px solid rgba(255,255,255,0.40)" }} />
              </div>
              <div className="relative flex justify-center text-[12px] font-bold uppercase tracking-wider">
                <span className="px-3" style={{ background: "transparent", color: "var(--text-muted)" }}>Or continue with</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <div className="flex justify-center w-full">
                <GoogleSignIn 
                  onDone={() => {
                    if (onSuccess) onSuccess();
                    else router.push("/home");
                  }} 
                  setErrorMsg={setErrorMsg} 
                />
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[14px] font-medium" style={{ color: "var(--text-secondary)" }}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="font-black transition-opacity hover:opacity-80"
                style={{ color: "var(--pink-hot)" }}
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
