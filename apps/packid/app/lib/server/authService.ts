import type { AuthProvider, Prisma } from "@/app/generated/prisma/client";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "../prisma";
import { sendPasswordResetEmail } from "./emailService";

const SESSION_COOKIE = "packid_session";
const SESSION_DURATION_DAYS = 30;
const PASSWORD_RESET_DURATION_MINUTES = 60;
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

function maskEmail(email: string) {
  const [localPart, domain] = email.split("@");

  if (!localPart || !domain) {
    return "***";
  }

  return `${localPart.slice(0, 1)}***@${domain}`;
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
          organizationMembers: {
            orderBy: { createdAt: "asc" },
            include: { organization: true },
          },
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

export async function getCurrentOrganization() {
  const user = await getCurrentUser();

  return user?.organizationMembers[0]?.organization ?? null;
}

export async function isOrganizationNameAvailable(name: string) {
  const normalizedName = name.trim();

  if (!normalizedName) {
    return false;
  }

  const existingOrganization = await prisma.organization.findFirst({
    where: {
      name: {
        equals: normalizedName,
        mode: "insensitive",
      },
    },
    select: { id: true },
  });

  return !existingOrganization;
}

export async function requireCurrentOrganization() {
  const organization = await getCurrentOrganization();

  if (!organization) {
    throw new Error("Organisation requise.");
  }

  return organization;
}

export async function createOrganizationForCurrentUser(input: { name: string }) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Connexion requise.");
  }

  const existingMembership = user.organizationMembers[0];

  if (existingMembership) {
    return existingMembership.organization;
  }

  const isAvailable = await isOrganizationNameAvailable(input.name);

  if (!isAvailable) {
    throw new Error("Ce nom d'organisation est deja utilise.");
  }

  return prisma.organization.create({
    data: {
      name: input.name.trim(),
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
        },
      },
    },
  });
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
    include: {
      passwordCredential: true,
      organizationMembers: {
        orderBy: { createdAt: "asc" },
        include: { organization: true },
      },
    },
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

export async function changePassword(input: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}) {
  const credential = await prisma.passwordCredential.findUnique({
    where: { userId: input.userId },
  });

  if (!credential) {
    throw new Error("La connexion par mot de passe n'est pas configuree.");
  }

  if (!verifyPassword(input.currentPassword, credential.passwordHash)) {
    throw new Error("Mot de passe actuel incorrect.");
  }

  await prisma.passwordCredential.update({
    where: { userId: input.userId },
    data: { passwordHash: hashPassword(input.newPassword) },
  });
}

function getResetBaseUrl(requestUrl: string) {
  return process.env.APP_BASE_URL || new URL(requestUrl).origin;
}

export async function requestPasswordReset(input: {
  email: string;
  requestUrl: string;
}) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { passwordCredential: true },
  });

  if (!user) {
    console.info("Password reset skipped: user not found", {
      email: maskEmail(input.email),
    });

    return { sent: false, simulated: false };
  }

  if (!user.passwordCredential) {
    console.info("Password reset skipped: user has no password credential", {
      email: maskEmail(user.email),
    });

    return { sent: false, simulated: false };
  }

  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(
    Date.now() + PASSWORD_RESET_DURATION_MINUTES * 60 * 1000,
  );

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt,
    },
  });

  const resetUrl = `${getResetBaseUrl(input.requestUrl)}/reset-password?token=${token}`;

  console.info("Password reset token created", {
    email: maskEmail(user.email),
    expiresAt,
  });

  const delivery = await sendPasswordResetEmail({
    to: user.email,
    resetUrl,
  });

  console.info("Password reset email delivery result", {
    email: maskEmail(user.email),
    sent: delivery.sent,
    simulated: delivery.simulated,
  });

  return delivery;
}

export async function resetPasswordWithToken(input: {
  token: string;
  password: string;
}) {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(input.token) },
    include: { user: { include: { passwordCredential: true } } },
  });

  if (
    !resetToken ||
    resetToken.usedAt ||
    resetToken.expiresAt < new Date() ||
    !resetToken.user.passwordCredential
  ) {
    throw new Error("Lien de reinitialisation invalide ou expire.");
  }

  await prisma.$transaction([
    prisma.passwordCredential.update({
      where: { userId: resetToken.userId },
      data: { passwordHash: hashPassword(input.password) },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
    prisma.session.deleteMany({ where: { userId: resetToken.userId } }),
  ]);
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
    include: {
      user: {
        include: {
          organizationMembers: {
            orderBy: { createdAt: "asc" },
            include: { organization: true },
          },
        },
      },
    },
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
    return {
      ...updatedUser,
      organizationMembers: existingAccount.user.organizationMembers,
    };
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
          `${profile.provider.toLowerCase()}-${profile.providerAccountId}@packid.local`,
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

  const userWithOrganization = await prisma.user.findUniqueOrThrow({
    where: { id: userWithProviderData.id },
    include: {
      organizationMembers: {
        orderBy: { createdAt: "asc" },
        include: { organization: true },
      },
    },
  });

  return userWithOrganization;
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}
