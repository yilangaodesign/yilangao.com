"use client";

import { FadeIn } from "@/components/ui/FadeIn";
import Navigation from "@/components/ui/Navigation/Navigation";
import Footer from "@/components/ui/Footer/Footer";
import ScrollSpy from "@/components/ui/ScrollSpy/ScrollSpy";
import AdminBar from "@/components/AdminBar";
import {
  InlineEditProvider,
  EditableArray,
  InlineEditBar,
} from "@/components/inline-edit";
import type { ApiTarget, FieldDefinition } from "@/components/inline-edit";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./page.module.scss";

type ExperienceEntry = { role: string; company: string; period: string };
type EducationEntry = { degree: string; institution: string; period: string };

const SITE_CONFIG_TARGET: ApiTarget = { type: 'global', slug: 'site-config' };

const EXPERIENCE_FIELDS: FieldDefinition[] = [
  { name: 'role', label: 'Role', type: 'text', required: true },
  { name: 'company', label: 'Company', type: 'text', required: true },
  { name: 'period', label: 'Period', type: 'text', required: true },
];

const EDUCATION_FIELDS: FieldDefinition[] = [
  { name: 'degree', label: 'Degree', type: 'text', required: true },
  { name: 'institution', label: 'Institution', type: 'text', required: true },
  { name: 'period', label: 'Period', type: 'text', required: true },
];

export default function AboutClient({
  experience,
  education,
  isAdmin,
}: {
  experience: ExperienceEntry[];
  education: EducationEntry[];
  isAdmin?: boolean;
}) {
  const spySections = [
    { id: "intro", label: "Intro" },
    { id: "experience", label: "Experience" },
    { id: "education", label: "Education" },
  ];

  const page = (
    <main className={styles.page}>
      {isAdmin && <AdminBar editUrl="/admin/globals/site-config" editLabel="Edit Experience & Education" />}
      <Navigation />
      <ScrollSpy sections={spySections} />
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
          <section id="intro" className={styles.section}>
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
          <section id="experience" className={styles.section}>
            <Eyebrow as="h2" className={styles.sectionLabel}>Experience</Eyebrow>
            <EditableArray<ExperienceEntry>
              fieldId="sc:experience"
              target={SITE_CONFIG_TARGET}
              fieldPath="experience"
              items={experience}
              itemFields={EXPERIENCE_FIELDS}
              label="Experience"
              className={styles.experienceList}
              renderItem={(item, i) => (
                <div key={i} className={styles.experienceItem}>
                  <span className={styles.experienceRole}>{item.role}</span>
                  <span className={styles.experienceCompany}>{item.company}</span>
                  <span className={styles.experienceDate}>{item.period}</span>
                </div>
              )}
            />
          </section>
        </FadeIn>

        <hr className={styles.divider} />

        <FadeIn delay={0.2}>
          <section id="education" className={styles.section}>
            <Eyebrow as="h2" className={styles.sectionLabel}>Education</Eyebrow>
            <EditableArray<EducationEntry>
              fieldId="sc:education"
              target={SITE_CONFIG_TARGET}
              fieldPath="education"
              items={education}
              itemFields={EDUCATION_FIELDS}
              label="Education"
              className={styles.experienceList}
              renderItem={(item, i) => (
                <div key={i} className={styles.experienceItem}>
                  <span className={styles.experienceRole}>{item.degree}</span>
                  <span className={styles.experienceCompany}>{item.institution}</span>
                  <span className={styles.experienceDate}>{item.period}</span>
                </div>
              )}
            />
          </section>
        </FadeIn>
      </div>
      <Footer />
      {isAdmin && <InlineEditBar />}
    </main>
  );

  if (isAdmin) {
    return (
      <InlineEditProvider isAdmin>
        {page}
      </InlineEditProvider>
    );
  }

  return page;
}
