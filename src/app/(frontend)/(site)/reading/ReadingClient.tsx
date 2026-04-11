"use client";

import { FadeIn } from "@/components/ui/FadeIn";
import Navigation from "@/components/ui/Navigation/Navigation";
import AdminBar from "@/components/AdminBar";
import EditButton from "@/components/EditButton";
import {
  InlineEditProvider,
  EditableText,
  InlineEditBar,
} from "@/components/inline-edit";
import type { ApiTarget } from "@/components/inline-edit";
import styles from "./page.module.scss";

type Book = { id?: string | number; title: string; url: string };

function bookTarget(id: string | number): ApiTarget {
  return { type: 'collection', slug: 'books', id };
}

export default function ReadingClient({ books, isAdmin }: { books: Book[]; isAdmin?: boolean }) {
  const page = (
    <main className={styles.page}>
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
                {book.id ? (
                  <EditableText
                    fieldId={`book:${book.id}:title`}
                    target={bookTarget(book.id)}
                    fieldPath="title"
                    as="a"
                    className={styles.bookLink}
                    label="Title"
                  >
                    {book.title}
                  </EditableText>
                ) : (
                  <a href={book.url} className={styles.bookLink}>{book.title}</a>
                )}
                {isAdmin && book.id && <EditButton collection="books" id={book.id} label={`Edit ${book.title}`} />}
              </li>
            ))}
          </ul>
        </FadeIn>
      </div>
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
