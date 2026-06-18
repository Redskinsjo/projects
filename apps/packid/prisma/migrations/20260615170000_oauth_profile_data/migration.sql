ALTER TABLE "User" ADD COLUMN "avatarUrl" TEXT;

ALTER TABLE "OAuthAccount" ADD COLUMN "displayName" TEXT;
ALTER TABLE "OAuthAccount" ADD COLUMN "firstName" TEXT;
ALTER TABLE "OAuthAccount" ADD COLUMN "lastName" TEXT;
ALTER TABLE "OAuthAccount" ADD COLUMN "avatarUrl" TEXT;
ALTER TABLE "OAuthAccount" ADD COLUMN "rawProfile" JSONB;
