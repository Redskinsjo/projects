-- CreateTable
CREATE TABLE "candidates" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "role" VARCHAR(255) NOT NULL,
    "match" VARCHAR(10),
    "cv" VARCHAR(50) NOT NULL,
    "cvLink" TEXT NOT NULL,
    "conversation" VARCHAR(50) NOT NULL,
    "conversationKeywords" TEXT[],
    "keyword" VARCHAR(255) NOT NULL,
    "refs" VARCHAR(50) NOT NULL,
    "referent" VARCHAR(255) NOT NULL,
    "personalEmail" VARCHAR(255) NOT NULL,
    "personalPhone" VARCHAR(20) NOT NULL,
    "personalLocation" VARCHAR(255) NOT NULL,
    "personalExperience" VARCHAR(50) NOT NULL,
    "personalAvailability" VARCHAR(50) NOT NULL,
    "personalSummary" TEXT NOT NULL,
    "history" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);
