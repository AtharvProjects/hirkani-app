"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Supabase crash_reports
    logger.error(error, "Next.js App Error Boundary");
  }, [error]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-6 text-center">
      <GlassCard>
        <div className="flex flex-col items-center p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500 mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-[20px] font-black font-display text-[var(--text-primary)] mb-2">
            Something went wrong!
          </h2>
          <p className="text-[14px] font-medium text-[var(--text-secondary)] mb-6">
            We've automatically logged this crash and our team will look into it.
          </p>
          <button
            onClick={() => reset()}
            className="btn-primary w-full h-[50px] flex items-center justify-center gap-2 text-[15px] rounded-[20px]"
          >
            <RefreshCw size={18} />
            Try again
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
