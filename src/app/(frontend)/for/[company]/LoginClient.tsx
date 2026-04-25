"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { validatePassword } from "./actions";
import { Input } from "@/components/ui/Input";
import styles from "./login.module.scss";

const HalftonePortrait = dynamic(() => import("./HalftonePortrait"), {
  ssr: false,
});

type Props = {
  company: string;
  accent: string | null;
  greeting: string;
};

export default function LoginClient({ company, accent, greeting }: Props) {
  const headline = greeting.replace(/\.\s*$/, ",");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showCanvas, setShowCanvas] = useState(false);
  const router = useRouter();

  const hasPassword = password.trim().length > 0;
  const typedTextRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (typedTextRef.current) {
      typedTextRef.current.scrollLeft = typedTextRef.current.scrollWidth;
    }
  }, [password]);

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
              <div className={styles.inputArea}>
                {!password ? (
                  <span
                    className={styles.placeholder}
                    aria-hidden="true"
                  >
                    (what I told you)
                  </span>
                ) : (
                  <span ref={typedTextRef} className={styles.typedText} aria-hidden="true">
                    {password}
                  </span>
                )}
                <Input
                  aria-label="Password"
                  type="text"
                  emphasis="minimal"
                  size="lg"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  autoFocus
                  autoComplete="off"
                  disabled={isPending}
                  status={error ? "error" : "none"}
                  feedbackMessage={error || undefined}
                  className={styles.passwordInput}
                  trailing={
                    <button
                      type="submit"
                      className={[
                        styles.submitBtn,
                        hasPassword && !isPending ? styles.submitVisible : "",
                      ].filter(Boolean).join(" ")}
                      disabled={isPending || !hasPassword}
                      tabIndex={hasPassword ? 0 : -1}
                      aria-label="View portfolio"
                    >
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 18 18"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M3.75 9H14.25M10 4.5L14.25 9L10 13.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  }
                />
              </div>
            </form>

            <p className={styles.footer}>
              Stuck? Just say hi -{" "}
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
