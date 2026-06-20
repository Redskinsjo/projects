import { NextResponse } from "next/server";
import { clearSession } from "@/app/lib/server/authService";

export async function POST() {
  await clearSession();

  return NextResponse.json({ ok: true });
}
