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

  useEffect(() => {
    initMixpanel({ disable: isAdmin });

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
