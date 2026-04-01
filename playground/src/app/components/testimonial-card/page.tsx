import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading} from "@/components/component-preview";
import TestimonialCard from "@ds/TestimonialCard/TestimonialCard";

const basicCode = `import TestimonialCard from "@/components/TestimonialCard";

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

export default function TestimonialCardPage() {
  return (
    <Shell title="TestimonialCard">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="TestimonialCard"
          description="A quote card for user testimonials. Features a decorative quotation mark, italic quote text, attribution with avatar initials, and a LinkedIn icon. Designed for the homepage masonry grid alongside project cards. Supports CMS inline editing when isAdmin=true."
        />

        <ComponentPreview
          title="With LinkedIn URL"
          description="Full testimonial card with clickable LinkedIn icon."
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
            ]}
          />
        </div>

        <SourcePath path="src/components/TestimonialCard.tsx · src/components/TestimonialCard.module.scss" />
      </div>
    </Shell>
  );
}
