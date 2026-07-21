import type { AuthProvider } from "@/app/generated/prisma/client";

export type OAuthProviderConfig = {
  provider: AuthProvider;
  name: string;
  clientId?: string;
  clientSecret?: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl?: string;
  scopes: string[];
};

export const authProviders: Record<string, OAuthProviderConfig> = {
  google: {
    provider: "GOOGLE",
    name: "Google",
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://openidconnect.googleapis.com/v1/userinfo",
    scopes: ["openid", "email", "profile"],
  },
  microsoft: {
    provider: "MICROSOFT",
    name: "Microsoft",
    clientId: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    authorizationUrl:
      "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    userInfoUrl: "https://graph.microsoft.com/oidc/userinfo",
    scopes: ["openid", "email", "profile"],
  },
  apple: {
    provider: "APPLE",
    name: "Apple",
    clientId: process.env.APPLE_CLIENT_ID,
    clientSecret: process.env.APPLE_CLIENT_SECRET,
    authorizationUrl: "https://appleid.apple.com/auth/authorize",
    tokenUrl: "https://appleid.apple.com/auth/token",
    scopes: ["openid", "email", "name"],
  },
};

export function getOAuthProvider(slug: string) {
  return authProviders[slug];
}

export function getAuthBaseUrl(requestUrl?: string) {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  if (requestUrl) {
    return new URL(requestUrl).origin;
  }

  return "http://localhost:3000";
}
