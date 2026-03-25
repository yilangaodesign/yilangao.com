export default function Home() {
  return (
    <main style={{
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "6rem var(--page-padding)",
    }}>
      <h1 style={{
        fontSize: "clamp(2rem, 5vw, 3.5rem)",
        fontWeight: 700,
        lineHeight: 1.15,
        letterSpacing: "-0.02em",
        marginBottom: "1.5rem",
      }}>
        Yilan Gao
      </h1>
      <p style={{
        fontSize: "1.25rem",
        color: "var(--color-text-muted)",
        maxWidth: "560px",
        lineHeight: 1.6,
      }}>
        UX Designer crafting thoughtful digital experiences.
      </p>
    </main>
  );
}
