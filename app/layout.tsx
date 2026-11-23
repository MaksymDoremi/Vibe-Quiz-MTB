import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "MTB IQ — Ride Smart",
  description: "Test your mountain bike knowledge, sharpen your setup skills, and earn your trail stripes.",
};

export const viewport: Viewport = {
  themeColor: "#080b09",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={cn("dark font-sans", geist.variable)}>
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
