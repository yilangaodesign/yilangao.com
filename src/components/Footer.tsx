import styles from "./Footer.module.scss";

const SOCIAL_LINKS = [
  { label: "LinkedIn", href: "#" },
  { label: "Twitter", href: "#" },
  { label: "Instagram", href: "#" },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <span className={styles.copyright}>
          &copy; {new Date().getFullYear()} Yilan Gao
        </span>
        <div className={styles.footerLinks}>
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
            >
              {link.label}
              <span className={styles.arrow}>&#8599;</span>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
