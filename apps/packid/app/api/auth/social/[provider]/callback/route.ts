import { NextResponse } from "next/server";
import { completeOAuthFlow } from "@/app/lib/server/oauthService";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  const url = new URL(request.url);

  try {
    await completeOAuthFlow(request.url, provider, {
      code: url.searchParams.get("code"),
      state: url.searchParams.get("state"),
    });

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch {
    return NextResponse.redirect(
      new URL("/login?error=Connexion sociale impossible.", request.url),
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  const formData = await request.formData();

  try {
    await completeOAuthFlow(request.url, provider, {
      code: String(formData.get("code") ?? ""),
      state: String(formData.get("state") ?? ""),
      user: String(formData.get("user") ?? ""),
    });

    return NextResponse.redirect(new URL("/dashboard", request.url), 303);
  } catch {
    return NextResponse.redirect(
      new URL("/login?error=Connexion sociale impossible.", request.url),
      303,
    );
  }
}
