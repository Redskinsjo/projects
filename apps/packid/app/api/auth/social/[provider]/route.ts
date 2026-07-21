import { startOAuthFlow } from "@/app/lib/server/oauthService";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;

  await startOAuthFlow(request.url, provider);
}
