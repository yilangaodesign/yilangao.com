"use client";

import { useState, useEffect } from "react";

interface ChangeAnalysis {
  level: "patch" | "minor" | "major";
  reason: string;
  newComponents: string[];
  deletedComponents: string[];
  modifiedTokenFiles: string[];
  modifiedComponentFiles: string[];
  totalFilesChanged: number;
}

export interface DevInfo {
  lastModified: string;
  lastModifiedDate: string;
  currentVersion: string | null;
  releaseVersion: string | null;
  analysis: ChangeAnalysis;
}

const POLL_INTERVAL_MS = 60_000;

export function useDevInfo() {
  const [data, setData] = useState<DevInfo | null>(null);
  const [isLocal, setIsLocal] = useState(false);

  useEffect(() => {
    const host = window.location.hostname;
    const local = host === "localhost" || host === "127.0.0.1";
    setIsLocal(local);
    if (!local) return;

    let active = true;

    async function fetchInfo() {
      try {
        const res = await fetch("/api/dev-info");
        if (!res.ok) return;
        const json: DevInfo = await res.json();
        if (active) setData(json);
      } catch {
        /* dev server may not be ready yet */
      }
    }

    fetchInfo();
    const timer = setInterval(fetchInfo, POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return { data, isLocal };
}
