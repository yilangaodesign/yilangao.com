"use client";

import { useState, useCallback } from "react";
import { Share2, Link2, Globe, Lock, Users } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@ds/Dialog";
import { Button } from "@ds/Button";
import { Input } from "@ds/Input";
import { Badge } from "@ds/Badge";
import { Divider } from "@ds/Divider";
import type { ViewSummary, Collaborator } from "@/lib/queries";
import styles from "./share-dialog.module.scss";

const AVATAR_COLORS = [
  "#6366f1", "#059669", "#d97706", "#dc2626", "#7c3aed",
  "#0891b2", "#be185d", "#4f46e5", "#65a30d", "#ea580c",
] as const;

function avatarColor(initials: string): string {
  let h = 0;
  for (const ch of initials) h = ((h << 5) - h + ch.charCodeAt(0)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

const ROLE_OPTIONS = ["Can edit", "Can view"] as const;

function roleForCollaborator(_collab: Collaborator, index: number): string {
  return index === 0 ? ROLE_OPTIONS[0] : ROLE_OPTIONS[index % 2];
}

const VISIBILITY_ICONS: Record<string, typeof Globe> = {
  private: Lock,
  shared: Users,
  team: Globe,
};

const VISIBILITY_LABELS: Record<string, string> = {
  private: "Only you",
  shared: "Shared with specific people",
  team: "Visible to the team",
};

export function ShareDialog({ view }: { view: ViewSummary }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = useCallback(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const VisIcon = VISIBILITY_ICONS[view.visibility] ?? Lock;
  const collaborators = view.sharedWith ?? [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          emphasis="subtle"
          leadingIcon={<Share2 size={14} />}
        >
          Share…
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogTitle>Share &ldquo;{view.name}&rdquo;</DialogTitle>
        <DialogDescription>
          Manage who can access this workspace view.
        </DialogDescription>

        <div className={styles.body}>
          <div className={styles.inviteRow}>
            <Input
              size="sm"
              placeholder="Add people by name or email…"
            />
            <Button size="sm" appearance="highlight" emphasis="bold">
              Invite
            </Button>
          </div>

          <div className={styles.peopleSection}>
            <span className={styles.sectionLabel}>People with access</span>

            <div className={styles.personRow}>
              <span
                className={styles.personAvatar}
                style={{ background: avatarColor("MC") }}
              >
                MC
              </span>
              <div className={styles.personInfo}>
                <span className={styles.personName}>
                  Maya Chen{" "}
                  <span className={styles.personYou}>(you)</span>
                </span>
              </div>
              <Badge appearance="highlight" emphasis="subtle" size="sm">
                Owner
              </Badge>
            </div>

            {collaborators.map((collab, i) => (
              <div key={collab.initials} className={styles.personRow}>
                <span
                  className={styles.personAvatar}
                  style={{ background: avatarColor(collab.initials) }}
                >
                  {collab.initials}
                </span>
                <div className={styles.personInfo}>
                  <span className={styles.personName}>{collab.name}</span>
                </div>
                <Badge appearance="neutral" emphasis="subtle" size="sm">
                  {roleForCollaborator(collab, i)}
                </Badge>
              </div>
            ))}
          </div>

          <Divider />

          <div className={styles.footerRow}>
            <Button
              size="sm"
              emphasis="minimal"
              appearance="highlight"
              leadingIcon={<Link2 size={14} />}
              onClick={handleCopyLink}
            >
              {copied ? "Copied!" : "Copy link"}
            </Button>
            <span className={styles.visibilityLabel}>
              <VisIcon size={12} />
              {VISIBILITY_LABELS[view.visibility]}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
