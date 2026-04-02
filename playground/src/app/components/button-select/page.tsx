"use client";

import { useState } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import {
  ComponentPreview,
  PropsTable,
  SourcePath,
  SubsectionHeading,
} from "@/components/component-preview";
import { ButtonSelect, ButtonSelectItem } from "@ds/ButtonSelect";
import type {
  ButtonSelectAppearance,
  ButtonSelectEmphasis,
  ButtonSelectSize,
} from "@ds/ButtonSelect";
import AlignLeft from "lucide-react/dist/esm/icons/align-left";
import AlignCenter from "lucide-react/dist/esm/icons/align-center";
import AlignRight from "lucide-react/dist/esm/icons/align-right";
import List from "lucide-react/dist/esm/icons/list";
import LayoutGrid from "lucide-react/dist/esm/icons/layout-grid";
import Columns from "lucide-react/dist/esm/icons/columns";

const basicCode = `import { ButtonSelect, ButtonSelectItem } from "@ds/ButtonSelect";

<ButtonSelect value={view} onValueChange={setView}>
  <ButtonSelectItem value="day">Day</ButtonSelectItem>
  <ButtonSelectItem value="week">Week</ButtonSelectItem>
  <ButtonSelectItem value="month">Month</ButtonSelectItem>
</ButtonSelect>`;

const sizesCode = `<ButtonSelect size="xs" ...>...</ButtonSelect>
<ButtonSelect size="sm" ...>...</ButtonSelect>
<ButtonSelect size="md" ...>...</ButtonSelect>
<ButtonSelect size="lg" ...>...</ButtonSelect>
<ButtonSelect size="xl" ...>...</ButtonSelect>`;

const appearanceCode = `<ButtonSelect appearance="neutral" ...>...</ButtonSelect>
<ButtonSelect appearance="highlight" ...>...</ButtonSelect>`;

const emphasisCode = `<ButtonSelect emphasis="subtle" ...>...</ButtonSelect>
<ButtonSelect emphasis="regular" ...>...</ButtonSelect>
<ButtonSelect emphasis="bold" ...>...</ButtonSelect>`;

const iconOnlyCode = `import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";

<ButtonSelect value={align} onValueChange={setAlign}>
  <ButtonSelectItem value="left" iconOnly><AlignLeft /></ButtonSelectItem>
  <ButtonSelectItem value="center" iconOnly><AlignCenter /></ButtonSelectItem>
  <ButtonSelectItem value="right" iconOnly><AlignRight /></ButtonSelectItem>
</ButtonSelect>`;

const fullWidthCode = `<ButtonSelect fullWidth value={v} onValueChange={setV}>
  <ButtonSelectItem value="all">All</ButtonSelectItem>
  <ButtonSelectItem value="active">Active</ButtonSelectItem>
  <ButtonSelectItem value="archived">Archived</ButtonSelectItem>
</ButtonSelect>`;

const disabledCode = `<ButtonSelect value={v} onValueChange={setV}>
  <ButtonSelectItem value="a">Active</ButtonSelectItem>
  <ButtonSelectItem value="b" disabled>Disabled</ButtonSelectItem>
  <ButtonSelectItem value="c">Also active</ButtonSelectItem>
</ButtonSelect>`;

const SIZES: ButtonSelectSize[] = ["xs", "sm", "md", "lg", "xl"];
const APPEARANCES: ButtonSelectAppearance[] = ["neutral", "highlight"];
const EMPHASES: ButtonSelectEmphasis[] = ["subtle", "regular", "bold"];

export default function ButtonSelectPage() {
  const [view, setView] = useState("week");
  const [align, setAlign] = useState("left");
  const [full, setFull] = useState("all");
  const [partial, setPartial] = useState("a");

  const [matrixValues, setMatrixValues] = useState<Record<string, string>>({});
  const getVal = (key: string) => matrixValues[key] || "a";
  const setVal = (key: string, v: string) =>
    setMatrixValues((prev) => ({ ...prev, [key]: v }));

  return (
    <Shell title="ButtonSelect">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="ButtonSelect"
          description="Single-select toggle group where each item behaves like a button. Inherits the appearance × emphasis two-axis model from Button. Built on Radix ToggleGroup for accessible keyboard navigation."
        />

        <ComponentPreview
          title="Basic"
          description="Three-option selector. The selected item receives a filled background based on the current appearance and emphasis."
          code={basicCode}
        >
          <div className="flex items-center justify-center w-full">
            <ButtonSelect value={view} onValueChange={setView}>
              <ButtonSelectItem value="day">Day</ButtonSelectItem>
              <ButtonSelectItem value="week">Week</ButtonSelectItem>
              <ButtonSelectItem value="month">Month</ButtonSelectItem>
            </ButtonSelect>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Sizes"
          description="Five sizes matching the Button component scale: xs (24px), sm (32px), md (40px), lg (48px), xl (56px)."
          code={sizesCode}
        >
          <div className="flex flex-col items-center gap-4 w-full">
            {SIZES.map((s) => (
              <div key={s} className="flex items-center gap-3">
                <span className="text-xs font-mono text-muted-foreground w-6 text-right">
                  {s}
                </span>
                <ButtonSelect
                  size={s}
                  value={getVal(`size-${s}`)}
                  onValueChange={(v) => setVal(`size-${s}`, v)}
                >
                  <ButtonSelectItem value="a">List</ButtonSelectItem>
                  <ButtonSelectItem value="b">Grid</ButtonSelectItem>
                  <ButtonSelectItem value="c">Board</ButtonSelectItem>
                </ButtonSelect>
              </div>
            ))}
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Appearance"
          description="Neutral uses grayscale fills. Highlight uses the brand accent palette."
          code={appearanceCode}
        >
          <div className="flex flex-col items-center gap-4 w-full">
            {APPEARANCES.map((a) => (
              <div key={a} className="flex items-center gap-3">
                <span className="text-xs font-mono text-muted-foreground w-16 text-right">
                  {a}
                </span>
                <ButtonSelect
                  appearance={a}
                  emphasis="bold"
                  value={getVal(`app-${a}`)}
                  onValueChange={(v) => setVal(`app-${a}`, v)}
                >
                  <ButtonSelectItem value="a">Day</ButtonSelectItem>
                  <ButtonSelectItem value="b">Week</ButtonSelectItem>
                  <ButtonSelectItem value="c">Month</ButtonSelectItem>
                </ButtonSelect>
              </div>
            ))}
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Emphasis"
          description="Controls the visual weight of the selected state: subtle (tinted), regular (medium fill), bold (solid fill)."
          code={emphasisCode}
        >
          <div className="flex flex-col items-center gap-6 w-full">
            {APPEARANCES.map((a) => (
              <div key={a} className="flex flex-col items-center gap-3 w-full">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {a}
                </span>
                <div className="flex flex-col items-center gap-3">
                  {EMPHASES.map((e) => (
                    <div key={`${a}-${e}`} className="flex items-center gap-3">
                      <span className="text-xs font-mono text-muted-foreground w-14 text-right">
                        {e}
                      </span>
                      <ButtonSelect
                        appearance={a}
                        emphasis={e}
                        value={getVal(`emp-${a}-${e}`)}
                        onValueChange={(v) => setVal(`emp-${a}-${e}`, v)}
                      >
                        <ButtonSelectItem value="a">Day</ButtonSelectItem>
                        <ButtonSelectItem value="b">Week</ButtonSelectItem>
                        <ButtonSelectItem value="c">Month</ButtonSelectItem>
                      </ButtonSelect>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Icon only"
          description="Square items for icon-only usage. Set iconOnly on each item to get equal width and height."
          code={iconOnlyCode}
        >
          <div className="flex flex-col items-center gap-4 w-full">
            <ButtonSelect value={align} onValueChange={setAlign}>
              <ButtonSelectItem value="left" iconOnly>
                <AlignLeft />
              </ButtonSelectItem>
              <ButtonSelectItem value="center" iconOnly>
                <AlignCenter />
              </ButtonSelectItem>
              <ButtonSelectItem value="right" iconOnly>
                <AlignRight />
              </ButtonSelectItem>
            </ButtonSelect>
            <ButtonSelect
              appearance="highlight"
              emphasis="bold"
              size="lg"
              value={getVal("icon-lg")}
              onValueChange={(v) => setVal("icon-lg", v)}
            >
              <ButtonSelectItem value="list" iconOnly>
                <List />
              </ButtonSelectItem>
              <ButtonSelectItem value="grid" iconOnly>
                <LayoutGrid />
              </ButtonSelectItem>
              <ButtonSelectItem value="cols" iconOnly>
                <Columns />
              </ButtonSelectItem>
            </ButtonSelect>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="Full width"
          description="Items stretch equally to fill the container width."
          code={fullWidthCode}
        >
          <div className="w-full max-w-md">
            <ButtonSelect
              fullWidth
              value={full}
              onValueChange={setFull}
            >
              <ButtonSelectItem value="all">All</ButtonSelectItem>
              <ButtonSelectItem value="active">Active</ButtonSelectItem>
              <ButtonSelectItem value="archived">Archived</ButtonSelectItem>
            </ButtonSelect>
          </div>
        </ComponentPreview>

        <ComponentPreview
          title="With disabled items"
          description="Individual items can be disabled while the rest remain interactive."
          code={disabledCode}
        >
          <div className="flex items-center justify-center w-full">
            <ButtonSelect value={partial} onValueChange={setPartial}>
              <ButtonSelectItem value="a">Active</ButtonSelectItem>
              <ButtonSelectItem value="b" disabled>
                Disabled
              </ButtonSelectItem>
              <ButtonSelectItem value="c">Also active</ButtonSelectItem>
            </ButtonSelect>
          </div>
        </ComponentPreview>

        <div>
          <SubsectionHeading>ButtonSelect Props</SubsectionHeading>
          <PropsTable
            props={[
              {
                name: "value",
                type: "string",
                description: "Currently selected item value (controlled).",
              },
              {
                name: "onValueChange",
                type: "(value: string) => void",
                description:
                  "Called when the selected value changes. Not called when clicking the already-selected item.",
              },
              {
                name: "appearance",
                type: '"neutral" | "highlight"',
                default: '"neutral"',
                description:
                  "Color palette for the selected state. Neutral uses grayscale, highlight uses brand accent.",
              },
              {
                name: "emphasis",
                type: '"bold" | "regular" | "subtle"',
                default: '"regular"',
                description:
                  "Visual weight of the selected state: bold (solid fill), regular (medium fill), subtle (tinted).",
              },
              {
                name: "size",
                type: '"xs" | "sm" | "md" | "lg" | "xl"',
                default: '"md"',
                description: "Height and text size of items.",
              },
              {
                name: "fullWidth",
                type: "boolean",
                default: "false",
                description: "Stretch to fill the container width.",
              },
              {
                name: "disabled",
                type: "boolean",
                default: "false",
                description: "Disable the entire group.",
              },
            ]}
          />
        </div>

        <div>
          <SubsectionHeading>ButtonSelectItem Props</SubsectionHeading>
          <PropsTable
            props={[
              {
                name: "value",
                type: "string",
                description: "Unique value for this item.",
              },
              {
                name: "disabled",
                type: "boolean",
                default: "false",
                description: "Disable this specific item.",
              },
              {
                name: "iconOnly",
                type: "boolean",
                default: "false",
                description:
                  "Render as a square icon button (width equals height).",
              },
            ]}
          />
        </div>

        <SourcePath path="src/components/ui/ButtonSelect/ButtonSelect.tsx" />
      </div>
    </Shell>
  );
}
