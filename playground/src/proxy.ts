import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * No-op proxy for the playground app.
 *
 * The main site has a password gate proxy at src/proxy.ts, and the playground's
 * turbopack.root is set to the monorepo root so @ds/* imports resolve correctly.
 * Without this file, Next.js 16 picks up the parent's proxy.ts and the build
 * fails because @/lib/company-session doesn't exist in the playground.
 */
export function proxy(_request: NextRequest) {
  return NextResponse.next();
}
