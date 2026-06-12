import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "HIRKANI – Pregnancy Food Safety Guide",
  description: "AI-powered pregnancy food safety scanner",
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <main className="flex min-h-screen items-center justify-center bg-transparent">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
