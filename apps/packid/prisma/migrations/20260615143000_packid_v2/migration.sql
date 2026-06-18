DROP TABLE IF EXISTS "candidates" CASCADE;

CREATE TYPE "CandidateStatus" AS ENUM (
  'INVITED',
  'STARTED',
  'COMPLETED',
  'ANALYZED',
  'SHORTLISTED',
  'REJECTED',
  'HIRED'
);

CREATE TYPE "MessageRole" AS ENUM (
  'SYSTEM',
  'ASSISTANT',
  'USER'
);

CREATE TYPE "Recommendation" AS ENUM (
  'REJECT',
  'CONSIDER',
  'INTERVIEW',
  'STRONG_MATCH'
);

CREATE TYPE "EstimatedLevel" AS ENUM (
  'JUNIOR',
  'INTERMEDIATE',
  'SENIOR',
  'LEAD'
);

CREATE TABLE "Company" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Recruiter" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Recruiter_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JobOffer" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "requiredSkills" JSONB NOT NULL,
  "companyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "JobOffer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Candidate" (
  "id" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "email" TEXT,
  "phoneNumber" TEXT,
  "resumeUrl" TEXT,
  "status" "CandidateStatus" NOT NULL DEFAULT 'INVITED',
  "score" DOUBLE PRECISION,
  "jobOfferId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InvitationToken" (
  "id" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "candidateId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InvitationToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Conversation" (
  "id" TEXT NOT NULL,
  "candidateId" TEXT NOT NULL,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Message" (
  "id" TEXT NOT NULL,
  "role" "MessageRole" NOT NULL,
  "content" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Report" (
  "id" TEXT NOT NULL,
  "candidateId" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "strengths" JSONB NOT NULL,
  "weaknesses" JSONB NOT NULL,
  "estimatedLevel" "EstimatedLevel" NOT NULL,
  "score" DOUBLE PRECISION NOT NULL,
  "recommendation" "Recommendation" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Recruiter_email_key" ON "Recruiter"("email");
CREATE UNIQUE INDEX "InvitationToken_token_key" ON "InvitationToken"("token");

ALTER TABLE "Recruiter"
  ADD CONSTRAINT "Recruiter_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "JobOffer"
  ADD CONSTRAINT "JobOffer_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Candidate"
  ADD CONSTRAINT "Candidate_jobOfferId_fkey"
  FOREIGN KEY ("jobOfferId") REFERENCES "JobOffer"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InvitationToken"
  ADD CONSTRAINT "InvitationToken_candidateId_fkey"
  FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Conversation"
  ADD CONSTRAINT "Conversation_candidateId_fkey"
  FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Message"
  ADD CONSTRAINT "Message_conversationId_fkey"
  FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Report"
  ADD CONSTRAINT "Report_candidateId_fkey"
  FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
