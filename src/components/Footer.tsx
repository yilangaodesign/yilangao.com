export default function Footer() {
  return (
    <footer style={{
      padding: "3rem var(--page-padding)",
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      width: "100%",
      borderTop: "1px solid var(--color-border)",
      color: "var(--color-text-muted)",
      fontSize: "0.875rem",
    }}>
      <p>&copy; {new Date().getFullYear()} Yilan Gao</p>
    </footer>
  );
}
