"use client";

import { FadeIn } from "@yilangaodesign/design-system";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import styles from "./page.module.scss";

type ExperienceEntry = { role: string; company: string; period: string };
type EducationEntry = { degree: string; institution: string; period: string };

export default function AboutClient({
  experience,
  education,
}: {
  experience: ExperienceEntry[];
  education: EducationEntry[];
}) {
  return (
    <main className={styles.page}>
      <Navigation />
      <div className={styles.container}>
        <FadeIn>
          <header className={styles.header}>
            <h1 className={styles.title}>About</h1>
            <p className={styles.subtitle}>
              Designer building tools that think alongside people.
            </p>
          </header>
        </FadeIn>

        <FadeIn delay={0.1}>
          <section className={styles.section}>
            <p className={styles.bodyText}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
              tempor incididunt ut labore et dolore magna aliqua. At the moment,
              interested in how tools connect with each other, how they act on our
              behalf, and how we interact with them across different modes. Currently at{" "}
              <a href="#" className={styles.inlineLink}>Company Name</a>, an applied
              research lab building AI tooling for software creation. Studied{" "}
              <a href="#" className={styles.inlineLink}>Design Program</a> and{" "}
              <a href="#" className={styles.inlineLink}>HCI Program</a> at University Name.
            </p>
          </section>
        </FadeIn>

        <hr className={styles.divider} />

        <FadeIn delay={0.15}>
          <section className={styles.section}>
            <h2 className={styles.sectionLabel}>Experience</h2>
            <div className={styles.experienceList}>
              {experience.map((item) => (
                <div key={item.company + item.period} className={styles.experienceItem}>
                  <span className={styles.experienceRole}>{item.role}</span>
                  <span className={styles.experienceCompany}>{item.company}</span>
                  <span className={styles.experienceDate}>{item.period}</span>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>

        <hr className={styles.divider} />

        <FadeIn delay={0.2}>
          <section className={styles.section}>
            <h2 className={styles.sectionLabel}>Education</h2>
            <div className={styles.experienceList}>
              {education.map((item) => (
                <div key={item.institution + item.period} className={styles.experienceItem}>
                  <span className={styles.experienceRole}>{item.degree}</span>
                  <span className={styles.experienceCompany}>{item.institution}</span>
                  <span className={styles.experienceDate}>{item.period}</span>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>
      </div>
      <Footer />
    </main>
  );
}
