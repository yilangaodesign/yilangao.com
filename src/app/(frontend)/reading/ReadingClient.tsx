"use client";

import { FadeIn } from "@yilangaodesign/design-system";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import styles from "./page.module.scss";

type Book = { title: string; url: string };

export default function ReadingClient({ books }: { books: Book[] }) {
  return (
    <main className={styles.page}>
      <Navigation />
      <div className={styles.container}>
        <FadeIn>
          <header className={styles.header}>
            <p className={styles.intro}>
              Reading sharpens my craft and broadens my understanding of the world.
              Many of my best ideas come from applying tangential topics, such as
              linguistics or architecture, to software design. Lorem ipsum dolor sit
              amet, consectetur adipiscing elit.
            </p>
          </header>
        </FadeIn>

        <FadeIn delay={0.15}>
          <ul className={styles.bookList}>
            {books.map((book) => (
              <li key={book.title}>
                <a href={book.url} className={styles.bookLink}>{book.title}</a>
              </li>
            ))}
          </ul>
        </FadeIn>
      </div>
      <Footer />
    </main>
  );
}
