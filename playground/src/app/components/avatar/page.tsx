"use client";

import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable, SourcePath, SubsectionHeading} from "@/components/component-preview";
import { Avatar } from "@ds/Avatar";

// ── Code snippets ────────────────────────────────────────────────────────────

const imageCode = `import { Avatar } from "@ds/Avatar";

<Avatar
  src="https://i.pravatar.cc/150?u=jane"
  name="Jane Doe"
/>`;

const initialsCode = `import { Avatar } from "@ds/Avatar";

<Avatar name="Jane Doe" />
<Avatar name="Alex Rivera" />
<Avatar name="Kai" />`;

const tonesCode = `import { Avatar } from "@ds/Avatar";

<Avatar name="Jane Doe" tone="brand" />
<Avatar name="Jane Doe" tone="neutral" />
<Avatar name="Jane Doe" tone="terra" />`;

const sizesCode = `import { Avatar } from "@ds/Avatar";

<Avatar name="AB" size="sm" />
<Avatar name="AB" size="md" />
<Avatar name="AB" size="lg" />`;

const fallbackCode = `import { Avatar } from "@ds/Avatar";

<Avatar
  src="https://broken-link.invalid/photo.jpg"
  name="Fallback User"
/>`;

// ── Demos ────────────────────────────────────────────────────────────────────

function ImageDemo() {
  return (
    <div className="flex items-center gap-4">
      <Avatar src="https://i.pravatar.cc/150?u=jane" name="Jane Doe" />
      <Avatar src="https://i.pravatar.cc/150?u=alex" name="Alex Rivera" />
      <Avatar src="https://i.pravatar.cc/150?u=kai" name="Kai Tanaka" />
    </div>
  );
}

function InitialsDemo() {
  return (
    <div className="flex items-center gap-4">
      <Avatar name="Jane Doe" />
      <Avatar name="Alex Rivera" />
      <Avatar name="Kai" />
    </div>
  );
}

function TonesDemo() {
  return (
    <div className="flex items-end gap-4">
      <div className="flex flex-col items-center gap-2">
        <Avatar name="Jane Doe" tone="brand" />
        <span className="text-xs text-muted-foreground">brand</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Avatar name="Jane Doe" tone="neutral" />
        <span className="text-xs text-muted-foreground">neutral</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Avatar name="Jane Doe" tone="terra" />
        <span className="text-xs text-muted-foreground">terra</span>
      </div>
    </div>
  );
}

function SizesDemo() {
  return (
    <div className="flex items-end gap-4">
      <div className="flex flex-col items-center gap-2">
        <Avatar name="AB" size="sm" />
        <span className="text-xs text-muted-foreground">sm</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Avatar name="AB" size="md" />
        <span className="text-xs text-muted-foreground">md</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Avatar name="AB" size="lg" />
        <span className="text-xs text-muted-foreground">lg</span>
      </div>
    </div>
  );
}

function FallbackDemo() {
  return (
    <div className="flex items-center gap-4">
      <Avatar
        src="https://broken-link.invalid/photo.jpg"
        name="Fallback User"
      />
      <span className="text-sm text-muted-foreground">
        Broken image src → shows initials
      </span>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AvatarPage() {
  return (
    <Shell title="Avatar">
      <div className="max-w-5xl space-y-10">
        <SectionHeading
          title="Avatar"
          description="Circular avatar with image support and automatic initials fallback. Available in three sizes with graceful error handling for broken image sources."
        />

        <ComponentPreview
          title="With image"
          description="Renders a circular image from the src prop."
          code={imageCode}
        >
          <ImageDemo />
        </ComponentPreview>

        <ComponentPreview
          title="With initials"
          description="When no src is provided, extracts initials from the name prop (up to 2 characters)."
          code={initialsCode}
        >
          <InitialsDemo />
        </ComponentPreview>

        <ComponentPreview
          title="Tones"
          description="Three color tones: brand (default blue-violet accent), neutral (grayscale), and terra (warm amber)."
          code={tonesCode}
        >
          <TonesDemo />
        </ComponentPreview>

        <ComponentPreview
          title="Sizes"
          description="Three sizes: sm (32px), md (40px), and lg (56px)."
          code={sizesCode}
        >
          <SizesDemo />
        </ComponentPreview>

        <ComponentPreview
          title="Broken image fallback"
          description="If the image fails to load, falls back to initials automatically."
          code={fallbackCode}
        >
          <FallbackDemo />
        </ComponentPreview>

        <div>
          <SubsectionHeading>Props</SubsectionHeading>
          <PropsTable
            props={[
              {
                name: "src",
                type: "string",
                description: "Image URL for the avatar",
              },
              {
                name: "name",
                type: "string",
                description:
                  "User name — used for initials fallback and title attribute",
              },
              {
                name: "size",
                type: '"sm" | "md" | "lg"',
                default: '"md"',
                description: "Avatar size: 32px, 40px, or 56px",
              },
              {
                name: "tone",
                type: '"brand" | "neutral" | "terra"',
                default: '"brand"',
                description:
                  "Color tone for the initials fallback background and text",
              },
              {
                name: "className",
                type: "string",
                description: "Additional CSS classes to apply to the container",
              },
            ]}
          />
        </div>

        <SourcePath path="src/components/ui/Avatar/Avatar.tsx" />
      </div>
    </Shell>
  );
}
