"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import styles from "./page.module.scss";

const TESTIMONIALS = [
  {
    text: "Working with Yilan was a transformative experience. The attention to detail and user-centered thinking elevated our product beyond expectations.",
    name: "Name Surname",
    role: "VP of Product, Company",
  },
  {
    text: "Yilan brings a rare combination of technical understanding and design sensibility. Every interaction was thoughtful and intentional.",
    name: "Name Surname",
    role: "Engineering Lead, Company",
  },
  {
    text: "The design system Yilan built for us became the foundation of everything we shipped. It was elegant, scalable, and a joy to work with.",
    name: "Name Surname",
    role: "CTO, Company",
  },
];

const TRUSTED_LOGOS = [
  "Acme Corp", "Globex", "Initech", "Umbrella", "Stark Ind",
  "Wayne Corp", "Cyberdyne", "Soylent", "Tyrell", "Weyland",
];

export default function ContactPage() {
  const [slideIdx, setSlideIdx] = useState(0);
  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const current = TESTIMONIALS[slideIdx];

  function prev() {
    setSlideIdx((i) => (i === 0 ? TESTIMONIALS.length - 1 : i - 1));
  }

  function next() {
    setSlideIdx((i) => (i === TESTIMONIALS.length - 1 ? 0 : i + 1));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      if (!res.ok) throw new Error("Failed to send");
      setFormState({ firstName: "", lastName: "", email: "", subject: "", message: "" });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const tripled = [...TRUSTED_LOGOS, ...TRUSTED_LOGOS, ...TRUSTED_LOGOS];

  return (
    <div className={styles.page}>
      {/* Nav */}
      <nav className={styles.nav}>
        <div className={styles.navPill}>
          <Link href="/" className={styles.logo}>Yilan Gao</Link>
          <div className={styles.navLinks}>
            <Link href="/about" className={styles.navLink}>About</Link>
            <Link href="/experiments" className={styles.navLink}>Experiments</Link>
            <Link href="/reading" className={styles.navLink}>Reading</Link>
            <Link href="/contact" className={styles.navCta}>Contact</Link>
          </div>
        </div>
      </nav>

      {/* Card */}
      <div className={styles.card}>
        <div className={styles.cardPattern} />
        <div className={styles.columns}>
          {/* Left — heading, testimonial */}
          <div className={styles.colLeft}>
            <h1 className={styles.heading}>
              Let&apos;s build something<br />together.
            </h1>
            <p className={styles.subtext}>
              Whether you have a project in mind or just want to chat about
              design and technology, I&apos;d love to hear from you.
            </p>

            <div className={styles.testimonialSlider}>
              <div className={styles.quoteIcon}>&ldquo;</div>
              <div className={styles.sliderQuote}>
                <p className={styles.sliderText}>{current.text}</p>
                <div className={styles.sliderAttrib}>
                  <span className={styles.sliderName}>{current.name}</span>
                  <span className={styles.sliderRole}>{current.role}</span>
                </div>
              </div>
              <div className={styles.sliderControls}>
                <button className={styles.sliderBtn} onClick={prev} aria-label="Previous testimonial">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M8.5 3.5L5 7l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button className={styles.sliderBtn} onClick={next} aria-label="Next testimonial">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M5.5 3.5L9 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div className={styles.colRight}>
            <div className={styles.formCard}>
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label className={styles.label}>First Name</label>
                    <input
                      className={styles.input}
                      placeholder="Jane"
                      value={formState.firstName}
                      onChange={(e) => setFormState((s) => ({ ...s, firstName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Last Name</label>
                    <input
                      className={styles.input}
                      placeholder="Doe"
                      value={formState.lastName}
                      onChange={(e) => setFormState((s) => ({ ...s, lastName: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Email</label>
                  <input
                    className={styles.input}
                    type="email"
                    placeholder="jane@company.com"
                    value={formState.email}
                    onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Subject</label>
                  <select
                    className={styles.select}
                    value={formState.subject}
                    onChange={(e) => setFormState((s) => ({ ...s, subject: e.target.value }))}
                    required
                  >
                    <option value="" disabled>Select a topic</option>
                    <option value="project">Project Inquiry</option>
                    <option value="freelance">Freelance Opportunity</option>
                    <option value="collaboration">Collaboration</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Message</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="Tell me about your project..."
                    rows={3}
                    value={formState.message}
                    onChange={(e) => setFormState((s) => ({ ...s, message: e.target.value }))}
                    required
                  />
                </div>

                {error && <p className={styles.formError}>{error}</p>}

                <button type="submit" className={styles.submit} disabled={submitting}>
                  {submitting ? "Sending..." : "Send Message"}
                </button>
                <p className={styles.privacy}>
                  Your information is kept private.{" "}
                  <span className={styles.privacyLink}>Privacy Policy</span>
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* Trusted by marquee */}
        <div className={styles.trustRow}>
          <span className={styles.trustLabel}>Trusted by</span>
          <div className={styles.marqueeViewport}>
            <div className={styles.marqueeTrack}>
              {tripled.map((name, i) => (
                <span key={`${name}-${i}`} className={styles.logoBlock}>
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
