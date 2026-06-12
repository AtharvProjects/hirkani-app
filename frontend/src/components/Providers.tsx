"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

export function Providers({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "99497887362-64ooud64m85rqobv46sepcjaee0bv5s1.apps.googleusercontent.com"; // Fallback for dev
  return <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>;
}
