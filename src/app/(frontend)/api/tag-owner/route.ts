import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const OWNER_SECRET = process.env.ANALYTICS_OWNER_KEY ?? "yg-owner-2026";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (key !== OWNER_SECRET) {
    return NextResponse.json({ error: "invalid key" }, { status: 403 });
  }

  const cookieStore = await cookies();
  cookieStore.set("yg_owner", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365 * 2,
    path: "/",
  });

  return NextResponse.json({ ok: true, message: "Owner cookie set. You are now excluded from analytics reports." });
}
