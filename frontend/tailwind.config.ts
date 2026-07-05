import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Lora', 'serif'],
      },
      colors: {
        warmBg: "#F7E3C6",
        warmAccent: "#F6A96A",
        panel: "rgba(255,255,255,0.24)",
        "pink-hot": "#F4587A",
        coral: "#FF7961",
      },
      borderRadius: {
        panel: "40px",
        card: "24px",
        pill: "20px",
        glass: "28px",
      },
      boxShadow: {
        soft: "0 30px 90px rgba(98,44,11,0.22)",
        glass: "0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.45)",
        "glass-elevated": "0 8px 32px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.50), inset 0 0 14px 4px rgba(255,255,255,0.08)",
        "glass-glow": "0 8px 32px rgba(244,88,122,0.15), 0 0 60px rgba(244,88,122,0.06)",
      },
      backdropBlur: {
        glass: "16px",
        "glass-strong": "24px",
        "glass-heavy": "32px",
      },
      animation: {
        "fade-up": "fadeSlideUp 0.45s cubic-bezier(0.34,1.56,0.64,1) both",
        "float": "floatUp 4s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "shimmer": "shimmer 1.8s ease infinite",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        smooth: "cubic-bezier(0.25, 0.1, 0.25, 1)",
        "out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
      },
    }
  },
  plugins: []
} satisfies Config;
