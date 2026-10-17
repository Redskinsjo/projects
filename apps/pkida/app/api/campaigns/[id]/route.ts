import { getUser, sameOrigin } from "@/lib/auth";
import { getDatabase } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return Response.json({ error: "Connexion requise." }, { status: 401 });
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  const body = await request.json().catch(() => null) as { status?: unknown } | null;
  if (body?.status !== "ACTIVE" && body?.status !== "PAUSED") {
    return Response.json({ error: "Statut de recherche invalide." }, { status: 400 });
  }
  const { id } = await params;
  const updated = await getDatabase().research.updateMany({
    where: { id, userId: user.id },
    data: { status: body.status, nextRunAt: body.status === "ACTIVE" ? new Date() : null },
  });
  if (!updated.count) return Response.json({ error: "Recherche introuvable." }, { status: 404 });
  return Response.json({ status: body.status });
}
