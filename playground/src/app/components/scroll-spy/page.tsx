"use client";

import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading} from "@/components/component-preview";
import ScrollSpy from "@ds/ScrollSpy/ScrollSpy";
import type { ScrollSpySection } from "@ds/ScrollSpy/ScrollSpy";

const demoSections: ScrollSpySection[] = [
  { id: "demo-overview", label: "Overview", group: "Basics" },
  { id: "demo-tracking", label: "Tracking", depth: 1 },
  { id: "demo-interaction", label: "Interaction", depth: 1 },
  { id: "demo-api", label: "API", group: "Reference" },
  { id: "demo-hierarchy", label: "Hierarchy", depth: 1 },
  { id: "demo-notes", label: "Notes", depth: 1 },
];

const sectionContent = [
  "This is the overview section. Scroll down to see the active indicator change on the right rail. Notice how section ticks (wider) differ from subsection ticks (narrower).",
  "Tracking — the scroll spy tracks which section is in view using IntersectionObserver and highlights the corresponding tick. Subsection ticks use a shorter active width (22px vs 28px).",
  "Interaction — click any tick on the right to scroll to that section. Click and drag to snap between sections. Both section and subsection ticks are interactive.",
  "API section — the component accepts a sections array with id, label, and optional depth and group fields. A gap appears between the two groups above.",
  "Hierarchy — use depth: 1 to mark subsections. Subsection ticks are narrower and use dimmer colors to communicate subordination.",
  "Notes — the component is hidden on mobile. On desktop, it appears fixed on the right edge of the viewport. The group prop creates whitespace-based grouping between sections.",
];

const scrollSpyCode = `import ScrollSpy from "@/components/ui/ScrollSpy";
import type { ScrollSpySection } from "@/components/ui/ScrollSpy";

const sections: ScrollSpySection[] = [
  { id: "overview", label: "Overview", group: "Basics" },
  { id: "tracking", label: "Tracking", depth: 1 },
  { id: "interaction", label: "Interaction", depth: 1 },
  { id: "api", label: "API", group: "Reference" },
  { id: "examples", label: "Examples", depth: 1 },
];

<main>
  <ScrollSpy sections={sections} />
  <section id="overview">...</section>
  <section id="tracking">...</section>
  ...
</main>`;

export default function ScrollSpyPage() {
  return (
    <Shell title="ScrollSpy">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="ScrollSpy"
          description="A fixed vertical rail of section indicators on the right edge of the viewport. Tracks the active section via IntersectionObserver, supports click-to-scroll and drag-to-snap navigation. Hidden on mobile."
        />

        <ComponentPreview
          title="Live Component"
          description="The ScrollSpy is rendered at fixed position on the right edge. Scroll this page to see it respond, or hover the rail to see ticks expand with labels. Note: it uses document-level scrolling, so it tracks sections on this page."
          code={scrollSpyCode}
        >
          <div className="text-sm text-muted-foreground text-center py-4">
            ScrollSpy is rendered at viewport-fixed position (right edge).
            Add <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">id</code> attributes
            to page sections for it to track.
          </div>
        </ComponentPreview>

        <ScrollSpy sections={demoSections} />

        {demoSections.map((section, i) => (
          <section key={section.id} id={section.id} className="min-h-[200px] p-6 border border-border rounded-sm bg-muted/20">
            <h3 className="text-sm font-medium mb-2">{section.label}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {sectionContent[i]}
            </p>
          </section>
        ))}

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
          <PropsTable
            props={[
              {
                name: "sections",
                type: "ScrollSpySection[]",
                description: "Array of { id, label, depth?, group? } objects. Each id must match a DOM element's id attribute.",
              },
            ]}
          />
        </div>

        <div>
          <SubsectionHeading>ScrollSpySection Type</SubsectionHeading>
          <PropsTable
            props={[
              {
                name: "id",
                type: "string",
                description: "The DOM id of the section element to observe and scroll to.",
              },
              {
                name: "label",
                type: "string",
                description: "Display label shown on hover and during drag.",
              },
              {
                name: "depth",
                type: "0 | 1",
                description: "Hierarchy level. 0 (default) = section tick (16px). 1 = subsection tick (10px, dimmer, shorter active width).",
              },
              {
                name: "group",
                type: "string",
                description: "Grouping key. When a section's group differs from the previous section's group, extra whitespace is inserted to visually separate groups.",
              },
            ]}
          />
        </div>

        <div>
          <SubsectionHeading>Interaction States</SubsectionHeading>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-accent shrink-0">&bull;</span>
              <span><strong>Idle:</strong> Section ticks at 16px, subsection ticks at 10px (dimmer). Active tick widens: 28px for sections, 22px for subsections.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">&bull;</span>
              <span><strong>Rail hover:</strong> All non-active ticks widen. Individual tick hover shows label tooltip.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">&bull;</span>
              <span><strong>Drag:</strong> Pointer down activates drag mode. Moving the pointer snaps to the nearest notch with instant scroll.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">&bull;</span>
              <span><strong>Click:</strong> Clicking a notch scrolls to that section smoothly.</span>
            </li>
          </ul>
        </div>

        <div>
          <SubsectionHeading>Technical Notes</SubsectionHeading>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-accent shrink-0">&bull;</span>
              <span>Uses <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">setPointerCapture</code> for drag, keeping all events on the track element.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">&bull;</span>
              <span>IntersectionObserver callbacks are skipped during drag via a ref check.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">&bull;</span>
              <span>State styling uses <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">data-active</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">data-dragging</code>, and <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">data-hovered</code> attributes.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">&bull;</span>
              <span>Hidden below <code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">lg</code> breakpoint.</span>
            </li>
          </ul>
        </div>

        <SourcePath path="src/components/ScrollSpy.tsx · src/components/ScrollSpy.module.scss" />
      </div>
    </Shell>
  );
}
