"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { api } from "@/lib/api";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const isLogin = mode === "login";

  const submit = async () => {
    if (!email || !password || (!isLogin && !name)) {
      setErrorMsg("Please fill in all fields");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const data = isLogin
        ? await api.login({ email, password })
        : await api.signup({ name, email, password });
      router.push("/home");
    } catch (e) {
      setErrorMsg((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 space-y-4 shadow-xl">
      <div className="text-xl font-bold text-gray-900 drop-shadow-sm">{isLogin ? "Welcome back" : "Create Account"}</div>
      
      {errorMsg ? <div className="text-xs text-red-600 bg-red-100/50 p-2 rounded-lg">{errorMsg}</div> : null}

      <div className="space-y-3">
        {!isLogin ? (
          <input
            className="h-14 w-full rounded-[20px] bg-white/60 px-4 text-sm font-medium text-gray-800 placeholder-gray-500 shadow-inner outline-none transition focus:bg-white/90 focus:ring-2 focus:ring-pink-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
          />
        ) : null}
        <input 
          className="h-14 w-full rounded-[20px] bg-white/60 px-4 text-sm font-medium text-gray-800 placeholder-gray-500 shadow-inner outline-none transition focus:bg-white/90 focus:ring-2 focus:ring-pink-400" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Email Address" 
          type="email"
        />
        <input 
          className="h-14 w-full rounded-[20px] bg-white/60 px-4 text-sm font-medium text-gray-800 placeholder-gray-500 shadow-inner outline-none transition focus:bg-white/90 focus:ring-2 focus:ring-pink-400" 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Password" 
        />
      </div>

      <button disabled={loading} className="btn-dark mt-2 h-14 w-full shadow-lg" onClick={submit}>
        {loading ? <Loader2 className="animate-spin" size={20} /> : isLogin ? "Login" : "Sign up"}
      </button>

      <div className="pt-2 text-center text-xs font-medium text-gray-700">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <Link className="font-bold text-gray-900 underline decoration-gray-400 underline-offset-4 transition hover:text-black" href={isLogin ? "/signup" : "/login"}>
          {isLogin ? "Sign up" : "Login"}
        </Link>
      </div>
    </div>
  );
}
