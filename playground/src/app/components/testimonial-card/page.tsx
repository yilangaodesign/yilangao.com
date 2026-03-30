import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable } from "@/components/component-preview";

function LinkedInIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function TestimonialCardDemo({
  text,
  name,
  role,
  linkedinUrl,
}: {
  text: string;
  name: string;
  role: string;
  linkedinUrl?: string;
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const linkedinClasses =
    "absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-sm text-muted-foreground/50 shrink-0 transition-colors";

  return (
    <div className="relative flex flex-col gap-3 p-4 bg-muted/50 border border-border rounded-sm">
      {linkedinUrl ? (
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${linkedinClasses} hover:text-foreground hover:bg-muted`}
          aria-label={`${name}'s LinkedIn`}
        >
          <LinkedInIcon />
        </a>
      ) : (
        <span className={linkedinClasses} aria-hidden="true">
          <LinkedInIcon />
        </span>
      )}

      <div className="flex flex-col gap-1">
        <span
          className="text-6xl leading-[0.6] text-muted-foreground/30 select-none"
          style={{ fontFamily: "var(--font-geist-pixel-square), monospace" }}
          aria-hidden="true"
        >
          &ldquo;
        </span>
        <p className="text-sm italic text-muted-foreground leading-relaxed">
          {text}
        </p>
      </div>

      <div className="flex items-center gap-2 mt-auto">
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground/50 shrink-0">
          {initials}
        </div>
        <div className="flex flex-col gap-px flex-1 min-w-0">
          <span className="text-sm font-medium text-foreground leading-snug">
            {name}
          </span>
          <span className="text-xs text-muted-foreground/50 leading-snug">
            {role}
          </span>
        </div>
      </div>
    </div>
  );
}

const basicCode = `import TestimonialCard from "@/components/TestimonialCard";

export function Example() {
  return (
    <TestimonialCard
      text="Working with Yilan was a transformative experience. The attention to detail elevated our product."
      name="Sarah Chen"
      role="VP of Product, Acme Corp"
      linkedinUrl="https://linkedin.com/in/example"
    />
  );
}`;

const noLinkedinCode = `<TestimonialCard
  text="The design system became the foundation of everything we shipped."
  name="Jamie Okafor"
  role="CTO, Initech"
/>`;

const longQuoteCode = `<TestimonialCard
  text="Yilan has an extraordinary ability to synthesize complex user research into clear, actionable design direction. Our conversion rate improved 40% after the redesign."
  name="Priya Sharma"
  role="Head of Growth, Umbrella"
  linkedinUrl="https://linkedin.com/in/example"
/>`;

export default function TestimonialCardPage() {
  return (
    <Shell title="TestimonialCard">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="TestimonialCard"
          description="A quote card for user testimonials. Features a large decorative quotation mark in Geist Pixel Square, italic quote text, attribution with avatar initials, and a LinkedIn icon (always visible, linked when URL is provided). Designed to sit in the homepage masonry grid alongside project cards."
        />

        <ComponentPreview
          title="With LinkedIn URL"
          description="Full testimonial card with clickable LinkedIn icon."
          code={basicCode}
        >
          <div className="w-full flex justify-center">
            <div className="max-w-xs w-full">
              <TestimonialCardDemo
                text="Working with Yilan was a transformative experience. The attention to detail elevated our product."
                name="Sarah Chen"
                role="VP of Product, Acme Corp"
                linkedinUrl="#"
              />
            </div>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Without LinkedIn URL"
          description="LinkedIn icon still visible but non-interactive. The card design stays consistent."
          code={noLinkedinCode}
        >
          <div className="w-full flex justify-center">
            <div className="max-w-xs w-full">
              <TestimonialCardDemo
                text="The design system became the foundation of everything we shipped."
                name="Jamie Okafor"
                role="CTO, Initech"
              />
            </div>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Long quote"
          description="Longer quotes scale naturally — the card grows vertically in the masonry layout."
          code={longQuoteCode}
        >
          <div className="w-full flex justify-center">
            <div className="max-w-xs w-full">
              <TestimonialCardDemo
                text="Yilan has an extraordinary ability to synthesize complex user research into clear, actionable design direction. Our conversion rate improved 40% after the redesign."
                name="Priya Sharma"
                role="Head of Growth, Umbrella"
                linkedinUrl="#"
              />
            </div>
          </div>
        </ComponentPreview>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Props
          </h3>
          <PropsTable
            props={[
              {
                name: "text",
                type: "string",
                description: "The testimonial quote text. Rendered in italics.",
              },
              {
                name: "name",
                type: "string",
                description:
                  "Person's full name (also used for avatar initials).",
              },
              {
                name: "role",
                type: "string",
                description:
                  'Title and company, e.g. "VP of Product, Acme Corp".',
              },
              {
                name: "avatarUrl",
                type: "string | null",
                description:
                  "URL to a profile photo. Falls back to initials when empty.",
              },
              {
                name: "linkedinUrl",
                type: "string | null",
                description:
                  "LinkedIn profile URL. Icon is always visible; when a URL is provided it becomes a clickable link.",
              },
              {
                name: "id",
                type: "number",
                description:
                  "CMS document ID. Required for inline editing to work.",
              },
              {
                name: "isAdmin",
                type: "boolean",
                description:
                  "When true, text fields become inline-editable and an EditButton appears.",
              },
            ]}
          />
        </div>

        <div className="text-xs font-mono text-muted-foreground p-3 rounded-sm bg-muted/50">
          src/components/TestimonialCard.tsx
        </div>
      </div>
    </Shell>
  );
}
