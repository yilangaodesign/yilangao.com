import { notFound } from "next/navigation";
import { getPayloadClient } from "@/lib/payload";
import { extractLexicalText, lexicalToHtml } from "@/lib/lexical";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getCompanyFromSession } from "@/lib/company-session";
import { getCompanyBySlug } from "@/lib/company-data";
import { RefreshRouteOnSave } from "@/components/RefreshRouteOnSave";
import ProjectClient from "./ProjectClient";

const HERO_METRICS: Record<string, { value: string; label: string }> = {
  lacework: { value: "2×", label: "page discoverability" },
  "elan-design-system": { value: "47+", label: "incidents documented → systemic fixes" },
  meteor: { value: "95%", label: "noise reduction" },
};

const INLINE_LINKS: Record<string, Record<string, string>> = {
  lacework: {
    "Lacework": "https://www.lacework.net",
    "Fortinet": "https://www.fortinet.com",
    "FortiCNAPP": "https://www.fortinet.com/products/cloud-security/forticnapp",
    "Snowflake": "https://www.snowflake.com",
    "LendingTree": "https://www.lendingtree.com",
  },
  "elan-design-system": {
    "IBM Carbon": "https://carbondesignsystem.com",
    "Radix UI": "https://www.radix-ui.com",
    "Framer Motion": "https://www.framer.com/motion",
    "Geist": "https://vercel.com/font",
  },
  meteor: {
    "Goldman Sachs": "https://www.goldmansachs.com",
  },
};

const COVER_IMAGES: Record<string, string> = {
  "elan-design-system": "/images/elan-cover.svg",
};

const INTERACTIVE_VISUALS: Record<string, Record<string, { component: string; playgroundUrl: string; playgroundLabel: string }>> = {
  "elan-design-system": {
    "Agent Harness Architecture": {
      component: "EscalationTimeline",
      playgroundUrl: "http://localhost:4001",
      playgroundLabel: "View the full design system →",
    },
    "Agent-Native Semantic Tokens": {
      component: "TokenGrid",
      playgroundUrl: "http://localhost:4001/tokens/colors",
      playgroundLabel: "Explore the full color system in the playground →",
    },
    "Systemic Pattern Map": {
      component: "IncidentDensityMap",
      playgroundUrl: "http://localhost:4001",
      playgroundLabel: "Explore the full design system →",
    },
    "ScrollSpy — A Micro-Interaction Deep Dive": {
      component: "InteractionShowcase",
      playgroundUrl: "http://localhost:4001/components/scroll-spy",
      playgroundLabel: "Try the ScrollSpy in the playground →",
    },
  },
};

const IMAGE_PLACEHOLDERS: Record<string, string[]> = {
  "Restructured Navigation": [
    "Before: Old navigation with License buried 5 layers deep",
    "After: New Account section at 3rd level with clean grouping",
    "Full product screenshot showing new navigation in context",
  ],
  "Interactive Usage Trends": [
    "Usage page with interactive trend chart and time selector",
    "Detail: trend chart at monthly vs. daily granularity",
    "Usage breakdown table with per-resource deployment counts",
  ],
  "At-a-Glance Overage Status": [
    "Subscription page with speedometer gauge overview",
    "Speedometer in three states: healthy, approaching, overage",
    "Subscription history timeline with past changes",
  ],
  "In-App Service Discovery": [
    "Before/after: old static subscription vs. new service tiers",
    "In-app pricing plan comparison table with feature matrix",
    "Consumption-based pricing plan card detail",
  ],
  "The Trust Problem": [
    "Before: Daily workflow with multi-loop vendor correction cycle",
    "After: Streamlined Meteor workflow — auto-generate, flag, review, confirm",
    "12,000 → 560: Visual noise reduction comparison",
    "Sanitized screenshot of basket review interface showing flagged vs. unflagged lines",
  ],
  "Leverage-Based Scoping": [
    "ETF Portfolio Management Cycle: Fund Launch → Holdings → Basket → Order",
    "Coverage matrix: FI/EQ × lifecycle stages with existing tools mapped",
    "Upstream → Downstream funnel: basket management as the highest-leverage bottleneck",
  ],
  "Adoption Sequencing": [
    "A Tale of Two Teams: EQ vs. FI adoption readiness comparison",
    "User research insights: side-by-side EQ (desperate for change) vs. FI (entrenched habits)",
    "Scoping matrix with EQ 1st Priority / FI 2nd Priority annotations",
  ],
  "ETRO — Progressive Trust Calibration": [
    "Explainability: Severity tier reasoning — flagged row with reasoning tag + decision tree",
    "Traceability: Corporate actions diff view — before state, after state, delta",
    "Traceability detail: Corner notch indicator showing what changed and by how much",
    "Reversibility: Pro-rata calculation sandbox with preview before committing",
    "Observability: Override justification flow — deliberate friction for audit trail",
  ],
};

const FALLBACK_PROJECT = {
  title: "Project Title",
  category: "Digital toolmaking",
  description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  descriptionHtml: undefined as string | undefined,
  heroMetric: undefined as { value: string; label: string } | undefined,
  inlineLinks: {} as Record<string, string>,
  role: "Product Designer",
  collaborators: [{ name: "Name Surname" }, { name: "Name Surname" }, { name: "Design Team" }],
  duration: "~6 months",
  tools: [{ name: "Figma" }, { name: "React" }],
  externalLinks: [
    { label: "Website", href: "#" },
    { label: "Twitter", href: "#" },
  ],
  sections: [
    { heading: "Section Heading One", body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", bodyHtml: undefined as string | undefined, imageCount: 2, imagePlaceholders: [] as string[], caption: "Caption describing the images above." },
    { heading: "Section Heading Two", body: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.", bodyHtml: undefined as string | undefined, imageCount: 1, imagePlaceholders: [] as string[], caption: null },
    { heading: "Section Heading Three", body: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.", bodyHtml: undefined as string | undefined, imageCount: 3, imagePlaceholders: [] as string[], caption: "Additional context about the three images." },
    { heading: "Section Heading Four", body: "At vero eos et accusamus et iusto odio dignissimos ducimus.", bodyHtml: undefined as string | undefined, imageCount: 2, imagePlaceholders: [] as string[], caption: null },
  ],
};

type AdjacentProject = { slug: string; title: string } | null;

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;

  let project: typeof FALLBACK_PROJECT & { id?: string | number } = FALLBACK_PROJECT;
  let prevProject: AdjacentProject = null;
  let nextProject: AdjacentProject = null;
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
      const descPlain = extractLexicalText(doc.description) || "Project description.";
      const descHtml = lexicalToHtml(doc.description);

      project = {
        id: doc.id,
        title: doc.title,
        category: doc.category,
        description: descPlain,
        descriptionHtml: descHtml !== descPlain ? descHtml : undefined,
        heroMetric: HERO_METRICS[doc.slug] ?? undefined,
        inlineLinks: INLINE_LINKS[doc.slug] ?? {},
        role: doc.role ?? "Designer",
        collaborators: doc.collaborators?.map((c: { name: string }) => ({ name: c.name })) ?? [],
        duration: doc.duration ?? "",
        tools: doc.tools?.map((t: { name: string }) => ({ name: t.name })) ?? [],
        externalLinks: doc.externalLinks?.map((l: { label: string; href: string }) => ({
          label: l.label,
          href: l.href,
        })) ?? [],
        sections: doc.sections?.map((s: { heading: string; body?: unknown; images?: { image: unknown }[]; caption?: string | null }) => {
          const realImageCount = s.images?.length ?? 0;
          const bodyPlain = extractLexicalText(s.body) || "Section content.";
          const bodyHtml = lexicalToHtml(s.body);
          return {
            heading: s.heading,
            body: bodyPlain,
            bodyHtml: bodyHtml !== bodyPlain ? bodyHtml : undefined,
            imageCount: realImageCount,
            imagePlaceholders: realImageCount === 0 ? (IMAGE_PLACEHOLDERS[s.heading] ?? []) : [],
            caption: s.caption ?? null,
          };
        }) ?? [],
      };

      const currentOrder = doc.order ?? 0;

      const [prevRes, nextRes] = await Promise.all([
        payload.find({
          collection: "projects",
          where: { order: { less_than: currentOrder } },
          sort: "-order",
          limit: 1,
        }),
        payload.find({
          collection: "projects",
          where: { order: { greater_than: currentOrder } },
          sort: "order",
          limit: 1,
        }),
      ]);

      if (prevRes.docs.length > 0) {
        prevProject = { slug: prevRes.docs[0].slug, title: prevRes.docs[0].title };
      }
      if (nextRes.docs.length > 0) {
        nextProject = { slug: nextRes.docs[0].slug, title: nextRes.docs[0].title };
      }
    } else {
      notFound();
    }
  } catch {
    // Payload not connected — use fallback data
  }

  const interactiveVisuals = INTERACTIVE_VISUALS[slug] ?? undefined;
  const coverImage = COVER_IMAGES[slug] ?? undefined;

  let companyNote: { companyName: string; note: string } | undefined;
  const companySess = await getCompanyFromSession();
  if (companySess) {
    const companyConfig = await getCompanyBySlug(companySess);
    if (companyConfig) {
      const noteEntry = companyConfig.caseStudyNotes.find((n) => n.projectSlug === slug);
      if (noteEntry) {
        companyNote = { companyName: companyConfig.name, note: noteEntry.note };
      }
    }
  }

  return (
    <>
      <RefreshRouteOnSave />
      <ProjectClient
        project={project}
        prevProject={prevProject}
        nextProject={nextProject}
        isAdmin={isAdmin}
        interactiveVisuals={interactiveVisuals}
        coverImage={coverImage}
        companyNote={companyNote}
      />
    </>
  );
}
