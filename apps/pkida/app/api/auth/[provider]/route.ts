import { randomBytes, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { baseUrl, cookieOptions, providerConfig, sign } from "@/lib/auth";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  const config = providerConfig(provider);
  if (!config?.clientId || !config.clientSecret)
    return Response.redirect(`${baseUrl()}/connexion?error=configuration`);
  const state = randomBytes(32).toString("base64url");
  const verifier = randomBytes(48).toString("base64url");
  (await cookies()).set(
    "pkida_oauth",
    sign({ state, verifier, provider, exp: Date.now() + 600000 }),
    { ...cookieOptions, maxAge: 600 },
  );
  const url = new URL(config.authorization);
  url.search = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: `${baseUrl()}/api/auth/${provider}/callback`,
    response_type: "code",
    scope: "openid profile email",
    state,
  }).toString();
  if (provider === "google") {
    url.searchParams.set(
      "code_challenge",
      createHash("sha256").update(verifier).digest("base64url"),
    );
    url.searchParams.set("code_challenge_method", "S256");
  }
  return Response.redirect(url);
}
