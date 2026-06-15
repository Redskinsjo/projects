import type { AuthProvider, Prisma } from "@/app/generated/prisma/client";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "../prisma";

const SESSION_COOKIE = "stormeye_session";
const SESSION_DURATION_DAYS = 30;
const PASSWORD_ITERATIONS = 210000;
const PASSWORD_KEY_LENGTH = 64;
const PASSWORD_DIGEST = "sha512";

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

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function hashPassword(password: string, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto
    .pbkdf2Sync(
      password,
      salt,
      PASSWORD_ITERATIONS,
      PASSWORD_KEY_LENGTH,
      PASSWORD_DIGEST,
    )
    .toString("hex");

  return [
    "pbkdf2",
    PASSWORD_DIGEST,
    PASSWORD_ITERATIONS,
    salt,
    hash,
  ].join("$");
}

function verifyPassword(password: string, storedHash: string) {
  const [scheme, digest, iterations, salt, expected] = storedHash.split("$");

  if (scheme !== "pbkdf2" || !digest || !iterations || !salt || !expected) {
    return false;
  }

  const actual = crypto
    .pbkdf2Sync(
      password,
      salt,
      Number(iterations),
      Buffer.from(expected, "hex").length,
      digest,
    )
    .toString("hex");

  return crypto.timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(expected, "hex"));
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000,
  );

  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      user: {
        include: {
          oauthAccounts: { orderBy: { createdAt: "asc" } },
          passwordCredential: {
            select: {
              id: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          sessions: {
            orderBy: { createdAt: "desc" },
            take: 5,
            select: {
              id: true,
              expiresAt: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session.user;
}

export async function signUpWithPassword(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  const user = await prisma.user.create({
    data: {
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      passwordCredential: {
        create: {
          passwordHash: hashPassword(input.password),
        },
      },
    },
  });

  await createSession(user.id);

  return user;
}

export async function loginWithPassword(input: {
  email: string;
  password: string;
}) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { passwordCredential: true },
  });

  if (!user?.passwordCredential) {
    throw new Error("Identifiants invalides.");
  }

  if (!verifyPassword(input.password, user.passwordCredential.passwordHash)) {
    throw new Error("Identifiants invalides.");
  }

  await createSession(user.id);

  return user;
}

export async function upsertOAuthUser(profile: OAuthProfile) {
  const oauthData = {
    email: profile.email,
    displayName: profile.displayName,
    firstName: profile.firstName,
    lastName: profile.lastName,
    avatarUrl: profile.avatarUrl,
    rawProfile: profile.rawProfile,
  };

  const existingAccount = await prisma.oAuthAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider: profile.provider,
        providerAccountId: profile.providerAccountId,
      },
    },
    include: { user: true },
  });

  if (existingAccount) {
    await prisma.oAuthAccount.update({
      where: { id: existingAccount.id },
      data: oauthData,
    });

    const updatedUser = await prisma.user.update({
      where: { id: existingAccount.userId },
      data: {
        firstName: profile.firstName ?? existingAccount.user.firstName,
        lastName: profile.lastName ?? existingAccount.user.lastName,
        avatarUrl: profile.avatarUrl ?? existingAccount.user.avatarUrl,
        emailVerifiedAt:
          profile.email && profile.emailVerified !== false
            ? (existingAccount.user.emailVerifiedAt ?? new Date())
            : existingAccount.user.emailVerifiedAt,
      },
    });

    await createSession(existingAccount.userId);
    return updatedUser;
  }

  const existingUser = profile.email
    ? await prisma.user.findUnique({ where: { email: profile.email } })
    : null;

  const user =
    existingUser ??
    (await prisma.user.create({
      data: {
        email:
          profile.email ??
          `${profile.provider.toLowerCase()}-${profile.providerAccountId}@stormeye.local`,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarUrl: profile.avatarUrl,
        emailVerifiedAt:
          profile.email && profile.emailVerified !== false ? new Date() : null,
      },
    }));

  const userWithProviderData = existingUser
    ? await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          firstName: profile.firstName ?? existingUser.firstName,
          lastName: profile.lastName ?? existingUser.lastName,
          avatarUrl: profile.avatarUrl ?? existingUser.avatarUrl,
          emailVerifiedAt:
            profile.email && profile.emailVerified !== false
              ? (existingUser.emailVerifiedAt ?? new Date())
              : existingUser.emailVerifiedAt,
        },
      })
    : user;

  await prisma.oAuthAccount.create({
    data: {
      userId: userWithProviderData.id,
      provider: profile.provider,
      providerAccountId: profile.providerAccountId,
      ...oauthData,
    },
  });

  await createSession(userWithProviderData.id);

  return userWithProviderData;
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}
