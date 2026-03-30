import { NextResponse } from "next/server";
import { execSync } from "child_process";
import { resolve } from "path";

const ROOT = resolve(process.cwd(), "..");

/**
 * Paths (relative to repo root) that constitute "design system changes."
 * Git log/diff commands scope to these to determine last-modified and change analysis.
 */
const DS_PATHS = [
  "src/components/",
  "src/styles/",
  "playground/src/components/",
  "playground/src/app/components/",
  "playground/src/app/tokens/",
  "playground/src/lib/tokens.ts",
];

type BumpLevel = "patch" | "minor" | "major";

interface ChangeAnalysis {
  level: BumpLevel;
  reason: string;
  newComponents: string[];
  deletedComponents: string[];
  modifiedTokenFiles: string[];
  modifiedComponentFiles: string[];
  totalFilesChanged: number;
}

function git(cmd: string): string {
  try {
    return execSync(`git ${cmd}`, { cwd: ROOT, encoding: "utf-8" }).trim();
  } catch {
    return "";
  }
}

function getLastModified(): string {
  const hasUncommitted = git(`status --porcelain -- ${DS_PATHS.join(" ")}`);
  if (hasUncommitted) {
    return new Date().toISOString();
  }

  const lastCommitDate = git(
    `log -1 --format=%cI -- ${DS_PATHS.join(" ")}`
  );
  return lastCommitDate || new Date().toISOString();
}

function getLastReleaseCommit(): string {
  const sha = git(
    `log --all --format=%H --diff-filter=M -- elan.json | head -20`
  );
  if (!sha) return "";

  for (const candidate of sha.split("\n")) {
    const diff = git(`show ${candidate}:elan.json 2>/dev/null`);
    try {
      const parsed = JSON.parse(diff);
      if (parsed.release?.version === parsed.version) {
        return candidate;
      }
    } catch {
      continue;
    }
  }
  return "";
}

function analyzeChanges(): ChangeAnalysis {
  const releaseCommit = getLastReleaseCommit();
  const diffBase = releaseCommit || "HEAD~20";

  const diffOutput = git(`diff --name-status ${diffBase} -- ${DS_PATHS.join(" ")}`);
  if (!diffOutput) {
    return {
      level: "patch",
      reason: "No design system changes detected since last release",
      newComponents: [],
      deletedComponents: [],
      modifiedTokenFiles: [],
      modifiedComponentFiles: [],
      totalFilesChanged: 0,
    };
  }

  const lines = diffOutput.split("\n").filter(Boolean);
  const newComponents: string[] = [];
  const deletedComponents: string[] = [];
  const modifiedTokenFiles: string[] = [];
  const modifiedComponentFiles: string[] = [];

  for (const line of lines) {
    const [status, ...pathParts] = line.split("\t");
    const filePath = pathParts.join("\t");
    const s = status.charAt(0);

    const isComponent =
      filePath.includes("components/") && !filePath.includes("tokens/");
    const isToken =
      filePath.includes("styles/tokens/") || filePath.includes("tokens/");

    if (s === "A" && isComponent) {
      newComponents.push(filePath);
    } else if (s === "D" && isComponent) {
      deletedComponents.push(filePath);
    } else if (isToken) {
      modifiedTokenFiles.push(filePath);
    } else if (isComponent) {
      modifiedComponentFiles.push(filePath);
    }
  }

  let level: BumpLevel = "patch";
  let reason = "Value tweaks and bug fixes";

  if (deletedComponents.length > 0) {
    level = "major";
    reason = `${deletedComponents.length} component(s) removed — breaking change`;
  } else if (newComponents.length >= 3) {
    level = "minor";
    reason = `${newComponents.length} new component(s) added — significant addition`;
  } else if (newComponents.length > 0) {
    level = "minor";
    reason = `${newComponents.length} new component(s) added`;
  } else if (modifiedTokenFiles.length >= 3 && modifiedComponentFiles.length >= 5) {
    level = "minor";
    reason = `Broad changes across ${modifiedTokenFiles.length} token files and ${modifiedComponentFiles.length} component files`;
  } else if (lines.length >= 15) {
    level = "minor";
    reason = `${lines.length} files changed — scope warrants a minor bump`;
  }

  return {
    level,
    reason,
    newComponents,
    deletedComponents,
    modifiedTokenFiles,
    modifiedComponentFiles,
    totalFilesChanged: lines.length,
  };
}

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Only available in development" },
      { status: 403 }
    );
  }

  const lastModified = getLastModified();
  const analysis = analyzeChanges();

  let currentManifest: { version: string; release: { version: string } } | null = null;
  try {
    const raw = git("show HEAD:elan.json");
    currentManifest = JSON.parse(raw);
  } catch {
    /* fallback: read from disk */
  }

  if (!currentManifest) {
    try {
      const { readFileSync } = await import("fs");
      currentManifest = JSON.parse(
        readFileSync(resolve(ROOT, "elan.json"), "utf-8")
      );
    } catch {
      /* ignore */
    }
  }

  return NextResponse.json({
    lastModified,
    lastModifiedDate: lastModified.split("T")[0],
    currentVersion: currentManifest?.version ?? null,
    releaseVersion: currentManifest?.release?.version ?? null,
    analysis,
  });
}
