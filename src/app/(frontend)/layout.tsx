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
import { Analytics } from "@vercel/analytics/next";
import "../globals.scss";
import website from "../../../website.json";
import elan from "../../../elan.json";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { cookies } from "next/headers";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { getCompanyFromSession } from "@/lib/company-session";

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
  icons: {
    icon: "/icon.svg",
  },
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const companySlug = await getCompanyFromSession();

  // For analytics exclusion, only check the real payload-token cookie.
  // The dev auto-login fallback (isAdminAuthenticated) always returns true
  // when PAYLOAD_ADMIN_EMAIL is set, which would disable Mixpanel in dev.
  let isAdminForAnalytics = false;
  try {
    const cookieStore = await cookies();
    isAdminForAnalytics = !!cookieStore.get("payload-token")?.value;
  } catch {
    // cookies() unavailable
  }

  return (
    <html lang="en" data-theme="light" className={fontVariables}>
      <body>
          <TooltipProvider>
            <AnalyticsProvider companySlug={companySlug} isAdmin={isAdminForAnalytics}>
              {children}
            </AnalyticsProvider>
          </TooltipProvider>
          <Analytics />
        </body>
    </html>
  );
}
