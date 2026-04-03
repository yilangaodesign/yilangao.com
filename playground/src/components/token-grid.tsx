"use client";

import { useState } from "react";
import Check from "lucide-react/dist/esm/icons/check";
import Copy from "lucide-react/dist/esm/icons/copy";
import s from "./token-grid.module.scss";

export function ColorSwatch({
  color,
  label,
  sublabel,
}: {
  color: string;
  label: string;
  sublabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button onClick={copy} className={s.swatchButton}>
      <div className={s.swatchChip} style={{ backgroundColor: color }}>
        <div className={s.swatchOverlay}>
          {copied ? (
            <Check className={s.swatchIconMd} />
          ) : (
            <Copy className={s.swatchIconSm} />
          )}
        </div>
      </div>
      <p className={s.swatchLabel}>{label}</p>
      {sublabel && <p className={s.swatchSublabel}>{sublabel}</p>}
    </button>
  );
}

export function TokenRow({
  label,
  value,
  token,
  preview,
}: {
  label: string;
  value: string;
  token: string;
  preview?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button onClick={copy} className={s.tokenRow}>
      {preview && <div className={s.tokenRowPreview}>{preview}</div>}
      <div className={s.tokenRowText}>
        <p className={s.tokenRowLabel}>{label}</p>
        <p className={s.tokenRowToken}>{token}</p>
      </div>
      <div className={s.tokenRowValue}>{value}</div>
      <div className={s.tokenRowIconCol}>
        {copied ? (
          <Check className={s.tokenRowIconSuccess} />
        ) : (
          <Copy className={s.tokenRowIconCopy} />
        )}
      </div>
    </button>
  );
}

export function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className={s.sectionHeading}>
      <h2 className={s.sectionHeadingTitle}>{title}</h2>
      {description && (
        <p className={s.sectionHeadingDescription}>{description}</p>
      )}
    </div>
  );
}

export function SectionTitle({
  id,
  children,
}: {
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <h3 id={id} className={s.sectionTitle}>
      {children}
    </h3>
  );
}

export function SectionDescription({
  children,
}: {
  children: React.ReactNode;
}) {
  return <p className={s.sectionDescription}>{children}</p>;
}

export function SubsectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return <h4 className={s.subsectionTitle}>{children}</h4>;
}

export function SubSection({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className={s.subSection}>
      <SubsectionTitle>{title}</SubsectionTitle>
      {children}
    </div>
  );
}

export function ZoneDivider({ label }: { label?: string }) {
  return (
    <div className={s.zoneDivider}>
      {label && <p className={s.zoneDividerLabel}>{label}</p>}
    </div>
  );
}
