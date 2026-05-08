import type { ComponentType } from "react";
import User from "lucide-react/dist/esm/icons/user";
import Folder from "lucide-react/dist/esm/icons/folder";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Tag from "lucide-react/dist/esm/icons/tag";
import CircleDot from "lucide-react/dist/esm/icons/circle-dot";
import Clock from "lucide-react/dist/esm/icons/clock";
import CalendarDays from "lucide-react/dist/esm/icons/calendar-days";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import Building from "lucide-react/dist/esm/icons/building-2";
import Link2 from "lucide-react/dist/esm/icons/link-2";

export type EntityType =
  | "project"
  | "person"
  | "document"
  | "tag"
  | "status"
  | "since"
  | "meeting"
  | "incident"
  | "client"
  | "link";

export type EntityEntry = {
  id: string;
  type: EntityType;
  label: string;
  description: string;
  count: number;
  meta?: Record<string, string>;
};

const AMBIGUOUS_STANDALONE = new Set([
  "dev",
  "ben",
  "jordan",
  "kai",
  "noor",
]);

const PERSON_CONTEXT_PATTERNS = /\b(?:by|from|owned by|assigned to|created by)\s*$/i;
const POSSESSIVE_PATTERN = /['']s$/;

const PROJECTS: EntityEntry[] = [
  { id: "project-atlas", type: "project", label: "Atlas", description: "Customer support AI agent (internal product)", count: 78 },
  { id: "project-guardrails", type: "project", label: "Guardrails", description: "Safety and content filtering", count: 32 },
  { id: "project-retrieval-v2", type: "project", label: "Retrieval-v2", description: "Retrieval pipeline redesign", count: 24 },
  { id: "project-eval-framework", type: "project", label: "Eval Framework", description: "Evaluation pipeline and methodology", count: 18 },
  { id: "project-claimsbot", type: "project", label: "ClaimsBot", description: "Insurance claims agent", count: 14 },
  { id: "project-enterprise-rollout", type: "project", label: "Enterprise Rollout", description: "Client onboarding and integrations", count: 20 },
  { id: "project-kb-sync", type: "project", label: "KB Sync", description: "Knowledge base update pipeline", count: 10 },
  { id: "project-integrations", type: "project", label: "Integrations", description: "HubSpot, Zendesk, Slack connectors", count: 12 },
  { id: "project-model-registry", type: "project", label: "Model Registry", description: "Model cards and selection guides", count: 8 },
];

const PEOPLE: EntityEntry[] = [
  { id: "person-samira", type: "person", label: "Samira Khalil", description: "Retrieval & embeddings lead", count: 15, meta: { project: "retrieval-v2" } },
  { id: "person-tomas", type: "person", label: "Tomás Rivera", description: "ClaimsBot & fine-tuning", count: 12, meta: { project: "claimsbot" } },
  { id: "person-aisha", type: "person", label: "Aisha Hassan", description: "Guardrails lead", count: 11, meta: { project: "guardrails" } },
  { id: "person-alex", type: "person", label: "Alex Park", description: "Atlas engineering", count: 8, meta: { project: "atlas" } },
  { id: "person-priya", type: "person", label: "Priya Sharma", description: "Eval reports & methodology", count: 10, meta: { project: "eval-framework" } },
  { id: "person-jordan", type: "person", label: "Jordan Hayes", description: "Eval pipeline engineering", count: 7, meta: { project: "eval-framework" } },
  { id: "person-marcus", type: "person", label: "Marcus Williams", description: "Infrastructure & deployment", count: 9, meta: { project: "atlas" } },
  { id: "person-dev", type: "person", label: "Dev Kapoor", description: "Tool use & agent architecture", count: 7, meta: { project: "atlas" } },
  { id: "person-lucia", type: "person", label: "Lucia Fernández", description: "Enterprise client management", count: 8, meta: { project: "enterprise-rollout" } },
  { id: "person-ben", type: "person", label: "Ben Torres", description: "Integrations & KB sync", count: 8, meta: { project: "integrations" } },
  { id: "person-chen", type: "person", label: "Chen Liu", description: "Model evaluation & benchmarks", count: 5, meta: { project: "model-registry" } },
  { id: "person-sofia", type: "person", label: "Sofia Reyes", description: "Design reviews & UI", count: 3, meta: { project: "atlas" } },
  { id: "person-elena", type: "person", label: "Elena Volkov", description: "Agent tone & personality", count: 3, meta: { project: "atlas" } },
  { id: "person-kai", type: "person", label: "Kai Nakamura", description: "Incident response", count: 4, meta: { project: "atlas" } },
  { id: "person-noor", type: "person", label: "Noor Al-Rashid", description: "Multilingual KB", count: 2, meta: { project: "kb-sync" } },
  { id: "person-ravi", type: "person", label: "Ravi Sundaram", description: "Engineering", count: 1 },
  { id: "person-yuki", type: "person", label: "Yuki Tanaka", description: "Engineering", count: 1 },
  { id: "person-omar", type: "person", label: "Omar Farouk", description: "Engineering", count: 1 },
  { id: "person-zara", type: "person", label: "Zara Ibrahim", description: "Engineering", count: 1 },
  { id: "person-liam", type: "person", label: "Liam O'Brien", description: "Departed — 18 orphaned docs", count: 18, meta: { departed: "true" } },
  { id: "person-hannah", type: "person", label: "Hannah Kim", description: "Departed — 4 orphaned docs", count: 4, meta: { departed: "true" } },
  { id: "person-raj", type: "person", label: "Raj Mehta", description: "Departed — 3 orphaned docs", count: 3, meta: { departed: "true" } },
  { id: "person-atlas-okafor", type: "person", label: "Atlas Okafor", description: "Data scientist, eval team (departed Q1)", count: 6, meta: { project: "eval-framework", departed: "true" } },
  { id: "person-priya-atlas", type: "person", label: "Priya Atlas", description: "QA engineer, guardrails team", count: 4, meta: { project: "guardrails" } },
];

const DOC_TYPES: EntityEntry[] = [
  { id: "doc-meeting-notes", type: "document", label: "Meeting Notes", description: "Syncs, standups, retros, 1:1s", count: 48 },
  { id: "doc-experiment-logs", type: "document", label: "Experiment Logs", description: "Model & retrieval experiments", count: 22 },
  { id: "doc-eval-reports", type: "document", label: "Eval Reports", description: "Weekly evals, regressions, methodology", count: 20 },
  { id: "doc-research-notes", type: "document", label: "Research Notes", description: "Papers, competitor analysis, ideas", count: 18 },
  { id: "doc-incident-reports", type: "document", label: "Incident Reports", description: "Safety, accuracy, privacy incidents", count: 16 },
  { id: "doc-runbooks", type: "document", label: "Runbooks", description: "How-to guides and checklists", count: 16 },
  { id: "doc-integration-notes", type: "document", label: "Integration Notes", description: "Client & vendor integrations", count: 15 },
  { id: "doc-prompt-libraries", type: "document", label: "Prompt Libraries", description: "System prompts, few-shot examples", count: 14 },
  { id: "doc-adrs", type: "document", label: "ADRs", description: "Architecture decision records", count: 12 },
  { id: "doc-postmortems", type: "document", label: "Postmortems", description: "Deployment incident analyses", count: 10 },
  { id: "doc-model-cards", type: "document", label: "Model Cards", description: "Model capabilities and limitations", count: 10 },
];

const TAGS: EntityEntry[] = [
  { id: "tag-hallucination", type: "tag", label: "hallucination", description: "Hallucination issues", count: 12 },
  { id: "tag-retrieval", type: "tag", label: "retrieval", description: "Retrieval pipeline", count: 18 },
  { id: "tag-safety", type: "tag", label: "safety", description: "Safety and guardrails", count: 14 },
  { id: "tag-pii", type: "tag", label: "PII", description: "Privacy and data protection", count: 6 },
  { id: "tag-eval", type: "tag", label: "eval", description: "Evaluation and quality", count: 22 },
  { id: "tag-deployment", type: "tag", label: "deployment", description: "Production deployments", count: 10 },
  { id: "tag-chunking", type: "tag", label: "chunking", description: "Document chunking strategy", count: 6 },
  { id: "tag-latency", type: "tag", label: "latency", description: "Performance and latency", count: 8 },
  { id: "tag-escalation", type: "tag", label: "escalation", description: "Escalation routing", count: 5 },
  { id: "tag-fine-tuning", type: "tag", label: "fine-tuning", description: "Model fine-tuning", count: 6 },
  { id: "tag-tool-use", type: "tag", label: "tool-use", description: "Agent tool calling", count: 7 },
  { id: "tag-prompt", type: "tag", label: "prompt", description: "Prompt engineering", count: 14 },
  { id: "tag-atlas", type: "tag", label: "atlas", description: "Migration from legacy Atlas v1 system", count: 11 },
  { id: "tag-atlassian", type: "tag", label: "Atlassian", description: "Jira & Confluence tooling integration", count: 14 },
];

const STATUSES: EntityEntry[] = [
  { id: "status-current", type: "status", label: "current", description: "Active and up to date", count: 140 },
  { id: "status-draft", type: "status", label: "draft", description: "Work in progress", count: 12 },
  { id: "status-in-review", type: "status", label: "in review", description: "Awaiting approval", count: 5 },
  { id: "status-deprecated", type: "status", label: "deprecated", description: "Superseded, do not use", count: 8 },
  { id: "status-stale", type: "status", label: "stale", description: "Not updated in 90+ days", count: 15 },
  { id: "status-obsolete", type: "status", label: "obsolete", description: "No longer relevant", count: 10 },
];

const SINCE_PRESETS: EntityEntry[] = [
  { id: "since-today", type: "since", label: "today", description: "Modified today", count: 0 },
  { id: "since-this-week", type: "since", label: "this week", description: "Last 7 days", count: 0 },
  { id: "since-this-month", type: "since", label: "this month", description: "Last 30 days", count: 0 },
  { id: "since-this-quarter", type: "since", label: "this quarter", description: "Last 90 days", count: 0 },
  { id: "since-90-plus", type: "since", label: "older than 90 days", description: "Stale tail", count: 0 },
];

const MEETINGS: EntityEntry[] = [
  { id: "meeting-weekly-sync", type: "meeting", label: "Weekly Sync", description: "Team-wide status update", count: 24 },
  { id: "meeting-design-review", type: "meeting", label: "Design Review", description: "UI and architecture reviews", count: 4 },
  { id: "meeting-sprint-retro", type: "meeting", label: "Sprint Retro", description: "Sprint retrospectives", count: 4 },
  { id: "meeting-standup", type: "meeting", label: "Standup", description: "Project standups", count: 12 },
  { id: "meeting-all-hands", type: "meeting", label: "All-Hands", description: "Quarterly all-hands", count: 3 },
  { id: "meeting-1-1", type: "meeting", label: "1:1", description: "Manager 1:1 meetings", count: 4 },
  { id: "meeting-incident-review", type: "meeting", label: "Incident Review", description: "Post-incident debriefs", count: 8 },
];

const INCIDENTS: EntityEntry[] = [
  { id: "incident-safety", type: "incident", label: "Safety", description: "Out-of-scope, medical advice, jailbreak", count: 4 },
  { id: "incident-accuracy", type: "incident", label: "Accuracy", description: "Wrong answers, numerical errors", count: 5 },
  { id: "incident-privacy", type: "incident", label: "Privacy", description: "PII leaks, data breaches", count: 3 },
  { id: "incident-performance", type: "incident", label: "Performance", description: "Latency, timeouts, loops", count: 3 },
  { id: "incident-routing", type: "incident", label: "Routing", description: "Escalation and routing failures", count: 2 },
];

const CLIENTS: EntityEntry[] = [
  { id: "client-a", type: "client", label: "Client A", description: "SSO, PII redaction, enterprise tone", count: 4 },
  { id: "client-b", type: "client", label: "Client B", description: "Custom taxonomy, Salesforce mapping", count: 4 },
  { id: "client-c", type: "client", label: "Client C", description: "Data pipeline encoding issues", count: 3 },
  { id: "client-d", type: "client", label: "Client D", description: "Onboarding paused, pending contract", count: 1 },
  { id: "client-atlassian", type: "client", label: "Atlassian", description: "Atlassian — enterprise client (pilot program)", count: 7 },
];

const LINK_TYPES: EntityEntry[] = [
  { id: "link-references", type: "link", label: "references", description: "Source explicitly cites target", count: 24 },
  { id: "link-supersedes", type: "link", label: "supersedes", description: "Source replaces target", count: 5 },
  { id: "link-duplicate-of", type: "link", label: "duplicate_of", description: "Near-duplicate pair", count: 6 },
  { id: "link-related", type: "link", label: "related", description: "Topically related (AI-suggested)", count: 40 },
  { id: "link-discussed-in", type: "link", label: "discussed_in", description: "Discussed in a meeting note", count: 30 },
  { id: "link-informs", type: "link", label: "informs", description: "Research/experiment led to decision", count: 20 },
];

export function getRegistryByType(type: EntityType): EntityEntry[] {
  switch (type) {
    case "project": return PROJECTS;
    case "person": return PEOPLE;
    case "document": return DOC_TYPES;
    case "tag": return TAGS;
    case "status": return STATUSES;
    case "since": return SINCE_PRESETS;
    case "meeting": return MEETINGS;
    case "incident": return INCIDENTS;
    case "client": return CLIENTS;
    case "link": return LINK_TYPES;
  }
}

export type DetectedEntity = {
  start: number;
  end: number;
  text: string;
  candidates: EntityEntry[];
};

export function detectEntities(input: string): DetectedEntity[] {
  if (!input.trim()) return [];

  const detected: DetectedEntity[] = [];
  const lower = input.toLowerCase();

  const allEntries = [
    ...PROJECTS,
    ...PEOPLE,
    ...DOC_TYPES,
    ...TAGS,
    ...CLIENTS,
  ];

  const checked = new Set<string>();

  for (const entry of allEntries) {
    const term = entry.label.toLowerCase();
    if (checked.has(term)) continue;

    if (term === "maya" || term === "maya chen") continue;

    const regex = new RegExp(`\\b${escapeRegex(term)}(?:'s)?\\b`, "gi");
    let match: RegExpExecArray | null;

    while ((match = regex.exec(lower)) !== null) {
      const matchText = input.slice(match.index, match.index + match[0].length);
      const cleanTerm = matchText.replace(/'s$/i, "");

      if (entry.type === "person" && AMBIGUOUS_STANDALONE.has(term)) {
        const before = input.slice(0, match.index);
        const hasPossessive = POSSESSIVE_PATTERN.test(matchText);
        const hasPersonContext = PERSON_CONTEXT_PATTERNS.test(before);
        if (!hasPossessive && !hasPersonContext) continue;
      }

      const candidates = allEntries.filter(
        (e) => e.label.toLowerCase() === cleanTerm.toLowerCase(),
      );

      if (candidates.length > 0) {
        const overlaps = detected.some(
          (d) => match!.index < d.end && match!.index + match![0].length > d.start,
        );
        if (!overlaps) {
          detected.push({
            start: match.index,
            end: match.index + match[0].length,
            text: matchText,
            candidates: candidates.sort((a, b) => b.count - a.count),
          });
        }
      }
    }

    checked.add(term);
  }

  return detected.sort((a, b) => a.start - b.start);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const ENTITY_ICONS: Record<string, ComponentType<{ size?: number }>> = {
  user: User,
  folder: Folder,
  file: FileText,
  tag: Tag,
  circle: CircleDot,
  clock: Clock,
  calendar: CalendarDays,
  alert: AlertTriangle,
  building: Building,
  link: Link2,
};

export const ALL_ENTITY_TYPES: { type: EntityType; label: string; icon: string }[] = [
  { type: "person", label: "@person/", icon: "user" },
  { type: "project", label: "@project/", icon: "folder" },
  { type: "document", label: "@document/", icon: "file" },
  { type: "tag", label: "@tag/", icon: "tag" },
  { type: "status", label: "@status/", icon: "circle" },
  { type: "since", label: "@since/", icon: "clock" },
  { type: "meeting", label: "@meeting/", icon: "calendar" },
  { type: "incident", label: "@incident/", icon: "alert" },
  { type: "client", label: "@client/", icon: "building" },
  { type: "link", label: "@link/", icon: "link" },
];
