import { Badge, type BadgeAppearance } from "@ds/Badge";

interface RelevanceBadgeProps {
  label: string;
  tier: "critical" | "attention" | "info";
}

const tierAppearance: Record<RelevanceBadgeProps["tier"], BadgeAppearance> = {
  critical: "negative",
  attention: "warning",
  info: "neutral",
};

export function RelevanceBadge({ label, tier }: RelevanceBadgeProps) {
  return (
    <Badge size="xxs" appearance={tierAppearance[tier]} emphasis="subtle">
      {label}
    </Badge>
  );
}
