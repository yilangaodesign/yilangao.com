import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import {
  ComponentPreview,
  PropsTable,
  SourcePath,
  SubsectionHeading,
} from "@/components/component-preview";
import { BadgeOverlay, BadgeOverlayAnchor } from "@ds/BadgeOverlay";
import type {
  BadgeOverlayAppearance,
  BadgeOverlayStatus,
  BadgeOverlayEmphasis,
} from "@ds/BadgeOverlay";
import { Avatar } from "@ds/Avatar";

const APPEARANCES: BadgeOverlayAppearance[] = [
  "neutral",
  "highlight",
  "always-dark",
  "always-light",
  "inverse",
];

const STATUSES: BadgeOverlayStatus[] = ["success", "warning", "error"];

const EMPHASES: BadgeOverlayEmphasis[] = ["bold", "regular", "subtle"];

const UNSUPPORTED: Set<string> = new Set([
  "always-dark:subtle",
  "always-light:subtle",
  "inverse:subtle",
]);

const code = `import { BadgeOverlay, BadgeOverlayAnchor } from "@ds/BadgeOverlay";

// Counter badge (with children = number label)
<BadgeOverlay appearance="neutral" emphasis="bold">3</BadgeOverlay>
<BadgeOverlay status="error">12</BadgeOverlay>

// Dot indicator (no children = dot mode)
<BadgeOverlay status="success" />
<BadgeOverlay status="error" size="sm" />

// Bordered (for overlaying on busy backgrounds)
<BadgeOverlay appearance="neutral" bordered>5</BadgeOverlay>

// Anchor wrapper (positions badge on another element)
<BadgeOverlayAnchor
  placement="top-right"
  badge={<BadgeOverlay status="error">3</BadgeOverlay>}
>
  <Avatar src="..." />
</BadgeOverlayAnchor>`;

export default function BadgeOverlayPage() {
  return (
    <Shell title="BadgeOverlay">
      <div className="max-w-6xl space-y-10">
        <SectionHeading
          title="BadgeOverlay"
          description="Compact notification counter and status dot indicator. Designed to overlay on avatars, icons, and buttons. Two modes: counter (with label) and dot (without)."
        />

        {/* ── Appearance x Emphasis Matrix ────────────────────────── */}
        <ComponentPreview
          title="Appearance x Emphasis"
          description="Counter mode showing all appearance/emphasis combinations. always-dark, always-light, and inverse only support bold + regular — subtle falls back to regular."
          code={code}
        >
          <div className="flex flex-col gap-6 w-full overflow-x-auto">
            {EMPHASES.map((emphasis) => (
              <div key={emphasis} className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {emphasis}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {APPEARANCES.map((appearance) => {
                    const key = `${appearance}:${emphasis}`;
                    if (UNSUPPORTED.has(key)) return null;
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <BadgeOverlay appearance={appearance} emphasis={emphasis}>
                          1
                        </BadgeOverlay>
                        <span className="text-xs text-muted-foreground">
                          {appearance}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ComponentPreview>

        {/* ── Status Variants ─────────────────────────────────────── */}
        <ComponentPreview
          title="Status Variants"
          description="Status overrides appearance. Uses semantic positive/warning/negative tokens. Shown across all three emphasis levels."
        >
          <div className="flex flex-col gap-6 w-full">
            {EMPHASES.map((emphasis) => (
              <div key={emphasis} className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {emphasis}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {STATUSES.map((status) => (
                    <div key={status} className="flex items-center gap-2">
                      <BadgeOverlay status={status} emphasis={emphasis}>
                        3
                      </BadgeOverlay>
                      <span className="text-xs text-muted-foreground">
                        {status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ComponentPreview>

        {/* ── Sizes ───────────────────────────────────────────────── */}
        <ComponentPreview
          title="Sizes"
          description="xs (16px / 10px text) and sm (20px / 12px text). Shown in counter and dot modes."
        >
          <div className="flex flex-col gap-6 w-full">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                counter
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <BadgeOverlay size="xs">1</BadgeOverlay>
                  <span className="text-xs text-muted-foreground">xs</span>
                </div>
                <div className="flex items-center gap-2">
                  <BadgeOverlay size="sm">1</BadgeOverlay>
                  <span className="text-xs text-muted-foreground">sm</span>
                </div>
                <div className="flex items-center gap-2">
                  <BadgeOverlay size="xs">99</BadgeOverlay>
                  <span className="text-xs text-muted-foreground">xs multi-digit</span>
                </div>
                <div className="flex items-center gap-2">
                  <BadgeOverlay size="sm">99</BadgeOverlay>
                  <span className="text-xs text-muted-foreground">sm multi-digit</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                dot
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <BadgeOverlay size="xs" status="error" />
                  <span className="text-xs text-muted-foreground">xs (8px)</span>
                </div>
                <div className="flex items-center gap-2">
                  <BadgeOverlay size="sm" status="error" />
                  <span className="text-xs text-muted-foreground">sm (12px)</span>
                </div>
              </div>
            </div>
          </div>
        </ComponentPreview>

        {/* ── Bordered ────────────────────────────────────────────── */}
        <ComponentPreview
          title="Bordered"
          description="2px contrasting outline ring for overlaying on busy backgrounds. Prevents the badge from visually merging with the surface underneath."
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <BadgeOverlay bordered>3</BadgeOverlay>
              <span className="text-xs text-muted-foreground">neutral</span>
            </div>
            <div className="flex items-center gap-2">
              <BadgeOverlay bordered appearance="highlight">5</BadgeOverlay>
              <span className="text-xs text-muted-foreground">highlight</span>
            </div>
            <div className="flex items-center gap-2">
              <BadgeOverlay bordered status="error">1</BadgeOverlay>
              <span className="text-xs text-muted-foreground">error</span>
            </div>
            <div className="flex items-center gap-2">
              <BadgeOverlay bordered status="success" />
              <span className="text-xs text-muted-foreground">success dot</span>
            </div>
            <div className="flex items-center gap-2">
              <BadgeOverlay bordered status="warning" />
              <span className="text-xs text-muted-foreground">warning dot</span>
            </div>
          </div>
        </ComponentPreview>

        {/* ── Dot Mode ────────────────────────────────────────────── */}
        <ComponentPreview
          title="Dot Mode"
          description="No children renders a pure colored dot. All appearance and status values are supported."
        >
          <div className="flex flex-col gap-6 w-full">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                appearances
              </p>
              <div className="flex flex-wrap items-center gap-4">
                {APPEARANCES.map((appearance) => (
                  <div key={appearance} className="flex items-center gap-2">
                    <BadgeOverlay appearance={appearance} size="sm" />
                    <span className="text-xs text-muted-foreground">
                      {appearance}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                statuses
              </p>
              <div className="flex flex-wrap items-center gap-4">
                {STATUSES.map((status) => (
                  <div key={status} className="flex items-center gap-2">
                    <BadgeOverlay status={status} size="sm" />
                    <span className="text-xs text-muted-foreground">
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ComponentPreview>

        {/* ── Anchor (Overlay Positioning) ────────────────────────── */}
        <ComponentPreview
          title="BadgeOverlayAnchor"
          description="Positioning wrapper that places the badge on top of an anchor element (avatar, icon, etc.). Supports four placements."
        >
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <BadgeOverlayAnchor
                placement="top-right"
                badge={<BadgeOverlay status="error">3</BadgeOverlay>}
              >
                <Avatar size="md" />
              </BadgeOverlayAnchor>
              <span className="text-xs text-muted-foreground">top-right</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <BadgeOverlayAnchor
                placement="top-left"
                badge={<BadgeOverlay status="success" />}
              >
                <Avatar size="md" />
              </BadgeOverlayAnchor>
              <span className="text-xs text-muted-foreground">top-left dot</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <BadgeOverlayAnchor
                placement="bottom-right"
                badge={<BadgeOverlay status="success" size="sm" />}
              >
                <Avatar size="lg" />
              </BadgeOverlayAnchor>
              <span className="text-xs text-muted-foreground">bottom-right</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <BadgeOverlayAnchor
                placement="bottom-left"
                badge={<BadgeOverlay bordered>1</BadgeOverlay>}
              >
                <Avatar size="lg" />
              </BadgeOverlayAnchor>
              <span className="text-xs text-muted-foreground">bottom-left</span>
            </div>
          </div>
        </ComponentPreview>

        {/* ── Props ────────────────────────────────────────────────── */}
        <div>
          <SubsectionHeading>BadgeOverlay Props</SubsectionHeading>
          <PropsTable
            props={[
              {
                name: "appearance",
                type: '"neutral" | "highlight" | "inverse" | "always-dark" | "always-light"',
                default: '"neutral"',
                description:
                  "Color intent. Ignored when status is set.",
              },
              {
                name: "status",
                type: '"success" | "warning" | "error"',
                default: "—",
                description:
                  "Semantic status color. When set, overrides appearance.",
              },
              {
                name: "emphasis",
                type: '"bold" | "regular" | "subtle"',
                default: '"bold"',
                description:
                  "Visual weight. Bold = solid fill, Regular = bordered, Subtle = tinted fill.",
              },
              {
                name: "size",
                type: '"xs" | "sm"',
                default: '"xs"',
                description:
                  "xs = 16px counter / 8px dot, sm = 20px counter / 12px dot.",
              },
              {
                name: "bordered",
                type: "boolean",
                default: "false",
                description:
                  "Adds a 2px contrasting outline ring for overlay use on busy backgrounds.",
              },
              {
                name: "children",
                type: "ReactNode",
                default: "—",
                description:
                  "Counter label (number). When absent, renders as a dot indicator.",
              },
              {
                name: "className",
                type: "string",
                description: "Merged onto the root span element.",
              },
            ]}
          />
        </div>

        <div>
          <SubsectionHeading>BadgeOverlayAnchor Props</SubsectionHeading>
          <PropsTable
            props={[
              {
                name: "placement",
                type: '"top-right" | "top-left" | "bottom-right" | "bottom-left"',
                default: '"top-right"',
                description:
                  "Corner placement of the badge relative to the anchor element.",
              },
              {
                name: "badge",
                type: "ReactNode",
                description:
                  "The BadgeOverlay instance to position.",
              },
              {
                name: "children",
                type: "ReactNode",
                description:
                  "The anchor element (avatar, icon, button) the badge overlays.",
              },
              {
                name: "className",
                type: "string",
                description: "Merged onto the anchor wrapper div.",
              },
            ]}
          />
        </div>

        <SourcePath path="src/components/ui/BadgeOverlay/BadgeOverlay.tsx · src/components/ui/BadgeOverlay/BadgeOverlay.module.scss" />
      </div>
    </Shell>
  );
}
