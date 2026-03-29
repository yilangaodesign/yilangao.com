import { notFound } from "next/navigation";
import { getPayloadClient } from "@/lib/payload";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { RefreshRouteOnSave } from "@/components/RefreshRouteOnSave";
import ProjectClient from "./ProjectClient";

const FALLBACK_PROJECT = {
  title: "Project Title",
  category: "Digital toolmaking",
  description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  role: "Product Designer",
  collaborators: ["Name Surname", "Name Surname", "Design Team"],
  duration: "2024 – Present",
  tools: ["Figma", "React"],
  externalLinks: [
    { label: "Website", href: "#" },
    { label: "Twitter", href: "#" },
  ],
  sections: [
    { heading: "Section Heading One", body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", imageCount: 2, caption: "Caption describing the images above." },
    { heading: "Section Heading Two", body: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.", imageCount: 1, caption: null },
    { heading: "Section Heading Three", body: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.", imageCount: 3, caption: "Additional context about the three images." },
    { heading: "Section Heading Four", body: "At vero eos et accusamus et iusto odio dignissimos ducimus.", imageCount: 2, caption: null },
  ],
};

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;

  let project: typeof FALLBACK_PROJECT & { id?: number } = FALLBACK_PROJECT;
  const isAdmin = await isAdminAuthenticated();

  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: "projects",
      where: { slug: { equals: slug } },
      limit: 1,
    });

    if (res.docs.length > 0) {
      const doc = res.docs[0];
      project = {
        id: doc.id,
        title: doc.title,
        category: doc.category,
        description: typeof doc.description === "string" ? doc.description : "Project description.",
        role: doc.role ?? "Designer",
        collaborators: doc.collaborators?.map((c: { name: string }) => c.name) ?? [],
        duration: doc.duration ?? "",
        tools: doc.tools?.map((t: { name: string }) => t.name) ?? [],
        externalLinks: doc.externalLinks?.map((l: { label: string; href: string }) => ({
          label: l.label,
          href: l.href,
        })) ?? [],
        sections: doc.sections?.map((s: { heading: string; body?: unknown; images?: { image: unknown }[]; caption?: string | null }) => ({
          heading: s.heading,
          body: typeof s.body === "string" ? s.body : "Section content.",
          imageCount: s.images?.length ?? 0,
          caption: s.caption ?? null,
        })) ?? [],
      };
    } else {
      notFound();
    }
  } catch {
    // Payload not connected — use fallback data
  }

  return (
    <>
      <RefreshRouteOnSave />
      <ProjectClient project={project} isAdmin={isAdmin} />
    </>
  );
}
