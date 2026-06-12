import { ReactNode } from "react";

export function ScreenHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <header className="mb-7 flex items-start justify-between">
      <div>
        <div
          className="text-[10px] font-extrabold uppercase tracking-[0.28em] mb-1"
          style={{ color: "var(--pink-hot)", opacity: 0.75 }}
        >
          HIRKANI
        </div>
        <h1
          className="text-[30px] font-black leading-none tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h1>
        {subtitle ? (
          <p
            className="mt-2 text-[14px] font-semibold leading-snug"
            style={{ color: "var(--text-secondary)" }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {right}
    </header>
  );
}
