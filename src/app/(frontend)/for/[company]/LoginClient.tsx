"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { validatePassword } from "./actions";
import styles from "./login.module.scss";

type Props = {
  company: string;
  accent: string;
  greeting: string;
  companyName: string | null;
};

export default function LoginClient({ company, accent, greeting, companyName }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

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
      style={{ "--accent-color": accent } as React.CSSProperties}
    >
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.accentBar} style={{ backgroundColor: accent }} />
          <h1 className={styles.greeting}>{greeting}</h1>
          <p className={styles.subtitle}>
            {companyName
              ? `This portfolio was prepared for ${companyName}. Enter the password I shared to continue.`
              : "Enter the password I shared to view my portfolio."}
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
              autoComplete="off"
              disabled={isPending}
            />
          </div>
          <div className={styles.error} role="alert">
            {error}
          </div>
          <button
            type="submit"
            className={styles.submit}
            disabled={isPending || !password.trim()}
          >
            {isPending ? "Verifying…" : "View Portfolio"}
          </button>
        </form>

        <p className={styles.footer}>
          Yilan Gao · Portfolio Preview
        </p>
      </div>
    </div>
  );
}
