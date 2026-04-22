import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { EssayMeta } from "./EssayMeta";
import styles from "./EssayHeader.module.scss";

export type EssayHeaderProps = {
  category?: string;
  headline: ReactNode;
  publishedAt?: string;
  readTime: number;
  mediumUrl?: string;
};

export function EssayHeader({
  category,
  headline,
  publishedAt,
  readTime,
  mediumUrl,
}: EssayHeaderProps) {
  return (
    <header className={styles.root}>
      {category ? (
        <Eyebrow as="span" size="sm" className={styles.eyebrow}>
          {category}
        </Eyebrow>
      ) : null}
      <div className={styles.headline}>{headline}</div>
      <EssayMeta
        publishedAt={publishedAt}
        readTime={readTime}
        mediumUrl={mediumUrl}
      />
    </header>
  );
}

export default EssayHeader;
