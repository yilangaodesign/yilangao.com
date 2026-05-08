import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { IBM_Plex_Serif } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@ds/Tooltip";
import { AppShell } from "@/components/app-shell";
import "./ds-tokens.scss";
import "./globals.css";

export const metadata: Metadata = {
  title: "Edra Design Challenge — Yilan Gao",
  description: "Interactive design challenge submission for Edra",
};

const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-ibm-plex-serif",
  display: "swap",
});

const fontVariables = [GeistSans.variable, GeistMono.variable, ibmPlexSerif.variable].join(" ");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <TooltipProvider>
            <AppShell>{children}</AppShell>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
