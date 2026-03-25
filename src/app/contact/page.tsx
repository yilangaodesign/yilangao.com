"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import styles from "./page.module.scss";

const TESTIMONIALS = [
  { quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.", name: "Name Surname", role: "Title, Company" },
  { quote: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.", name: "Name Surname", role: "Title, Company" },
  { quote: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla.", name: "Name Surname", role: "Title, Company" },
];

const PROJECT_TYPES = ["Brand & Identity", "Product Design", "Website Design", "UX Research & Strategy", "Other"];
const BUDGET_RANGES = ["Under $5k", "$5k – $15k", "$15k – $50k", "$50k+", "Not sure yet"];

function TestimonialSlider() {
  const [idx, setIdx] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);
  const next = useCallback(() => setIdx((i) => (i + 1) % TESTIMONIALS.length), []);
  const prev = useCallback(() => setIdx((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length), []);

  useEffect(() => {
    timer.current = setInterval(next, 6000);
    return () => clearInterval(timer.current);
  }, [next]);

  const t = TESTIMONIALS[idx];

  return (
    <div className={styles.testimonialSlider}>
      <div className={styles.quoteIcon}>&ldquo;</div>
      <AnimatePresence mode="wait">
        <motion.blockquote
          key={idx}
          className={styles.sliderQuote}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35 }}
        >
          <p className={styles.sliderText}>{t.quote}</p>
          <footer className={styles.sliderAttrib}>
            <span className={styles.sliderName}>{t.name}</span>
            <span className={styles.sliderRole}>{t.role}</span>
          </footer>
        </motion.blockquote>
      </AnimatePresence>
      <div className={styles.sliderControls}>
        <button onClick={prev} className={styles.sliderBtn} aria-label="Previous">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <button onClick={next} className={styles.sliderBtn} aria-label="Next">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", projectType: "", budget: "", message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const update = (field: string, value: string) => setForm({ ...form, [field]: value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          message: [
            `Project type: ${form.projectType || "Not specified"}`,
            `Budget: ${form.budget || "Not specified"}`,
            "",
            form.message,
          ].join("\n"),
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      setForm({ firstName: "", lastName: "", email: "", projectType: "", budget: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className={styles.page}>
      {/* Nav */}
      <header className={styles.nav}>
        <div className={styles.navPill}>
          <Link href="/" className={styles.logo}>Logo.</Link>
          <nav className={styles.navLinks}>
            <Link href="/#services" className={styles.navLink}>Link</Link>
            <Link href="/#work" className={styles.navLink}>Link</Link>
            <Link href="/#testimonials" className={styles.navLink}>Link</Link>
            <Link href="/contact" className={styles.navCta}>Link</Link>
          </nav>
        </div>
      </header>

      {/* Parent card — fills viewport minus margins, no scroll */}
      <div className={styles.card}>
        <div className={styles.cardPattern} />

        <div className={styles.columns}>
          {/* LEFT: heading + testimonial */}
          <div className={styles.colLeft}>
            <h1 className={styles.heading}>Get In Touch</h1>
            <p className={styles.subtext}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Sed do eiusmod tempor incididunt.
            </p>
            <TestimonialSlider />
          </div>

          {/* RIGHT: form as a floating card */}
          <div className={styles.colRight}>
            <div className={styles.formCard}>
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label htmlFor="c-first" className={styles.label}>First Name</label>
                    <input id="c-first" type="text" required className={styles.input} placeholder="First Name" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="c-last" className={styles.label}>Last Name</label>
                    <input id="c-last" type="text" required className={styles.input} placeholder="Last Name" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} />
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="c-email" className={styles.label}>Email</label>
                  <input id="c-email" type="email" required className={styles.input} placeholder="you@company.com" value={form.email} onChange={(e) => update("email", e.target.value)} />
                </div>

                <div className={styles.field}>
                  <label htmlFor="c-type" className={styles.label}>What type of project?</label>
                  <select id="c-type" className={styles.select} value={form.projectType} onChange={(e) => update("projectType", e.target.value)}>
                    <option value="">Select</option>
                    {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className={styles.field}>
                  <label htmlFor="c-budget" className={styles.label}>Budget Range</label>
                  <select id="c-budget" className={styles.select} value={form.budget} onChange={(e) => update("budget", e.target.value)}>
                    <option value="">Select</option>
                    {BUDGET_RANGES.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div className={styles.field}>
                  <label htmlFor="c-msg" className={styles.label}>Tell me about your project</label>
                  <textarea id="c-msg" rows={3} className={styles.textarea} placeholder="A brief description..." value={form.message} onChange={(e) => update("message", e.target.value)} />
                </div>

                <button type="submit" className={styles.submit} disabled={status === "sending"}>
                  {status === "sending" ? "Sending..." : status === "sent" ? "Message Sent!" : "Send Message"}
                </button>

                {status === "error" && (
                  <p className={styles.formError}>Something went wrong. Please try again.</p>
                )}

                <p className={styles.privacy}>
                  Your information is kept private.{" "}
                  <span className={styles.privacyLink}>Read our Privacy Policy</span>
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: trusted by — full width across the card */}
        <div className={styles.trustRow}>
          <span className={styles.trustLabel}>Trusted by</span>
          <div className={styles.marqueeViewport}>
            <div className={styles.marqueeTrack}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={`a-${i}`} className={styles.logoBlock}>Logo {i + 1}</div>
              ))}
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={`b-${i}`} className={styles.logoBlock}>Logo {i + 1}</div>
              ))}
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={`c-${i}`} className={styles.logoBlock}>Logo {i + 1}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
