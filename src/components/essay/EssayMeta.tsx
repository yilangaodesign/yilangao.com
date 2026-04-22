import styles from "./EssayMeta.module.scss";

const MEDIUM_ICON = (
  <svg
    aria-hidden="true"
    focusable="false"
    viewBox="0 0 1043.63 592.71"
    width="1em"
    height="1em"
    className={styles.mediumIcon}
  >
    <path
      fill="currentColor"
      d="M588.67 296.35c0 163.67-131.76 296.35-294.33 296.35C131.76 592.71 0 460 0 296.35S131.76 0 294.34 0c162.57 0 294.33 132.68 294.33 296.35zm322.84 0c0 154.04-65.89 279-147.18 279-81.28 0-147.17-124.96-147.17-279 0-154.04 65.89-279 147.17-279 81.29 0 147.18 124.96 147.18 279zm132.12 0c0 138-23.17 249.94-51.76 249.94-28.59 0-51.76-111.94-51.76-249.94 0-138 23.17-249.94 51.76-249.94 28.59 0 51.76 111.94 51.76 249.94z"
    />
  </svg>
);

function formatDate(publishedAt: string): string {
  const date = new Date(publishedAt);
  if (isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export type EssayMetaProps = {
  publishedAt?: string;
  readTime: number;
  mediumUrl?: string;
  className?: string;
};

export function EssayMeta({ publishedAt, readTime, mediumUrl, className }: EssayMetaProps) {
  const dateLabel = publishedAt ? formatDate(publishedAt) : "";
  const segments: React.ReactNode[] = [];

  if (dateLabel) {
    segments.push(
      <time key="date" dateTime={publishedAt} className={styles.segment}>
        {dateLabel}
      </time>,
    );
  }

  segments.push(
    <span key="read" className={styles.segment}>
      {readTime} min read
    </span>,
  );

  if (mediumUrl) {
    segments.push(
      <a
        key="medium"
        href={mediumUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.mediumLink}
      >
        {MEDIUM_ICON}
        <span>Also on Medium</span>
        <span aria-hidden="true" className={styles.externalIndicator}>
          ↗
        </span>
      </a>,
    );
  }

  const rootClass = [styles.root, className].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      {segments.map((seg, i) => (
        <span key={i} className={styles.item}>
          {i > 0 && (
            <span aria-hidden="true" className={styles.separator}>
              ·
            </span>
          )}
          {seg}
        </span>
      ))}
    </div>
  );
}

export default EssayMeta;
