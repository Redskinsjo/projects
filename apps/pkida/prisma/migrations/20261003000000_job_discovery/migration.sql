ALTER TYPE "ResearchStatus" ADD VALUE 'ACTIVE';
ALTER TYPE "ResearchStatus" ADD VALUE 'PAUSED';

CREATE TYPE "OfferStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REMOVED');
CREATE TYPE "OfferSourceType" AS ENUM ('CAREER_SITE', 'JOB_BOARD', 'SOCIAL_NETWORK', 'OTHER');
CREATE TYPE "SearchRunStatus" AS ENUM ('RUNNING', 'SUCCEEDED', 'FAILED');

ALTER TABLE "pkida_researches"
  ADD COLUMN "lastRunAt" TIMESTAMP(3),
  ADD COLUMN "nextRunAt" TIMESTAMP(3),
  ADD COLUMN "lastError" TEXT;

CREATE TABLE "pkida_companies" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "website" TEXT,
  "domain" TEXT,
  "description" TEXT NOT NULL DEFAULT '',
  "sector" TEXT NOT NULL DEFAULT '',
  "industry" TEXT NOT NULL DEFAULT '',
  "location" TEXT NOT NULL DEFAULT '',
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pkida_companies_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "pkida_companies_domain_key" ON "pkida_companies"("domain");
CREATE INDEX "pkida_companies_name_idx" ON "pkida_companies"("name");

CREATE TABLE "pkida_job_offers" (
  "id" TEXT NOT NULL,
  "companyId" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "location" TEXT NOT NULL DEFAULT '',
  "employmentType" TEXT NOT NULL DEFAULT '',
  "workplaceType" TEXT NOT NULL DEFAULT '',
  "salaryMin" DOUBLE PRECISION,
  "salaryMax" DOUBLE PRECISION,
  "salaryCurrency" TEXT,
  "postedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "status" "OfferStatus" NOT NULL DEFAULT 'ACTIVE',
  "canonicalUrl" TEXT NOT NULL,
  "rawMetadata" JSONB,
  "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pkida_job_offers_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "pkida_job_offers_canonicalUrl_key" ON "pkida_job_offers"("canonicalUrl");
CREATE INDEX "pkida_job_offers_status_lastSeenAt_idx" ON "pkida_job_offers"("status", "lastSeenAt");
CREATE INDEX "pkida_job_offers_companyId_idx" ON "pkida_job_offers"("companyId");
ALTER TABLE "pkida_job_offers" ADD CONSTRAINT "pkida_job_offers_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "pkida_companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "pkida_offer_sources" (
  "id" TEXT NOT NULL,
  "offerId" TEXT NOT NULL,
  "type" "OfferSourceType" NOT NULL,
  "name" TEXT NOT NULL,
  "sourceUrl" TEXT NOT NULL,
  "externalId" TEXT,
  "metadata" JSONB,
  "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pkida_offer_sources_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "pkida_offer_sources_sourceUrl_key" ON "pkida_offer_sources"("sourceUrl");
CREATE INDEX "pkida_offer_sources_offerId_idx" ON "pkida_offer_sources"("offerId");
ALTER TABLE "pkida_offer_sources" ADD CONSTRAINT "pkida_offer_sources_offerId_fkey"
  FOREIGN KEY ("offerId") REFERENCES "pkida_job_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "pkida_research_matches" (
  "id" TEXT NOT NULL,
  "researchId" TEXT NOT NULL,
  "offerId" TEXT NOT NULL,
  "score" INTEGER NOT NULL DEFAULT 0,
  "matchReasons" JSONB,
  "notifiedAt" TIMESTAMP(3),
  "dismissedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pkida_research_matches_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "pkida_research_matches_researchId_offerId_key" ON "pkida_research_matches"("researchId", "offerId");
CREATE INDEX "pkida_research_matches_researchId_notifiedAt_createdAt_idx" ON "pkida_research_matches"("researchId", "notifiedAt", "createdAt");
ALTER TABLE "pkida_research_matches" ADD CONSTRAINT "pkida_research_matches_researchId_fkey"
  FOREIGN KEY ("researchId") REFERENCES "pkida_researches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pkida_research_matches" ADD CONSTRAINT "pkida_research_matches_offerId_fkey"
  FOREIGN KEY ("offerId") REFERENCES "pkida_job_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "pkida_search_runs" (
  "id" TEXT NOT NULL,
  "researchId" TEXT NOT NULL,
  "status" "SearchRunStatus" NOT NULL DEFAULT 'RUNNING',
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "resultCount" INTEGER NOT NULL DEFAULT 0,
  "error" TEXT,
  CONSTRAINT "pkida_search_runs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "pkida_search_runs_researchId_startedAt_idx" ON "pkida_search_runs"("researchId", "startedAt");
ALTER TABLE "pkida_search_runs" ADD CONSTRAINT "pkida_search_runs_researchId_fkey"
  FOREIGN KEY ("researchId") REFERENCES "pkida_researches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
