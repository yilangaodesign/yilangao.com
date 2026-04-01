import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading} from "@/components/component-preview";
import Footer from "@ds/Footer/Footer";

const code = `import Footer from "@/components/Footer";

// Footer is self-contained — no props needed.
// Renders copyright text and social links.

<Footer />`;

export default function FooterPage() {
  return (
    <Shell title="Footer">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Footer"
          description="Site footer with copyright text and social links. Styled via SCSS modules. Server component — no client-side JS."
        />

        <ComponentPreview
          title="Default"
          description="Standard footer layout with copyright notice and social links."
          code={code}
        >
          <div className="w-full max-w-3xl border border-border rounded-sm overflow-hidden">
            <Footer />
          </div>
        </ComponentPreview>

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
          <PropsTable
            props={[
              { name: "(none)", type: "—", description: "Self-contained — year is computed automatically." },
            ]}
          />
        </div>

        <div>
          <SubsectionHeading>Notes</SubsectionHeading>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-accent shrink-0">&bull;</span>
              Server component — no client-side JavaScript.
            </li>
            <li className="flex gap-2">
              <span className="text-accent shrink-0">&bull;</span>
              Styled via SCSS modules (<code className="text-xs bg-muted px-1.5 py-0.5 rounded-sm font-mono">Footer.module.scss</code>), not inline styles.
            </li>
          </ul>
        </div>

        <SourcePath path="src/components/Footer.tsx · src/components/Footer.module.scss" />
      </div>
    </Shell>
  );
}
