import { getUser, sameOrigin } from "@/lib/auth";
import { readResume, saveResume, deleteResume } from "@/lib/store";
import { databaseError } from "@/lib/api-errors";
export async function GET() {
  const user = await getUser();
  if (!user) return new Response(null, { status: 401 });
  try {
    const cv = await readResume(user);
    if (!cv) return new Response(null, { status: 404 });
    return new Response(Buffer.from(cv.content), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="cv.pdf"',
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "sandbox",
      },
    });
  } catch (error) {
    return databaseError(error);
  }
}
export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return new Response(null, { status: 401 });
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  if (Number(request.headers.get("content-length")) > 6 * 1024 * 1024)
    return Response.json(
      { error: "Le PDF ne doit pas dépasser 5 Mo." },
      { status: 413 },
    );
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || file.size > 5 * 1024 * 1024 || file.size < 5)
    return Response.json(
      { error: "Ajoutez un CV PDF de 5 Mo maximum." },
      { status: 400 },
    );
  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.subarray(0, 5).toString() !== "%PDF-")
    return Response.json(
      { error: "Ce document n’est pas un PDF valide." },
      { status: 400 },
    );
  try {
    return Response.json(
      await saveResume(user, file.name.slice(0, 200), buffer),
    );
  } catch (error) {
    return databaseError(error);
  }
}
export async function DELETE(request: Request) {
  const user = await getUser();
  if (!user) return new Response(null, { status: 401 });
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  try {
    await deleteResume(user);
    return Response.json({ ok: true });
  } catch (error) {
    return databaseError(error);
  }
}
