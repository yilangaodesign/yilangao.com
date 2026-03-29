"use client";

import { FadeIn } from "@yilangaodesign/design-system";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AdminBar from "@/components/AdminBar";
import EditButton from "@/components/EditButton";
import styles from "./page.module.scss";

type Book = { id?: number; title: string; url: string };

export default function ReadingClient({ books, isAdmin }: { books: Book[]; isAdmin?: boolean }) {
  return (
    <main className={styles.page} style={isAdmin ? { paddingTop: 44 } : undefined}>
      {isAdmin && <AdminBar editUrl="/admin/collections/books" editLabel="Manage Books" />}
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
              <li key={book.id ?? book.title}>
                <a href={book.url} className={styles.bookLink}>{book.title}</a>
                {isAdmin && book.id && <EditButton collection="books" id={book.id} label={`Edit ${book.title}`} />}
              </li>
            ))}
          </ul>
        </FadeIn>
      </div>
      <Footer />
    </main>
  );
}
