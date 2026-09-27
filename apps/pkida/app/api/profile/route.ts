import { getUser, sameOrigin } from "@/lib/auth";
import { profileSchema } from "@/lib/models";
import { saveProfile } from "@/lib/store";
import { databaseError } from "@/lib/api-errors";
export async function PUT(request: Request) {
  const user = await getUser();
  if (!user)
    return Response.json({ error: "Connexion requise." }, { status: 401 });
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  const parsed = profileSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return Response.json(
      { error: "Vérifiez les informations du formulaire." },
      { status: 400 },
    );
  try {
    await saveProfile(user, parsed.data);
    return Response.json({ ok: true });
  } catch (error) {
    return databaseError(error);
  }
}
