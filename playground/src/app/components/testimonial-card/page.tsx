import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading} from "@/components/component-preview";
import TestimonialCard from "@ds/TestimonialCard/TestimonialCard";

const basicCode = `import TestimonialCard from "@/components/ui/TestimonialCard";

<TestimonialCard
  text="Working with Yilan was a transformative experience. The attention to detail elevated our product."
  name="Sarah Chen"
  role="VP of Product, Acme Corp"
  linkedinUrl="https://linkedin.com/in/example"
/>`;

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

const withConnectionNoteCode = `<TestimonialCard
  text="Working with Yilan raised the bar for craft and clarity across our product org."
  name="Alex Rivera"
  role="Design Director, Northwind"
  linkedinUrl="https://linkedin.com/in/example"
  connectionNote="We met through the Design Systems Collective; later collaborated on the 2024 audit."
/>`;

export default function TestimonialCardPage() {
  return (
    <Shell title="TestimonialCard">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="TestimonialCard"
          description="A quote card for user testimonials: quotation mark, italic quote, attribution (avatar, name, role, LinkedIn). Optionally pass connectionNote to show an info tooltip about how you met the author or your relationship to them. Omit it when that context is not needed. Supports CMS inline editing when isAdmin=true."
        />

        <ComponentPreview
          title="With LinkedIn URL (no connection note)"
          description="Default variant: no info icon. Pass connectionNote only when you want the relationship / how-we-met tooltip."
          code={basicCode}
        >
          <div className="w-full flex justify-center">
            <div className="max-w-xs w-full">
              <TestimonialCard
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
              <TestimonialCard
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
              <TestimonialCard
                text="Yilan has an extraordinary ability to synthesize complex user research into clear, actionable design direction. Our conversion rate improved 40% after the redesign."
                name="Priya Sharma"
                role="Head of Growth, Umbrella"
                linkedinUrl="#"
              />
            </div>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="With connection note (how we met)"
          description="When connectionNote is set, an info icon appears (bottom-aligned with attribution). Hover for tooltip copy about relationship to the author."
          code={withConnectionNoteCode}
        >
          <div className="w-full flex justify-center">
            <div className="max-w-xs w-full">
              <TestimonialCard
                text="Working with Yilan raised the bar for craft and clarity across our product org."
                name="Alex Rivera"
                role="Design Director, Northwind"
                linkedinUrl="#"
                connectionNote="We met through the Design Systems Collective; later collaborated on the 2024 audit."
              />
            </div>
          </div>
        </ComponentPreview>

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
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
                description: "Person's full name (also used for avatar initials).",
              },
              {
                name: "role",
                type: "string",
                description: 'Title and company, e.g. "VP of Product, Acme Corp".',
              },
              {
                name: "avatarUrl",
                type: "string | null",
                description: "URL to a profile photo. Falls back to initials when empty.",
              },
              {
                name: "linkedinUrl",
                type: "string | null",
                description: "LinkedIn profile URL. Icon is always visible; when a URL is provided it becomes a clickable link.",
              },
              {
                name: "id",
                type: "number",
                description: "CMS document ID. Required for inline editing to work.",
              },
              {
                name: "isAdmin",
                type: "boolean",
                description: "When true, text fields become inline-editable and an EditButton appears.",
              },
              {
                name: "connectionNote",
                type: "ReactNode",
                description:
                  "Optional. When provided (non-empty), shows the info icon with this tooltip body — typically how you met the author or your relationship to Yilan. Omit for cards without that context.",
              },
            ]}
          />
        </div>

        <SourcePath path="src/components/TestimonialCard.tsx · src/components/TestimonialCard.module.scss" />
      </div>
    </Shell>
  );
}
