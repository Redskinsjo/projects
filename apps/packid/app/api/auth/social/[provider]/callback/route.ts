import { NextResponse } from "next/server";
import { completeOAuthFlow } from "@/app/lib/server/oauthService";

function redirectAfterAuth(
  requestUrl: string,
  user: Awaited<ReturnType<typeof completeOAuthFlow>>,
  status?: number,
) {
  const path =
    user.organizationMembers.length > 0 ? "/dashboard" : "/organization/new";

  return NextResponse.redirect(new URL(path, requestUrl), status);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  const url = new URL(request.url);

  try {
    const user = await completeOAuthFlow(request.url, provider, {
      code: url.searchParams.get("code"),
      state: url.searchParams.get("state"),
    });

    return redirectAfterAuth(request.url, user);
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
    const user = await completeOAuthFlow(request.url, provider, {
      code: String(formData.get("code") ?? ""),
      state: String(formData.get("state") ?? ""),
      user: String(formData.get("user") ?? ""),
    });

    return redirectAfterAuth(request.url, user, 303);
  } catch {
    return NextResponse.redirect(
      new URL("/login?error=Connexion sociale impossible.", request.url),
      303,
    );
  }
}
