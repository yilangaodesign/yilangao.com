"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const STORAGE_KEY = "theme";

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  resolvedTheme: "light",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolve(theme: Theme): ResolvedTheme {
  return theme === "system" ? getSystemTheme() : theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  const resolved = resolve(theme);

  const applyTheme = useCallback((t: ResolvedTheme) => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(t);
  }, []);

  const setTheme = useCallback(
    (next: Theme) => {
      setThemeState(next);
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(resolve(next));
    },
    [applyTheme],
  );

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme;
    if (stored) {
      setThemeState(stored);
      applyTheme(resolve(stored));
    }
  }, [applyTheme]);

  useEffect(() => {
    applyTheme(resolved);
  }, [applyTheme, resolved]);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme(getSystemTheme());
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme, applyTheme]);

  const value = useMemo(
    () => ({ theme, resolvedTheme: resolved, setTheme }),
    [theme, resolved, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
