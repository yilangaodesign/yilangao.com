"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { initMixpanel, identifyCompany, track, registerSuperProps, getDeviceId } from "@/lib/analytics/mixpanel";
import { useSessionTracker } from "@/lib/analytics/use-session-tracker";

// Update this list when you clear Chrome data or get a new device.
const KNOWN_OWNER_DEVICE_IDS = [
  "3f6caf36-45f2-4c19-8d3e-371a43b10a11",
];

type AnalyticsProviderProps = {
  companySlug: string | null;
  isAdmin: boolean;
  isOwner: boolean;
  children: React.ReactNode;
};

export function AnalyticsProvider({
  companySlug,
  isAdmin,
  isOwner,
  children,
}: AnalyticsProviderProps) {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  // Init during client render (not only in useEffect) so nested components' passive
  // effects never call track() before init — React runs child useEffects before parent.
  // Company identification also runs here so the super property is set before any
  // track() calls in effects.
  if (typeof window !== "undefined") {
    initMixpanel({ disable: isAdmin });

    const ownerFromCookie = isOwner;
    const ownerFromStorage = !!localStorage.getItem("yg_owner");
    const deviceId = getDeviceId();
    const ownerFromDeviceId = !!deviceId && KNOWN_OWNER_DEVICE_IDS.includes(deviceId);

    registerSuperProps({
      is_owner: !!(ownerFromCookie || ownerFromStorage || ownerFromDeviceId),
    });

    if (!isAdmin && companySlug) {
      if (companySlug === "welcome") {
        registerSuperProps({ company: "welcome" });
      } else {
        identifyCompany(companySlug);
      }
    }
  }

  useSessionTracker(companySlug);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
    }
    track("Page Viewed", { page_path: pathname });
  }, [pathname]);

  return <>{children}</>;
}
