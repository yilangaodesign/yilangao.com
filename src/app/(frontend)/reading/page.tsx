import { getPayloadClient } from "@/lib/payload";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { RefreshRouteOnSave } from "@/components/RefreshRouteOnSave";
import ReadingClient from "./ReadingClient";

const FALLBACK_BOOKS = [
  { title: "Book Title One", url: "#" },
  { title: "Book Title Two", url: "#" },
  { title: "Book Title Three: A Subtitle Here", url: "#" },
  { title: "Book Title Four", url: "#" },
  { title: "Book Title Five", url: "#" },
  { title: "Book Title Six: Extended Edition", url: "#" },
  { title: "Book Title Seven", url: "#" },
  { title: "Book Title Eight", url: "#" },
  { title: "Book Title Nine: The Complete Guide", url: "#" },
  { title: "Book Title Ten", url: "#" },
];

export default async function ReadingPage() {
  let books: { id?: number; title: string; url: string }[] = FALLBACK_BOOKS;
  const isAdmin = await isAdminAuthenticated();

  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: "books",
      sort: "order",
      limit: 100,
    });

    if (res.docs.length > 0) {
      books = res.docs.map((b) => ({
        id: b.id,
        title: b.title,
        url: b.url ?? "#",
      }));
    }
  } catch {
    // Payload not connected — use fallback data
  }

  return (
    <>
      <RefreshRouteOnSave />
      <ReadingClient books={books} isAdmin={isAdmin} />
    </>
  );
}
