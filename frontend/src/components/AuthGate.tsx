"use client";

import { Component as SignInFlo } from "@/components/ui/sign-in-flo";
import { Portal } from "@/components/Portal";

export function AuthGate({ onDone }: { onDone: () => void }) {
  return (
    <Portal>
      <div className="w-full h-[100dvh] fixed inset-0 z-[100] bg-[var(--bg-cream,white)] overflow-y-auto">
        <SignInFlo onSuccess={onDone} />
      </div>
    </Portal>
  );
}
