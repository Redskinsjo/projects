import { cookies } from "next/headers";
import { baseUrl, providerConfig, setSession, verify } from "@/lib/auth";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  const config = providerConfig(provider);
  const jar = await cookies();
  const flow = verify<{ state: string; verifier: string; provider: string }>(
    jar.get("pkida_oauth")?.value,
  );
  jar.delete("pkida_oauth");
  const query = new URL(request.url).searchParams;
  if (
    !flow ||
    flow.provider !== provider ||
    flow.state !== query.get("state") ||
    !query.get("code") ||
    !config?.clientId ||
    !config.clientSecret
  )
    return Response.redirect(`${baseUrl()}/connexion?error=connexion`);
  try {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code: query.get("code")!,
      redirect_uri: `${baseUrl()}/api/auth/${provider}/callback`,
    });
    if (provider === "google") body.set("code_verifier", flow.verifier);
    const tokenResponse = await fetch(config.token, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    });
    const token = await tokenResponse.json();
    if (!tokenResponse.ok || typeof token.access_token !== "string")
      throw new Error("Token rejected");
    const response = await fetch(config.userinfo, {
      headers: { Authorization: `Bearer ${token.access_token}` },
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    });
    const profile = await response.json();
    if (!response.ok || typeof profile.sub !== "string")
      throw new Error("Profile rejected");
    await setSession({
      id: `${provider}:${profile.sub}`,
      name: typeof profile.name === "string" ? profile.name : "",
      email: typeof profile.email === "string" ? profile.email : "",
    });
    return Response.redirect(`${baseUrl()}/espace`);
  } catch {
    return Response.redirect(`${baseUrl()}/connexion?error=connexion`);
  }
}
