import {
  type EntityEntry,
  type EntityType,
  type DetectedEntity,
  detectEntities,
} from "./entity-registry";

export type GhostSuggestion = {
  text: string;
  family: string;
  groupByDimension?: string;
};

type SuggestionChain = GhostSuggestion[];

type SuggestionRule = {
  pattern: RegExp;
  suggestions: SuggestionChain;
};

const KEYWORD_RULES: SuggestionRule[] = [
  { pattern: /\bhallucination\b/i, suggestions: [
    { text: " and what caused them", family: "Incident Investigation" },
    { text: " with linked postmortems", family: "Incident Investigation" },
  ]},
  { pattern: /\bpii\b/i, suggestions: [
    { text: " with linked postmortems", family: "Incident Investigation" },
    { text: " across all affected clients", family: "Incident Investigation" },
  ]},
  { pattern: /\bwrong answer\b/i, suggestions: [
    { text: " similar past incidents", family: "Incident Investigation" },
    { text: " root cause and resolution", family: "Incident Investigation" },
  ]},
  { pattern: /\bbilling error/i, suggestions: [
    { text: " across all projects", family: "Incident Investigation" },
    { text: " with severity and status", family: "Incident Investigation" },
  ]},
  { pattern: /\bincident/i, suggestions: [
    { text: " and what caused them", family: "Incident Investigation" },
    { text: " grouped by project", family: "Incident Investigation", groupByDimension: "project" },
  ]},
  { pattern: /\bwhat'?s stalled\b/i, suggestions: [
    { text: " with unresolved decisions", family: "Sprint Planning" },
    { text: " for more than two sprints", family: "Sprint Planning" },
  ]},
  { pattern: /\bopen decisions\b/i, suggestions: [
    { text: " across all projects", family: "Sprint Planning" },
    { text: " blocking current sprint work", family: "Sprint Planning" },
  ]},
  { pattern: /\bneeds? my attention\b/i, suggestions: [
    { text: " incidents in review, stale docs", family: "Sprint Planning" },
    { text: " items I own with no update this week", family: "Sprint Planning" },
  ]},
  { pattern: /\bsprint planning\b/i, suggestions: [
    { text: " blocked items and contradictions", family: "Sprint Planning" },
    { text: " carry-over from last sprint", family: "Sprint Planning" },
  ]},
  { pattern: /\bwhat'?s outdated\b/i, suggestions: [
    { text: " still linked in active tickets", family: "Workspace Hygiene" },
    { text: " with no viewers in 90 days", family: "Workspace Hygiene" },
  ]},
  { pattern: /\bwhat'?s stale\b/i, suggestions: [
    { text: " but still in tickets", family: "Workspace Hygiene" },
    { text: " grouped by owner", family: "Workspace Hygiene", groupByDimension: "owner" },
  ]},
  { pattern: /\bfind duplicates?\b/i, suggestions: [
    { text: " across the workspace", family: "Workspace Hygiene" },
    { text: " with confidence scores", family: "Workspace Hygiene" },
  ]},
  { pattern: /\buntouched\b/i, suggestions: [
    { text: " for over 90 days", family: "Workspace Hygiene" },
    { text: " that still have active links", family: "Workspace Hygiene" },
  ]},
  { pattern: /\bdeparted member/i, suggestions: [
    { text: " that no one has claimed", family: "Workspace Hygiene" },
    { text: " grouped by project", family: "Workspace Hygiene", groupByDimension: "project" },
  ]},
  { pattern: /\bsafely archive\b/i, suggestions: [
    { text: " stale with no recent viewers", family: "Workspace Hygiene" },
    { text: " not referenced by any active doc", family: "Workspace Hygiene" },
  ]},
  { pattern: /\bnew engineer\b/i, suggestions: [
    { text: " prompt, eval, deploy runbook", family: "Onboarding" },
    { text: " grouped by project", family: "Onboarding", groupByDimension: "project" },
  ]},
  { pattern: /\bgetting started\b/i, suggestions: [
    { text: " the eval framework", family: "Onboarding" },
    { text: " step-by-step setup guide", family: "Onboarding" },
  ]},
  { pattern: /\bonboarding\b/i, suggestions: [
    { text: " reading list by project", family: "Onboarding" },
    { text: " checklist for first week", family: "Onboarding" },
  ]},
];

const PROJECT_SUGGESTIONS: Record<string, SuggestionChain> = {
  atlas: [
    { text: " grouped by owner", family: "Project Status", groupByDimension: "owner" },
    { text: " open incidents and postmortems", family: "Project Status" },
    { text: " only what changed this month", family: "Project Status" },
  ],
  guardrails: [
    { text: " open incidents and fixes", family: "Project Status" },
    { text: " latest safety policy changes", family: "Project Status" },
    { text: " grouped by owner", family: "Project Status", groupByDimension: "owner" },
  ],
  "retrieval-v2": [
    { text: " architecture decisions and experiments", family: "Project Status" },
    { text: " latency benchmarks this quarter", family: "Project Status" },
    { text: " grouped by owner", family: "Project Status", groupByDimension: "owner" },
  ],
  "enterprise rollout": [
    { text: " by @client/", family: "Project Status" },
    { text: " onboarding status and blockers", family: "Project Status" },
    { text: " grouped by owner", family: "Project Status", groupByDimension: "owner" },
  ],
  claimsbot: [
    { text: " grouped by type", family: "Project Status", groupByDimension: "document-type" },
    { text: " accuracy incidents this quarter", family: "Project Status" },
    { text: " grouped by owner", family: "Project Status", groupByDimension: "owner" },
  ],
  "eval framework": [
    { text: " recent pipeline changes", family: "Project Status" },
    { text: " methodology and scoring rubrics", family: "Project Status" },
    { text: " grouped by owner", family: "Project Status", groupByDimension: "owner" },
  ],
  "kb sync": [
    { text: " what's pending", family: "Project Status" },
    { text: " sync failures and retries", family: "Project Status" },
    { text: " grouped by owner", family: "Project Status", groupByDimension: "owner" },
  ],
  integrations: [
    { text: " by connector", family: "Project Status" },
    { text: " broken or stale connections", family: "Project Status" },
    { text: " grouped by owner", family: "Project Status", groupByDimension: "owner" },
  ],
  "model registry": [
    { text: " latest model cards", family: "Project Status" },
    { text: " deprecated models still in use", family: "Project Status" },
    { text: " grouped by owner", family: "Project Status", groupByDimension: "owner" },
  ],
};

const PROJECT_FALLBACK: SuggestionChain = [
  { text: " grouped by owner", family: "Project Status", groupByDimension: "owner" },
  { text: " recent activity and decisions", family: "Project Status" },
];

const PERSON_SUGGESTIONS: Record<string, SuggestionChain> = {
  "liam o'brien": [
    { text: " that need reassigning", family: "Person/Ownership" },
    { text: " grouped by project", family: "Person/Ownership", groupByDimension: "project" },
  ],
  "hannah kim": [
    { text: " that need reassigning", family: "Person/Ownership" },
    { text: " still linked from active work", family: "Person/Ownership" },
  ],
  "raj mehta": [
    { text: " that's still in use", family: "Person/Ownership" },
    { text: " pending handoff items", family: "Person/Ownership" },
  ],
  "samira khalil": [
    { text: " on retrieval and embeddings", family: "Person/Ownership" },
    { text: " experiment logs and results", family: "Person/Ownership" },
  ],
};

const PERSON_FALLBACK: SuggestionChain = [
  { text: " across all projects", family: "Person/Ownership" },
  { text: " most recently updated first", family: "Person/Ownership" },
];

const DOC_TYPE_SUGGESTIONS: Record<string, SuggestionChain> = {
  postmortems: [
    { text: " grouped by project", family: "Doc Type Exploration", groupByDimension: "project" },
    { text: " with open action items", family: "Doc Type Exploration" },
  ],
  postmortem: [
    { text: " grouped by project", family: "Doc Type Exploration", groupByDimension: "project" },
    { text: " with open action items", family: "Doc Type Exploration" },
  ],
  runbooks: [
    { text: " that might be outdated", family: "Doc Type Exploration" },
    { text: " grouped by owner", family: "Doc Type Exploration", groupByDimension: "owner" },
  ],
  runbook: [
    { text: " that might be outdated", family: "Doc Type Exploration" },
    { text: " grouped by owner", family: "Doc Type Exploration", groupByDimension: "owner" },
  ],
  adrs: [
    { text: " still in draft or review", family: "Doc Type Exploration" },
    { text: " grouped by project", family: "Doc Type Exploration", groupByDimension: "project" },
  ],
  adr: [
    { text: " still in draft or review", family: "Doc Type Exploration" },
    { text: " grouped by project", family: "Doc Type Exploration", groupByDimension: "project" },
  ],
  "eval reports": [
    { text: " from the last 30 days", family: "Doc Type Exploration" },
    { text: " with regressions flagged", family: "Doc Type Exploration" },
  ],
  prompts: [
    { text: " only current, not deprecated", family: "Doc Type Exploration" },
    { text: " grouped by project", family: "Doc Type Exploration", groupByDimension: "project" },
  ],
  "meeting notes": [
    { text: " that reference decisions", family: "Doc Type Exploration" },
    { text: " from the last two weeks", family: "Doc Type Exploration" },
  ],
  experiments: [
    { text: " from the last quarter", family: "Doc Type Exploration" },
    { text: " with conclusive results only", family: "Doc Type Exploration" },
  ],
  "incident reports": [
    { text: " grouped by theme", family: "Doc Type Exploration", groupByDimension: "theme" },
    { text: " still unresolved", family: "Doc Type Exploration" },
  ],
};

function pickFromChain(chain: SuggestionChain, depth: number): GhostSuggestion | null {
  if (depth >= chain.length) return null;
  return chain[depth];
}

function getEntityBasedSuggestion(
  entities: DetectedEntity[],
  confirmedTypes: Set<EntityType>,
  depth: number,
): GhostSuggestion | null {
  for (const entity of entities) {
    for (const candidate of entity.candidates) {
      if (confirmedTypes.has(candidate.type)) continue;

      if (candidate.type === "project") {
        const key = candidate.label.toLowerCase();
        const chain = PROJECT_SUGGESTIONS[key] ?? PROJECT_FALLBACK;
        return pickFromChain(chain, depth);
      }

      if (candidate.type === "person") {
        const key = candidate.label.toLowerCase();
        const chain = PERSON_SUGGESTIONS[key] ?? PERSON_FALLBACK;
        return pickFromChain(chain, depth);
      }
    }
  }
  return null;
}

function getDocTypeSuggestion(input: string, depth: number): GhostSuggestion | null {
  const lower = input.toLowerCase().trim();
  for (const [key, chain] of Object.entries(DOC_TYPE_SUGGESTIONS)) {
    if (lower.includes(key)) {
      return pickFromChain(chain, depth);
    }
  }
  return null;
}

export function computeGhostSuggestion(
  input: string,
  confirmedEntities: EntityEntry[] = [],
  depth: number = 0,
): GhostSuggestion | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  for (const rule of KEYWORD_RULES) {
    if (rule.pattern.test(trimmed)) {
      return pickFromChain(rule.suggestions, depth);
    }
  }

  const detected = detectEntities(trimmed);
  const confirmedTypes = new Set(confirmedEntities.map((e) => e.type));
  const entitySuggestion = getEntityBasedSuggestion(detected, confirmedTypes, depth);
  if (entitySuggestion) return entitySuggestion;

  const docSuggestion = getDocTypeSuggestion(trimmed, depth);
  if (docSuggestion) return docSuggestion;

  if (trimmed.length > 10 && depth === 0) {
    return { text: " grouped by project", family: "General", groupByDimension: "project" };
  }

  return null;
}
