"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { initMixpanel, identifyCompany, track } from "@/lib/analytics/mixpanel";

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
  if (typeof window !== "undefined") {
    initMixpanel({ disable: isAdmin });
  }

  useEffect(() => {
    if (!isAdmin && companySlug && companySlug !== "welcome") {
      identifyCompany(companySlug);
    }
  }, [isAdmin, companySlug]);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
    }
    track("Page Viewed", { page_path: pathname });
  }, [pathname]);

  return <>{children}</>;
}
