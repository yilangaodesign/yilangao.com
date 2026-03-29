import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ArchiveManifest } from "@/lib/archive-manifest";
import { ArchivePageClient } from "./client";

export const dynamic = "force-static";

async function loadManifest(): Promise<ArchiveManifest> {
  const manifestPath = path.resolve(process.cwd(), "..", "archive", "registry.json");
  try {
    const raw = await readFile(manifestPath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { items: [] };
  }
}

export default async function ArchivePage() {
  const manifest = await loadManifest();
  return <ArchivePageClient items={manifest.items} />;
}
