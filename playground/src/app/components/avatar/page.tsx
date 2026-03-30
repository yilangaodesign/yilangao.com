"use client";

import { useState } from "react";
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable } from "@/components/component-preview";
import { cn } from "@/lib/utils";

// ── Demo Avatar ──────────────────────────────────────────────────────────────

const sizeMap = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
} as const;

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function DemoAvatar({
  src,
  name = "",
  size = "md",
  className,
}: {
  src?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);
  const showImage = src && !imgError;
  const initials = name ? getInitials(name) : "?";

  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0",
        "bg-muted text-muted-foreground font-medium select-none",
        sizeMap[size],
        className
      )}
      title={name || undefined}
    >
      {showImage ? (
        <img
          src={src}
          alt={name || "Avatar"}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </span>
  );
}

// ── Code snippets ────────────────────────────────────────────────────────────

const imageCode = `<DemoAvatar
  src="https://i.pravatar.cc/150?u=jane"
  name="Jane Doe"
/>`;

const initialsCode = `<DemoAvatar name="Jane Doe" />
<DemoAvatar name="Alex Rivera" />
<DemoAvatar name="Kai" />`;

const sizesCode = `<DemoAvatar name="AB" size="sm" />
<DemoAvatar name="AB" size="md" />
<DemoAvatar name="AB" size="lg" />`;

const fallbackCode = `<DemoAvatar
  src="https://broken-link.invalid/photo.jpg"
  name="Fallback User"
/>`;

// ── Demos ────────────────────────────────────────────────────────────────────

function ImageDemo() {
  return (
    <div className="flex items-center gap-4">
      <DemoAvatar src="https://i.pravatar.cc/150?u=jane" name="Jane Doe" />
      <DemoAvatar src="https://i.pravatar.cc/150?u=alex" name="Alex Rivera" />
      <DemoAvatar src="https://i.pravatar.cc/150?u=kai" name="Kai Tanaka" />
    </div>
  );
}

function InitialsDemo() {
  return (
    <div className="flex items-center gap-4">
      <DemoAvatar name="Jane Doe" />
      <DemoAvatar name="Alex Rivera" />
      <DemoAvatar name="Kai" />
    </div>
  );
}

function SizesDemo() {
  return (
    <div className="flex items-end gap-4">
      <div className="flex flex-col items-center gap-2">
        <DemoAvatar name="AB" size="sm" />
        <span className="text-xs text-muted-foreground">sm</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <DemoAvatar name="AB" size="md" />
        <span className="text-xs text-muted-foreground">md</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <DemoAvatar name="AB" size="lg" />
        <span className="text-xs text-muted-foreground">lg</span>
      </div>
    </div>
  );
}

function FallbackDemo() {
  return (
    <div className="flex items-center gap-4">
      <DemoAvatar
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
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Props
          </h3>
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
                name: "className",
                type: "string",
                description: "Additional CSS classes to apply to the container",
              },
            ]}
          />
        </div>

        <div className="text-xs font-mono text-muted-foreground p-3 rounded-sm bg-muted/50">
          src/components/ui/Avatar/Avatar.tsx
        </div>
      </div>
    </Shell>
  );
}
