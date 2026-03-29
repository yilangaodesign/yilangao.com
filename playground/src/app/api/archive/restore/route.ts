import { NextResponse } from "next/server";
import { readFile, writeFile, rename, mkdir } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(process.cwd(), "..");
const REGISTRY_PATH = path.join(ROOT, "archive", "registry.json");

export async function POST(request: Request) {
  if (process.env.VERCEL) {
    return NextResponse.json(
      { error: "Archive mutations are disabled in production. Use local dev instead." },
      { status: 403 },
    );
  }

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const raw = await readFile(REGISTRY_PATH, "utf-8");
    const registry = JSON.parse(raw);
    const item = registry.items.find((i: { id: string }) => i.id === id);

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    if (item.status !== "archived") {
      return NextResponse.json({ error: "Item is not archived" }, { status: 400 });
    }

    const from = path.join(ROOT, item.archivePath);
    const to = path.join(ROOT, item.sourcePath);

    await mkdir(path.dirname(to), { recursive: true });
    await rename(from, to);

    item.status = "active";
    delete item.archivePath;
    delete item.archivedAt;
    delete item.archivedBy;
    delete item.reason;

    await writeFile(REGISTRY_PATH, JSON.stringify(registry, null, 2) + "\n");

    return NextResponse.json({ success: true, restored: item.sourcePath });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
