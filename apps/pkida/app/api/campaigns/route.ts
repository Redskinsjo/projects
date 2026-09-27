import { getUser, sameOrigin } from "@/lib/auth";
import { campaignSchema } from "@/lib/models";
import { createResearch } from "@/lib/store";
import { databaseError } from "@/lib/api-errors";
export async function POST(request: Request) {
  const user = await getUser();
  if (!user)
    return Response.json({ error: "Connexion requise." }, { status: 401 });
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  const parsed = campaignSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return Response.json(
      { error: "Vérifiez les critères de votre recherche." },
      { status: 400 },
    );
  try {
    return Response.json(await createResearch(user, parsed.data), {
      status: 201,
    });
  } catch (error) {
    return databaseError(error);
  }
}
