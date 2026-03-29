import { getPayloadClient } from "@/lib/payload";
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
  "Acme Corp", "Globex", "Initech", "Umbrella", "Stark Ind",
  "Wayne Corp", "Cyberdyne", "Soylent", "Tyrell", "Weyland",
];

export default async function ContactPage() {
  let testimonials: { id?: number; text: string; name: string; role: string }[] = FALLBACK_TESTIMONIALS;
  let clients = FALLBACK_CLIENTS;
  const isAdmin = await isAdminAuthenticated();

  try {
    const payload = await getPayloadClient();

    const testimonialsRes = await payload.find({
      collection: "testimonials",
      sort: "order",
      limit: 50,
    });

    if (testimonialsRes.docs.length > 0) {
      testimonials = testimonialsRes.docs.map((t) => ({
        id: t.id,
        text: t.text,
        name: t.name,
        role: t.role,
      }));
    }

    const config = await payload.findGlobal({ slug: "site-config" });
    if (config?.clients && config.clients.length > 0) {
      clients = config.clients.map((c: { name: string }) => c.name);
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
