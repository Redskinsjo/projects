import { cookies } from "next/headers";
import { baseUrl, sameOrigin, sessionCookie } from "@/lib/auth";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  (await cookies()).delete(sessionCookie);
  return Response.redirect(`${baseUrl()}/connexion`, 303);
}
