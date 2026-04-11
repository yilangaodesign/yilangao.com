import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import {
  GeistPixelSquare,
  GeistPixelGrid,
  GeistPixelCircle,
  GeistPixelTriangle,
  GeistPixelLine,
} from "geist/font/pixel";
import { IBM_Plex_Sans, IBM_Plex_Serif } from "next/font/google";
import "../globals.scss";
import website from "../../../website.json";
import elan from "../../../elan.json";
import { TooltipProvider } from "@/components/ui/Tooltip";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-ibm-plex-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yilan Gao — UX Designer",
  description: "Portfolio of Yilan Gao, UX Designer crafting thoughtful digital experiences.",
  generator: `${website.name} ${website.release.version} (${elan.name} ${elan.release.version})`,
};

const fontVariables = [
  GeistSans.variable,
  GeistMono.variable,
  GeistPixelSquare.variable,
  GeistPixelGrid.variable,
  GeistPixelCircle.variable,
  GeistPixelTriangle.variable,
  GeistPixelLine.variable,
  ibmPlexSans.variable,
  ibmPlexSerif.variable,
].join(" ");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" className={fontVariables}>
      <body>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </body>
    </html>
  );
}
