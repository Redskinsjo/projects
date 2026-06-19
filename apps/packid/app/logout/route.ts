import { redirect } from "next/navigation";
import { clearSession } from "../lib/server/authService";

export async function GET() {
  await clearSession();
  redirect("/");
}
