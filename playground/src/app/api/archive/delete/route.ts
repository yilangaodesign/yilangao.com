import { NextResponse } from "next/server";
import { readFile, writeFile, rm, stat } from "node:fs/promises";
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
    const itemIndex = registry.items.findIndex((i: { id: string }) => i.id === id);

    if (itemIndex === -1) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const item = registry.items[itemIndex];
    if (item.status !== "archived") {
      return NextResponse.json(
        { error: "Only archived items can be permanently deleted" },
        { status: 400 },
      );
    }

    const filePath = item.archivePath
      ? path.join(ROOT, item.archivePath)
      : path.join(ROOT, item.sourcePath);

    try {
      const fileStat = await stat(filePath);
      if (fileStat.isDirectory()) {
        await rm(filePath, { recursive: true, force: true });
      } else {
        await rm(filePath, { force: true });
      }
    } catch {
      // File may already be gone — continue with registry cleanup
    }

    registry.items.splice(itemIndex, 1);
    await writeFile(REGISTRY_PATH, JSON.stringify(registry, null, 2) + "\n");

    return NextResponse.json({ success: true, deleted: id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
