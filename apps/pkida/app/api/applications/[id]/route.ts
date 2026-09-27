import { getUser, sameOrigin } from "@/lib/auth";
import { applicationUpdateSchema } from "@/lib/models";
import { updateApplication } from "@/lib/store";
import { databaseError } from "@/lib/api-errors";
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUser();
  if (!user)
    return Response.json({ error: "Connexion requise." }, { status: 401 });
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  const parsed = applicationUpdateSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return Response.json(
      { error: "Statut ou notes invalides." },
      { status: 400 },
    );
  try {
    return Response.json(
      await updateApplication(user, (await params).id, parsed.data),
    );
  } catch (error) {
    return databaseError(error);
  }
}
