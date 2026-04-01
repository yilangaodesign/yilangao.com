import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading} from "@/components/component-preview";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from "@ds/Card";

const basicCode = `import { Card, CardBody } from "@ds/Card";

export function BasicCard() {
  return (
    <Card className="max-w-sm">
      <CardBody>
        <p className="text-sm text-foreground">
          A short description or summary for this surface.
        </p>
      </CardBody>
    </Card>
  );
}`;

const structuredCode = `import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from "@ds/Card";

export function StructuredCard() {
  return (
    <Card className="max-w-sm">
      <CardHeader>
        <h3 className="text-sm font-semibold">Project title</h3>
      </CardHeader>
      <CardBody>
        <p className="text-sm text-muted-foreground">
          Body copy uses the default section padding.
        </p>
      </CardBody>
      <CardFooter>
        <span className="text-xs text-muted-foreground">Footer meta</span>
      </CardFooter>
    </Card>
  );
}`;

const elevatedCode = `import { Card, CardBody } from "@ds/Card";

export function ElevatedCard() {
  return (
    <Card elevated className="max-w-sm">
      <CardBody>
        <p className="text-sm text-foreground">
          Adds a subtle shadow for emphasis over the default surface.
        </p>
      </CardBody>
    </Card>
  );
}`;

const interactiveCode = `import { Card, CardBody } from "@ds/Card";

export function InteractiveCard() {
  return (
    <Card interactive className="max-w-sm">
      <CardBody>
        <p className="text-sm text-foreground">
          Hover to lift the border and shadow — use with clickable rows or links.
        </p>
      </CardBody>
    </Card>
  );
}`;

export default function CardPage() {
  return (
    <Shell title="Card">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Card"
          description="Surface container with optional CardHeader, CardBody, and CardFooter slots. Use elevated for light shadow and interactive for hover affordance on tappable surfaces."
        />

        <ComponentPreview
          title="Basic card"
          description="Card wrapping body content. Sub-components apply design-system padding and borders."
          code={basicCode}
        >
          <div className="w-full flex justify-center">
            <Card className="max-w-sm w-full">
              <CardBody>
                <p className="text-sm text-foreground">
                  A short description or summary for this surface.
                </p>
              </CardBody>
            </Card>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Card with header, body, and footer"
          description="Structured layout with header rule, padded body, and footer rule."
          code={structuredCode}
        >
          <div className="w-full flex justify-center">
            <Card className="max-w-sm w-full">
              <CardHeader>
                <h3 className="text-sm font-semibold">Project title</h3>
              </CardHeader>
              <CardBody>
                <p className="text-sm text-muted-foreground">
                  Body copy uses the default section padding.
                </p>
              </CardBody>
              <CardFooter>
                <span className="text-xs text-muted-foreground">Footer meta</span>
              </CardFooter>
            </Card>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Elevated card"
          description="Sets elevated to add a small shadow without interaction affordance."
          code={elevatedCode}
        >
          <div className="w-full flex justify-center">
            <Card elevated className="max-w-sm w-full">
              <CardBody>
                <p className="text-sm text-foreground">
                  Adds a subtle shadow for emphasis over the default surface.
                </p>
              </CardBody>
            </Card>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Interactive card"
          description="Sets interactive for hover elevation and stronger border — pair with links or buttons inside."
          code={interactiveCode}
        >
          <div className="w-full flex justify-center">
            <Card interactive className="max-w-sm w-full">
              <CardBody>
                <p className="text-sm text-foreground">
                  Hover to lift the border and shadow — use with clickable rows or links.
                </p>
              </CardBody>
            </Card>
          </div>
        </ComponentPreview>

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
          <p className="text-xs text-muted-foreground mb-4">Card</p>
          <PropsTable
            props={[
              {
                name: "elevated",
                type: "boolean",
                default: "false",
                description: "Applies a subtle box shadow for emphasis.",
              },
              {
                name: "interactive",
                type: "boolean",
                default: "false",
                description: "Adds hover styles (shadow and border) for tappable surfaces.",
              },
              {
                name: "className",
                type: "string",
                description: "Merged onto the root element after variant classes.",
              },
              {
                name: "children",
                type: "ReactNode",
                description: "CardHeader, CardBody, CardFooter, or arbitrary content.",
              },
            ]}
          />
          <p className="text-xs text-muted-foreground mt-6 mb-4">
            CardHeader · CardBody · CardFooter
          </p>
          <PropsTable
            props={[
              {
                name: "children",
                type: "ReactNode",
                description: "Slot content for each section.",
              },
              {
                name: "className",
                type: "string",
                description: "Merged after the section layout classes.",
              },
            ]}
          />
        </div>

        <SourcePath path="src/components/ui/Card/Card.tsx" />
      </div>
    </Shell>
  );
}
