import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthProvider, Prisma } from "@/app/generated/prisma/client";
import { getAuthBaseUrl, getOAuthProvider } from "./authConfig";
import { upsertOAuthUser } from "./authService";

const OAUTH_STATE_COOKIE = "packid_oauth_state";

type TokenResponse = {
  access_token?: string;
  id_token?: string;
  token_type?: string;
  error?: string;
};

type OAuthProfile = {
  provider: AuthProvider;
  providerAccountId: string;
  email?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  emailVerified?: boolean;
  rawProfile?: Prisma.InputJsonValue;
};

function decodeJwtPayload(token: string) {
  const payload = token.split(".")[1];
  if (!payload) return null;

  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const json = Buffer.from(normalized, "base64").toString("utf8");

  return JSON.parse(json) as Record<string, unknown>;
}

function getRedirectUri(requestUrl: string, providerSlug: string) {
  return `${getAuthBaseUrl(requestUrl)}/api/auth/social/${providerSlug}/callback`;
}

function toInputJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function readString(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return undefined;
}

function parseAppleUser(user?: string | null) {
  if (!user) return null;

  try {
    return JSON.parse(user) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function startOAuthFlow(requestUrl: string, providerSlug: string) {
  const provider = getOAuthProvider(providerSlug);

  if (!provider?.clientId || !provider.clientSecret) {
    redirect(
      `/login?error=${encodeURIComponent(`${provider?.name ?? "Provider"} n'est pas configure.`)}`,
    );
  }

  const state = crypto.randomBytes(24).toString("base64url");
  const cookieStore = await cookies();
  cookieStore.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  });

  const authorizationUrl = new URL(provider.authorizationUrl);
  authorizationUrl.searchParams.set("client_id", provider.clientId);
  authorizationUrl.searchParams.set(
    "redirect_uri",
    getRedirectUri(requestUrl, providerSlug),
  );
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", provider.scopes.join(" "));
  authorizationUrl.searchParams.set("state", state);

  if (providerSlug === "apple") {
    authorizationUrl.searchParams.set("response_mode", "form_post");
  }

  redirect(authorizationUrl.toString());
}

async function exchangeCode(
  requestUrl: string,
  providerSlug: string,
  code: string,
) {
  const provider = getOAuthProvider(providerSlug);

  if (!provider?.clientId || !provider.clientSecret) {
    throw new Error("Provider OAuth non configure.");
  }

  const body = new URLSearchParams({
    client_id: provider.clientId,
    client_secret: provider.clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: getRedirectUri(requestUrl, providerSlug),
  });

  const response = await fetch(provider.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
  });
  const token = (await response.json()) as TokenResponse;

  if (!response.ok || token.error || (!token.access_token && !token.id_token)) {
    throw new Error("Echange OAuth impossible.");
  }

  return token;
}

async function fetchProfile(
  providerSlug: string,
  token: TokenResponse,
  appleUser?: Record<string, unknown> | null,
): Promise<OAuthProfile> {
  const provider = getOAuthProvider(providerSlug);

  if (!provider) {
    throw new Error("Provider inconnu.");
  }

  if (providerSlug === "apple") {
    const payload = token.id_token ? decodeJwtPayload(token.id_token) : null;
    const subject = typeof payload?.sub === "string" ? payload.sub : undefined;
    const email =
      typeof payload?.email === "string" ? payload.email : undefined;
    const appleName =
      appleUser && typeof appleUser.name === "object" && appleUser.name !== null
        ? (appleUser.name as Record<string, unknown>)
        : null;
    const firstName =
      appleName && typeof appleName.firstName === "string"
        ? appleName.firstName
        : undefined;
    const lastName =
      appleName && typeof appleName.lastName === "string"
        ? appleName.lastName
        : undefined;
    const displayName = [firstName, lastName].filter(Boolean).join(" ") || undefined;

    if (!subject) {
      throw new Error("Profil Apple incomplet.");
    }

    return {
      provider: provider.provider,
      providerAccountId: subject,
      email,
      displayName,
      firstName,
      lastName,
      emailVerified:
        typeof payload?.email_verified === "string"
          ? payload.email_verified === "true"
          : typeof payload?.email_verified === "boolean"
            ? payload.email_verified
            : undefined,
      rawProfile: toInputJson({ idToken: payload, user: appleUser }),
    };
  }

  if (!provider.userInfoUrl || !token.access_token) {
    throw new Error("Profil OAuth indisponible.");
  }

  const response = await fetch(provider.userInfoUrl, {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  const profile = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    throw new Error("Lecture du profil OAuth impossible.");
  }

  const providerAccountId =
    typeof profile.sub === "string"
      ? profile.sub
      : typeof profile.id === "string"
        ? profile.id
        : undefined;

  if (!providerAccountId) {
    throw new Error("Profil OAuth incomplet.");
  }

  return {
    provider: provider.provider,
    providerAccountId,
    email: readString(profile, "email", "preferred_username", "upn"),
    displayName: readString(profile, "name", "displayName"),
    firstName: readString(profile, "given_name", "givenName"),
    lastName: readString(profile, "family_name", "surname"),
    avatarUrl: readString(profile, "picture"),
    emailVerified:
      typeof profile.email_verified === "boolean"
        ? profile.email_verified
        : undefined,
    rawProfile: toInputJson(profile),
  };
}

export async function completeOAuthFlow(
  requestUrl: string,
  providerSlug: string,
  params: { code?: string | null; state?: string | null; user?: string | null },
) {
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  cookieStore.delete(OAUTH_STATE_COOKIE);

  if (!params.code || !params.state || params.state !== expectedState) {
    throw new Error("Etat OAuth invalide.");
  }

  const token = await exchangeCode(requestUrl, providerSlug, params.code);
  const profile = await fetchProfile(
    providerSlug,
    token,
    parseAppleUser(params.user),
  );

  await upsertOAuthUser(profile);
}
