"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { initMixpanel, identifyCompany, track, registerSuperProps } from "@/lib/analytics/mixpanel";
import { useSessionTracker } from "@/lib/analytics/use-session-tracker";

type AnalyticsProviderProps = {
  companySlug: string | null;
  isAdmin: boolean;
  children: React.ReactNode;
};

export function AnalyticsProvider({
  companySlug,
  isAdmin,
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
    if (localStorage.getItem("yg_owner")) {
      registerSuperProps({ is_owner: true });
    }
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
