import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { User } from "./models";
export const sessionCookie = "pkida_session";
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
function secret() {
  const value = process.env.SESSION_SECRET;
  if (value && value.length >= 32) return value;
  if (process.env.NODE_ENV === "production")
    throw new Error("SESSION_SECRET must contain at least 32 characters");
  return "pkida-development-only-secret-do-not-use-in-production";
}
export function sign(value: object) {
  const payload = Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${payload}.${createHmac("sha256", secret()).update(payload).digest("base64url")}`;
}
export function verify<T>(value?: string): T | null {
  if (!value) return null;
  try {
    const [payload, signature] = value.split(".");
    const expected = createHmac("sha256", secret()).update(payload).digest();
    const actual = Buffer.from(signature, "base64url");
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual))
      return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof data.exp === "number" && data.exp > Date.now()
      ? (data as T)
      : null;
  } catch {
    return null;
  }
}
export async function getUser() {
  const session = verify<User & { exp: number }>(
    (await cookies()).get(sessionCookie)?.value,
  );
  return session && typeof session.id === "string"
    ? { id: session.id, name: session.name, email: session.email }
    : null;
}
export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/connexion");
  return user;
}
export async function setSession(user: User) {
  (await cookies()).set(
    sessionCookie,
    sign({ ...user, exp: Date.now() + 7 * 86400000 }),
    { ...cookieOptions, maxAge: 7 * 86400 },
  );
}
export function baseUrl() {
  return (process.env.APP_BASE_URL || "http://localhost:3001").replace(
    /\/$/,
    "",
  );
}
export function sameOrigin(request: Request) {
  return request.headers.get("origin") === new URL(baseUrl()).origin;
}
export function providerConfig(provider: string) {
  if (provider !== "google" && provider !== "linkedin") return null;
  const google = provider === "google";
  return {
    clientId: process.env[`${provider.toUpperCase()}_CLIENT_ID`],
    clientSecret: process.env[`${provider.toUpperCase()}_CLIENT_SECRET`],
    authorization: google
      ? "https://accounts.google.com/o/oauth2/v2/auth"
      : "https://www.linkedin.com/oauth/v2/authorization",
    token: google
      ? "https://oauth2.googleapis.com/token"
      : "https://www.linkedin.com/oauth/v2/accessToken",
    userinfo: google
      ? "https://openidconnect.googleapis.com/v1/userinfo"
      : "https://api.linkedin.com/v2/userinfo",
  };
}
