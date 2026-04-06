"use client";

import Image from "next/image";
import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation.js";
import { EditableText, DeleteItemButton } from "@/components/inline-edit";
import { uploadMedia, updateCollectionField } from "@/components/inline-edit/api";
import type { ApiTarget } from "@/components/inline-edit";
import EditButton from "@/components/EditButton";
import styles from "./TestimonialCard.module.scss";

export type TestimonialCardProps = {
  id?: string | number;
  text: string;
  textHtml?: string;
  name: string;
  role: string;
  avatarUrl?: string | null;
  linkedinUrl?: string | null;
  isAdmin?: boolean;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function testimonialTarget(id: string | number): ApiTarget {
  return { type: "collection", slug: "testimonials", id };
}

const QUOTE_SVG_SIZE = 32;
const QUOTE_WRAP_GAP = 12;

function QuoteMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="74"
      height="74"
      viewBox="0 0 74 74"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M61 59.4614V37L46.0257 37C46.0257 30.5464 47.1093 23.3734 57.3057 23.3734L57.3057 14.5386C46.0257 14.5386 38.5386 20.6644 38.5386 37V59.4614H46.0257H53.5129H61Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.3335 49.4614H34.7949V27L19.8207 27C19.8207 20.5464 20.9042 13.3734 31.1007 13.3734L31.1007 4.53861C19.8207 4.53861 12.3335 10.6644 12.3335 27V49.4614Z"
        fill="currentColor"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function LinkedInEditor({
  id,
  currentUrl,
  onClose,
}: {
  id: string | number;
  currentUrl: string;
  onClose: () => void;
}) {
  const [url, setUrl] = useState(currentUrl);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      await updateCollectionField(
        "testimonials",
        id,
        "linkedinUrl",
        url.trim() || null,
      );
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, [id, url, router, onClose]);

  return (
    <div ref={panelRef} className={styles.linkedinEditor}>
      <label className={styles.linkedinEditorLabel}>LinkedIn URL</label>
      <input
        ref={inputRef}
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://linkedin.com/in/..."
        className={styles.linkedinEditorInput}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") onClose();
        }}
      />
      {error && <span className={styles.linkedinEditorError}>{error}</span>}
      <div className={styles.linkedinEditorActions}>
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className={styles.linkedinEditorCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={styles.linkedinEditorSave}
        >
          {saving ? "Saving\u2026" : "Save"}
        </button>
      </div>
    </div>
  );
}

function AvatarUpload({
  id,
  personName,
  currentUrl,
}: {
  id: string | number;
  personName: string;
  currentUrl?: string | null;
}) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setUploading(true);

      try {
        const media = await uploadMedia(file, `${personName} avatar`);
        await updateCollectionField("testimonials", id, "avatar", media.id);
        router.refresh();
      } catch {
        setPreviewUrl(null);
      } finally {
        setUploading(false);
        URL.revokeObjectURL(objectUrl);
        if (fileRef.current) fileRef.current.value = "";
      }
    },
    [id, personName, router],
  );

  const displayUrl = previewUrl || currentUrl;

  return (
    <div
      className={styles.avatarUploadWrap}
      onClick={() => fileRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") fileRef.current?.click();
      }}
      aria-label="Upload avatar photo"
    >
      {displayUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={displayUrl}
          alt={personName}
          className={styles.avatarImage}
        />
      ) : (
        <span className={styles.avatarInitials}>
          {getInitials(personName)}
        </span>
      )}
      <div className={styles.avatarUploadOverlay}>
        {uploading ? (
          <span className={styles.avatarUploadSpinner} />
        ) : (
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
          >
            <path
              d="M8 2v8M4 6l4-4 4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12h12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className={styles.avatarFileInput}
        tabIndex={-1}
      />
    </div>
  );
}

export default function TestimonialCard({
  id,
  text,
  textHtml,
  name,
  role,
  avatarUrl,
  linkedinUrl,
  isAdmin,
}: TestimonialCardProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const canEdit = mounted && isAdmin && id != null;
  const [showLinkedinEditor, setShowLinkedinEditor] = useState(false);

  const quoteRef = useRef<HTMLDivElement>(null);
  const [wrappedLines, setWrappedLines] = useState<
    Array<{ text: string; indented: boolean }> | null
  >(null);

  useEffect(() => {
    if (canEdit) return;
    const el = quoteRef.current;
    if (!el) return;

    let disposed = false;
    let ro: ResizeObserver | null = null;

    Promise.all([
      import("@chenglou/pretext"),
      document.fonts.ready,
    ]).then(([pretext]) => {
      if (disposed) return;

      function relayout() {
        const cs = getComputedStyle(el!);
        const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        const lh = parseFloat(cs.lineHeight);
        const cw = el!.clientWidth;
        if (cw <= 0 || lh <= 0) return;

        const indent = QUOTE_SVG_SIZE + QUOTE_WRAP_GAP;
        const prepared = pretext.prepareWithSegments(text, font);
        let cursor = { segmentIndex: 0, graphemeIndex: 0 };
        let y = 0;
        const result: Array<{ text: string; indented: boolean }> = [];

        while (true) {
          const beside = y < QUOTE_SVG_SIZE && cw > indent;
          const maxWidth = beside ? cw - indent : cw;
          const line = pretext.layoutNextLine(prepared, cursor, maxWidth);
          if (!line) break;
          result.push({ text: line.text, indented: beside });
          cursor = line.end;
          y += lh;
        }

        setWrappedLines(result);
      }

      relayout();
      ro = new ResizeObserver(relayout);
      ro.observe(el!);
    });

    return () => {
      disposed = true;
      ro?.disconnect();
    };
  }, [text, canEdit]);

  return (
    <div className={styles.card}>
      {canEdit && (
        <div className={styles.adminOverlay}>
          <EditButton
            collection="testimonials"
            id={id}
            label={`Edit ${name}'s testimonial`}
          />
          <DeleteItemButton
            collection="testimonials"
            id={id}
            itemLabel={`${name}'s testimonial`}
          />
        </div>
      )}

      <div className={styles.quoteBlock}>
        {canEdit ? (
          <button
            type="button"
            className={[styles.quoteMark, styles.quoteMarkFloat, styles.quoteMarkEditable].join(' ')}
            onClick={(e) => {
              const editable = (e.currentTarget.parentElement?.querySelector('[data-editable]')) as HTMLElement | null;
              if (editable) editable.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }));
            }}
          >
            <QuoteMark />
          </button>
        ) : (
          <QuoteMark className={[styles.quoteMark, styles.quoteMarkFloat].join(' ')} />
        )}

        {canEdit ? (
          <EditableText
            fieldId={`testimonials:${id}:text`}
            target={testimonialTarget(id)}
            fieldPath="text"
            as="p"
            className={styles.quoteText}
            multiline
            isRichText
            htmlContent={textHtml}
            label="Quote"
          >
            {text}
          </EditableText>
        ) : (
          <div ref={quoteRef} className={styles.quoteText}>
            {wrappedLines
              ? wrappedLines.map((line, i) => (
                  <span
                    key={i}
                    className={
                      line.indented
                        ? styles.lineBesideSvg
                        : styles.lineFullWidth
                    }
                  >
                    {line.text}
                  </span>
                ))
              : textHtml
                ? <span dangerouslySetInnerHTML={{ __html: textHtml }} />
                : text}
          </div>
        )}
      </div>

      <div className={styles.attribution}>
        <div className={styles.avatar}>
          {canEdit ? (
            <AvatarUpload id={id} personName={name} currentUrl={avatarUrl} />
          ) : avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name}
              width={32}
              height={32}
              className={styles.avatarImage}
            />
          ) : (
            <span className={styles.avatarInitials}>
              {getInitials(name)}
            </span>
          )}
        </div>

        <div className={styles.meta}>
          {canEdit ? (
            <>
              <EditableText
                fieldId={`testimonials:${id}:name`}
                target={testimonialTarget(id)}
                fieldPath="name"
                as="span"
                className={styles.name}
                label="Name"
              >
                {name}
              </EditableText>
              <EditableText
                fieldId={`testimonials:${id}:role`}
                target={testimonialTarget(id)}
                fieldPath="role"
                as="span"
                className={styles.role}
                label="Role"
              >
                {role}
              </EditableText>
            </>
          ) : (
            <>
              <span className={styles.name}>{name}</span>
              <span className={styles.role}>{role}</span>
            </>
          )}
        </div>

        {canEdit ? (
          <div className={styles.linkedinGroup}>
            <button
              type="button"
              className={[
                styles.linkedinBtn,
                linkedinUrl ? styles.linkedinBtnLinked : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setShowLinkedinEditor((v) => !v)}
              aria-label={`Edit ${name}'s LinkedIn URL`}
            >
              <LinkedInIcon />
            </button>
            {showLinkedinEditor && (
              <LinkedInEditor
                id={id}
                currentUrl={linkedinUrl || ""}
                onClose={() => setShowLinkedinEditor(false)}
              />
            )}
          </div>
        ) : linkedinUrl ? (
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkedinBtn}
            aria-label={`${name}'s LinkedIn`}
          >
            <LinkedInIcon />
          </a>
        ) : (
          <span className={styles.linkedinBtn} aria-hidden="true">
            <LinkedInIcon />
          </span>
        )}
      </div>
    </div>
  );
}
