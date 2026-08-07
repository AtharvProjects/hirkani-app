"use client";

import { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { api } from "@/lib/api";
import { Capacitor } from "@capacitor/core";
import { GoogleSignIn as CapGoogleSignIn } from "@capawesome/capacitor-google-sign-in";

export function GoogleSignIn({ onDone, setErrorMsg }: { onDone: () => void, setErrorMsg: (msg: string) => void }) {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
    // Need to initialize capacitor google auth with client ids
    if (Capacitor.isNativePlatform()) {
        CapGoogleSignIn.initialize({
            clientId: "99497887362-64ooud64m85rqobv46sepcjaee0bv5s1.apps.googleusercontent.com",
            scopes: ['profile', 'email'],
        }).catch(console.error);
    }
  }, []);

  const handleNativeLogin = async () => {
    try {
        const response = await CapGoogleSignIn.signIn();
        if (response.idToken) {
            await api.googleLogin(response.idToken);
            onDone();
        } else {
            setErrorMsg("Google Login failed: No credential received");
        }
    } catch (e) {
        setErrorMsg((e as Error).message || "Native Google Login Failed");
    }
  };

  if (isNative) {
      return (
          <button
              onClick={handleNativeLogin}
              className="w-full h-[52px] rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform border border-[#EAE8F0]"
          >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.7 17.58V20.34H19.27C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                  <path d="M12 23C14.97 23 17.46 22.02 19.27 20.34L15.7 17.58C14.72 18.24 13.47 18.64 12 18.64C9.15 18.64 6.74 16.72 5.88 14.13H2.21V16.98C4.01 20.56 7.72 23 12 23Z" fill="#34A853"/>
                  <path d="M5.88 14.13C5.66 13.47 5.53 12.75 5.53 12C5.53 11.25 5.66 10.53 5.88 9.87V7.02H2.21C1.47 8.5 1.05 10.19 1.05 12C1.05 13.81 1.47 15.5 2.21 16.98L5.88 14.13Z" fill="#FBBC05"/>
                  <path d="M12 5.36C13.62 5.36 15.07 5.92 16.21 7.01L19.34 3.88C17.45 2.12 14.97 1 12 1C7.72 1 4.01 3.44 2.21 7.02L5.88 9.87C6.74 7.28 9.15 5.36 12 5.36Z" fill="#EA4335"/>
              </svg>
              <span className="text-[15px] font-bold text-[#4B495B]">Continue with Google</span>
          </button>
      );
  }

  return (
    <div className="w-full flex items-center justify-center relative z-20">
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          try {
            if (credentialResponse.credential) {
              await api.googleLogin(credentialResponse.credential);
              onDone();
            } else {
              setErrorMsg("Google Login failed: No credential received");
            }
          } catch (e) {
            setErrorMsg((e as Error).message);
          }
        }}
        onError={() => {
          setErrorMsg("Google Login failed");
        }}
        useOneTap={false}
        type="standard"
        size="large"
        text="continue_with"
        shape="rectangular"
        width="300"
      />
    </div>
  );
}
