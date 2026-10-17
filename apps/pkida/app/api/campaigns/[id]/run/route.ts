import { getUser, sameOrigin } from "@/lib/auth";
import { runResearch } from "@/lib/job-discovery";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUser();
  if (!user)
    return Response.json({ error: "Connexion requise." }, { status: 401 });
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  const { id } = await params;
  try {
    const result = await runResearch(id, user.id);
    if (!result)
      return Response.json(
        { error: "Recherche introuvable." },
        { status: 404 },
      );
    return Response.json(result);
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "La recherche a échoué.",
      },
      { status: 502 },
    );
  }
}
