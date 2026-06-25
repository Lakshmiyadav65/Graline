import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Providers } from "@/components/providers/Providers";
import { GoogleTranslate } from "@/components/layout/GoogleTranslate";
import "./globals.css";

// Bricolage Grotesque + Geist + Geist Mono — contemporary "warm but wonky"
// system. Bricolage comes from next/font/google; Geist + Geist Mono come from
// Vercel's `geist` package (not yet in next/font/google's catalog for 14.2).
// None of the three ship a true italic — <em> styling synthesizes an oblique
// (a real visual change vs the previous Fraunces italic).
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"], // hero uses font-variation-settings: "opsz" 144 (clamped to 96)
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Grainline — Rice, direct from the farmer",
  description:
    "Direct-trade rice from named farmers in villages across India. Mill date you can see, farmers you can call by name, fair prices for both sides.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Allow pinch-zoom (a11y); cap initial only. No maximum-scale lock.
  themeColor: "#2d4a2b",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body>
        <Providers>
          {children}
        </Providers>
        <GoogleTranslate />
      </body>
    </html>
  );
}
