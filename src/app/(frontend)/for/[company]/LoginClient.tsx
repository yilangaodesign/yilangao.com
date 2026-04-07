"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { validatePassword } from "./actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import styles from "./login.module.scss";

const HalftonePortrait = dynamic(() => import("./HalftonePortrait"), {
  ssr: false,
});

type Props = {
  company: string;
  accent: string | null;
  greeting: string;
  companyName: string | null;
};

export default function LoginClient({ company, accent, greeting, companyName }: Props) {
  const trimmedName = companyName?.trim();
  const headline = trimmedName ? `${greeting}, ${trimmedName}` : greeting;
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showCanvas, setShowCanvas] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 769px)");
    setShowCanvas(mq.matches);
    const handler = (e: MediaQueryListEvent) => setShowCanvas(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await validatePassword(company, password);
      if (result.success) {
        router.push("/");
      } else {
        setError(result.error || "Something went wrong");
        setPassword("");
      }
    });
  }

  return (
    <div
      className={styles.page}
      style={accent ? { "--accent-color": accent } as React.CSSProperties : undefined}
    >
      <div className={styles.inner}>
        <div className={styles.canvasPane}>
          {showCanvas && (
            <HalftonePortrait videoSrc="/videos/portrait.mp4" className={styles.canvas} />
          )}
        </div>
        <div className={styles.formPane}>
          <div className={styles.card}>
            <div className={styles.header}>
              <h1 className={styles.greeting}>{headline}</h1>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <Input
                label="Password"
                type="password"
                size="lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoFocus
                autoComplete="off"
                disabled={isPending}
                status={error ? "error" : "none"}
                feedbackMessage={error || undefined}
              />
              <Button
                appearance="highlight"
                emphasis="bold"
                size="lg"
                fullWidth
                type="submit"
                disabled={isPending || !password.trim()}
                className={styles.submit}
              >
                {isPending ? "Verifying\u2026" : "View Portfolio"}
              </Button>
            </form>

            <p className={styles.footer}>
              Having trouble? Reach me at{" "}
              <a href="mailto:yilangaodesign@gmail.com" className={styles.footerLink}>
                yilangaodesign@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
