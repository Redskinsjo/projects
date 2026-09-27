-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ResearchStatus" AS ENUM ('PREPARED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('IN_PROGRESS', 'SENT', 'INTERVIEW', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "pkida_users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pkida_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pkida_profiles" (
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "location" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT '',
    "salary" DOUBLE PRECISION NOT NULL DEFAULT 40000,
    "experience" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "about" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pkida_profiles_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "pkida_researches" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "salary" DOUBLE PRECISION NOT NULL,
    "experience" DOUBLE PRECISION NOT NULL,
    "contract" TEXT NOT NULL,
    "remote" TEXT NOT NULL,
    "pace" INTEGER NOT NULL,
    "keywords" TEXT NOT NULL DEFAULT '',
    "exclusions" TEXT NOT NULL DEFAULT '',
    "review" BOOLEAN NOT NULL DEFAULT true,
    "status" "ResearchStatus" NOT NULL DEFAULT 'PREPARED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pkida_researches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pkida_applications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "researchId" TEXT,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "sourceUrl" TEXT,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pkida_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pkida_resumes" (
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "content" BYTEA NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pkida_resumes_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE INDEX "pkida_researches_userId_createdAt_idx" ON "pkida_researches"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "pkida_researches_id_userId_key" ON "pkida_researches"("id", "userId");

-- CreateIndex
CREATE INDEX "pkida_applications_userId_date_idx" ON "pkida_applications"("userId", "date");

-- CreateIndex
CREATE INDEX "pkida_applications_userId_status_idx" ON "pkida_applications"("userId", "status");

-- CreateIndex
CREATE INDEX "pkida_applications_researchId_userId_idx" ON "pkida_applications"("researchId", "userId");

-- AddForeignKey
ALTER TABLE "pkida_profiles" ADD CONSTRAINT "pkida_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "pkida_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pkida_researches" ADD CONSTRAINT "pkida_researches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "pkida_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pkida_applications" ADD CONSTRAINT "pkida_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "pkida_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pkida_applications" ADD CONSTRAINT "pkida_applications_researchId_userId_fkey" FOREIGN KEY ("researchId", "userId") REFERENCES "pkida_researches"("id", "userId") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pkida_resumes" ADD CONSTRAINT "pkida_resumes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "pkida_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

