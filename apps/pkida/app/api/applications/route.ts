import { getUser, sameOrigin } from "@/lib/auth";
import { applicationSchema } from "@/lib/models";
import { createApplication, listApplications } from "@/lib/store";
import { databaseError } from "@/lib/api-errors";
export async function GET() {
  const user = await getUser();
  if (!user)
    return Response.json({ error: "Connexion requise." }, { status: 401 });
  try {
    return Response.json(await listApplications(user), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return databaseError(error);
  }
}
export async function POST(request: Request) {
  const user = await getUser();
  if (!user)
    return Response.json({ error: "Connexion requise." }, { status: 401 });
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  const parsed = applicationSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return Response.json(
      { error: "Vérifiez les informations de la candidature." },
      { status: 400 },
    );
  try {
    return Response.json(await createApplication(user, parsed.data), {
      status: 201,
    });
  } catch (error) {
    return databaseError(error);
  }
}
