import { getPayloadClient } from "@/lib/payload";
import { extractLexicalText, lexicalToHtml } from "@/lib/lexical";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { RefreshRouteOnSave } from "@/components/RefreshRouteOnSave";
import ContactClient from "./ContactClient";

const FALLBACK_TESTIMONIALS = [
  {
    text: "Working with Yilan was a transformative experience. The attention to detail and user-centered thinking elevated our product beyond expectations.",
    name: "Name Surname",
    role: "VP of Product, Company",
  },
  {
    text: "Yilan brings a rare combination of technical understanding and design sensibility. Every interaction was thoughtful and intentional.",
    name: "Name Surname",
    role: "Engineering Lead, Company",
  },
  {
    text: "The design system Yilan built for us became the foundation of everything we shipped. It was elegant, scalable, and a joy to work with.",
    name: "Name Surname",
    role: "CTO, Company",
  },
];

const FALLBACK_CLIENTS = [
  { name: "Acme Corp", url: "" }, { name: "Globex", url: "" }, { name: "Initech", url: "" }, { name: "Umbrella", url: "" }, { name: "Stark Ind", url: "" },
  { name: "Wayne Corp", url: "" }, { name: "Cyberdyne", url: "" }, { name: "Soylent", url: "" }, { name: "Tyrell", url: "" }, { name: "Weyland", url: "" },
];

export default async function ContactPage() {
  let testimonials: { id?: string | number; text: string; textHtml?: string; name: string; role: string }[] = FALLBACK_TESTIMONIALS;
  let clients: { name: string; url: string }[] = FALLBACK_CLIENTS;
  const isAdmin = await isAdminAuthenticated();

  try {
    const payload = await getPayloadClient();

    const testimonialsRes = await payload.find({
      collection: "testimonials",
      sort: "order",
      limit: 50,
    });

    if (testimonialsRes.docs.length > 0) {
      testimonials = testimonialsRes.docs.map((t) => {
        const textHtml = lexicalToHtml(t.text);
        const plain = extractLexicalText(t.text);
        return {
          id: t.id,
          text: plain,
          textHtml: textHtml !== plain ? textHtml : undefined,
          name: t.name,
          role: t.role,
        };
      });
    }

    const config = await payload.findGlobal({ slug: "site-config" });
    if (config?.clients && config.clients.length > 0) {
      clients = config.clients.map((c: { name: string; url?: string | null }) => ({
        name: c.name,
        url: c.url ?? "",
      }));
    }
  } catch {
    // Payload not connected — use fallback data
  }

  return (
    <>
      <RefreshRouteOnSave />
      <ContactClient testimonials={testimonials} clients={clients} isAdmin={isAdmin} />
    </>
  );
}
