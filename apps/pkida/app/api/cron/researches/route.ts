import { getDatabase } from "@/lib/prisma";
import { runResearch } from "@/lib/job-discovery";

export async function POST(request: Request) {
  const secret = process.env.PKIDA_CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Non autorisé." }, { status: 401 });
  }
  const due = await getDatabase().research.findMany({
    where: { status: "ACTIVE", OR: [{ nextRunAt: null }, { nextRunAt: { lte: new Date() } }] },
    select: { id: true },
    take: 5,
  });
  const results: Array<{ status: "fulfilled" } | { status: "rejected" }> = [];
  for (const { id } of due) {
    try {
      await runResearch(id);
      results.push({ status: "fulfilled" });
    } catch {
      results.push({ status: "rejected" });
    }
  }
  return Response.json({
    processed: due.length,
    succeeded: results.filter((result) => result.status === "fulfilled").length,
    failed: results.filter((result) => result.status === "rejected").length,
  });
}
