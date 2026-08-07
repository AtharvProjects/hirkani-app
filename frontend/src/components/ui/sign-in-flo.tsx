"use client";

import React, { useState } from "react";
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

const PillFormField: React.FC<FormFieldProps> = ({
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
    <div className="relative w-full">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7C7A9C]">
        {icon}
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="w-full bg-[#FFF5F7] pl-14 pr-12 py-4 rounded-full font-medium text-[15px] focus:outline-none focus:ring-2 focus:ring-[#FF9171] transition-shadow text-[#303036] placeholder-[#9E9CB5]"
        placeholder={placeholder}
      />
      {showToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-[#7C7A9C] hover:text-[#303036] transition-colors"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
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
    <div className="min-h-[100dvh] w-full flex flex-col items-center overflow-x-hidden" style={{ background: "linear-gradient(to bottom, #D6C8F6, #F2D5EA, #EFE6F7)" }}>
      
      {/* Container locks max-width for both image and card so they scale exactly together */}
      <div className="w-full max-w-[450px] grid grid-cols-1 grid-rows-1 relative">
        
        {/* The Mockup Background */}
        <img 
          src="/avatar_original.png" 
          alt="Original Mockup Background" 
          className="col-start-1 row-start-1 w-full h-auto z-0 pointer-events-none self-start"
        />

        {/* The Interactive Card Container */}
        {/* 
          Padding top of 46% pushes the card exactly to her hands.
          We remove horizontal padding so the white card spans full width, 
          flawlessly covering the baked-in text and original card edges behind it!
        */}
        <div className="col-start-1 row-start-1 relative z-10 w-full pb-10" style={{ paddingTop: "46%" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.34, 1.1, 0.64, 1] }}
            className="w-full bg-[#FCF8FB] rounded-[36px] pt-16 px-7 pb-8 shadow-[0_20px_50px_rgba(0,0,0,0.08)] relative z-10 mx-auto max-w-[380px]"
          >
          <div className="text-center mb-6">
            <h1 className="text-[26px] font-extrabold tracking-tight text-[#2E295E] mb-1">
              {isSignUp ? 'Save Your Hirkani Profile' : 'Welcome Back!'}
            </h1>
            <p className="text-[14px] font-medium text-[#8F8CAE]">
              {isSignUp ? 'Your personalized pregnancy guide is ready — just save it' : 'Login to continue'}
            </p>
          </div>

          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 rounded-[14px] text-[13px] font-bold text-center bg-red-50 text-red-600 border border-red-100">
                  {errorMsg}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <AnimatePresence mode="popLayout">
              {isSignUp && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <PillFormField
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    icon={<User size={18} strokeWidth={1.5} />}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <PillFormField
              type="text"
              placeholder="Username / Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<User size={18} strokeWidth={1.5} />}
            />

            <PillFormField
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={18} strokeWidth={1.5} />}
              showToggle
              onToggle={() => setShowPassword(!showPassword)}
              showPassword={showPassword}
            />

            <div className="flex items-center justify-end pt-1 pb-1">
              {!isSignUp && (
                <button
                  type="button"
                  className="text-[12px] font-semibold text-[#9A81F8] hover:opacity-80 transition-opacity"
                >
                  Forgot Password?
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[52px] text-[15px] font-bold text-white rounded-full relative overflow-hidden transition-transform active:scale-[0.98]"
              style={{
                background: "linear-gradient(to right, #FF8E9C 0%, #A782F4 100%)",
                boxShadow: "0 8px 20px rgba(167, 130, 244, 0.35)"
              }}
            >
              <span className={`transition-opacity duration-200 ${isSubmitting ? 'opacity-0' : 'opacity-100'}`}>
                {isSignUp ? 'Save My Profile' : 'Login'}
              </span>
              
              {isSubmitting && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </button>
          </form>

          <div className="mt-7 relative flex items-center justify-center">
            <div className="absolute w-full border-t border-[#EAE8F0]"></div>
            <span className="bg-[#FCF8FB] px-3 text-[12px] font-medium text-[#A4A2B8] relative z-10">
              or continue with
            </span>
          </div>

          <div className="mt-5 relative z-20 w-full flex justify-center">
            {/* Google Button */}
            <div className="w-full flex justify-center">
              <GoogleSignIn 
                onDone={() => {
                  if (onSuccess) onSuccess();
                  else router.push("/home");
                }} 
                setErrorMsg={setErrorMsg} 
              />
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[13px] font-medium text-[#8F8CAE]">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="font-bold text-[#9A81F8] hover:opacity-80 transition-opacity"
              >
                {isSignUp ? 'Login' : 'Save My Profile'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
      </div>
    </div>
  );
};
