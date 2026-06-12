import { ReactNode } from "react";

interface GlassCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  variant?: "default" | "strong" | "subtle";
  glow?: boolean;
}

export function GlassCard({
  title,
  children,
  className = "",
  variant = "default",
  glow = false,
}: GlassCardProps) {
  const variantClass =
    variant === "strong"
      ? "glass-card-strong"
      : "glass-card";

  return (
    <section
      className={`${variantClass} p-5 mb-4 ${glow ? "glow-pink" : ""} ${className}`}
    >
      {title ? (
        <h3
          className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.20em] mb-4"
          style={{ color: "var(--text-muted)" }}
        >
          {title}
        </h3>
      ) : null}
      {children}
    </section>
  );
}
