import { NextResponse } from "next/server";
import { readFile, writeFile, rename, mkdir } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(process.cwd(), "..");
const REGISTRY_PATH = path.join(ROOT, "archive", "registry.json");

interface MoveRequest {
  id?: string;
  sourcePath: string;
  experiment: string;
  name: string;
  type: string;
  description?: string;
  reason?: string;
  tags?: string[];
  archivedBy?: string;
}

export async function POST(request: Request) {
  if (process.env.VERCEL) {
    return NextResponse.json(
      { error: "Archive mutations are disabled in production. Use local dev instead." },
      { status: 403 },
    );
  }

  try {
    const body: MoveRequest = await request.json();
    if (!body.sourcePath || !body.experiment || !body.name || !body.type) {
      return NextResponse.json(
        { error: "Missing required fields: sourcePath, experiment, name, type" },
        { status: 400 }
      );
    }

    const raw = await readFile(REGISTRY_PATH, "utf-8");
    const registry = JSON.parse(raw);

    const filename = path.basename(body.sourcePath);
    const typeDir = body.type === "Token" || body.type === "Style" ? "styles" : body.type === "Page" ? "pages" : "components";
    const archivePath = `archive/${body.experiment}/${typeDir}/${filename}`;

    const from = path.join(ROOT, body.sourcePath);
    const to = path.join(ROOT, archivePath);

    await mkdir(path.dirname(to), { recursive: true });
    await rename(from, to);

    const existing = registry.items.find(
      (i: { sourcePath: string }) => i.sourcePath === body.sourcePath
    );

    if (existing) {
      existing.status = "archived";
      existing.archivePath = archivePath;
      existing.archivedAt = new Date().toISOString();
      existing.archivedBy = body.archivedBy ?? "user";
      existing.reason = body.reason ?? "";
    } else {
      const id = body.id ?? `${body.experiment.replace("experiment-", "exp")}-${body.name.toLowerCase().replace(/\s+/g, "-")}`;
      registry.items.push({
        id,
        name: body.name,
        type: body.type,
        experiment: body.experiment,
        status: "archived",
        description: body.description ?? "",
        sourcePath: body.sourcePath,
        createdAt: new Date().toISOString(),
        createdBy: "user",
        origin: { type: "custom" },
        tags: body.tags ?? [],
        hasPreview: false,
        archivePath,
        archivedAt: new Date().toISOString(),
        archivedBy: body.archivedBy ?? "user",
        reason: body.reason ?? "",
      });
    }

    await writeFile(REGISTRY_PATH, JSON.stringify(registry, null, 2) + "\n");

    return NextResponse.json({ success: true, archived: archivePath });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
