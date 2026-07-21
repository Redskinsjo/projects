CREATE TABLE "Organization" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrganizationMember" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'OWNER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Company" ADD COLUMN "organizationId" TEXT;

INSERT INTO "Organization" ("id", "name", "updatedAt")
SELECT 'default-packid-organization', 'Organisation Packid', CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "Organization" WHERE "id" = 'default-packid-organization'
);

UPDATE "Company"
SET "organizationId" = 'default-packid-organization'
WHERE "organizationId" IS NULL;

INSERT INTO "OrganizationMember" ("id", "userId", "organizationId", "role", "updatedAt")
SELECT concat('default-org-member-', "id"), "id", 'default-packid-organization', 'OWNER', CURRENT_TIMESTAMP
FROM "User"
WHERE NOT EXISTS (
  SELECT 1
  FROM "OrganizationMember"
  WHERE "OrganizationMember"."userId" = "User"."id"
    AND "OrganizationMember"."organizationId" = 'default-packid-organization'
);

ALTER TABLE "Company" ALTER COLUMN "organizationId" SET NOT NULL;

CREATE UNIQUE INDEX "OrganizationMember_userId_organizationId_key" ON "OrganizationMember"("userId", "organizationId");
CREATE INDEX "OrganizationMember_organizationId_idx" ON "OrganizationMember"("organizationId");
CREATE INDEX "Company_organizationId_idx" ON "Company"("organizationId");

ALTER TABLE "OrganizationMember"
  ADD CONSTRAINT "OrganizationMember_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrganizationMember"
  ADD CONSTRAINT "OrganizationMember_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Company"
  ADD CONSTRAINT "Company_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
