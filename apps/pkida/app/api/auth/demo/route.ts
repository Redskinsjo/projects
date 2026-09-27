import { randomUUID } from "node:crypto";
import { baseUrl, sameOrigin, setSession } from "@/lib/auth";
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production")
    return new Response(null, { status: 404 });
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  await setSession({ id: `demo:${randomUUID()}`, name: "Camille", email: "" });
  return Response.redirect(`${baseUrl()}/espace`, 303);
}
