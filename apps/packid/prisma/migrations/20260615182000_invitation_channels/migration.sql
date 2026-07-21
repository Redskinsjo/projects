CREATE TYPE "CommunicationChannel" AS ENUM ('WHATSAPP', 'SMS', 'EMAIL');
CREATE TYPE "InvitationDeliveryStatus" AS ENUM ('PENDING', 'SENT', 'SIMULATED', 'FAILED');

ALTER TABLE "InvitationToken" ADD COLUMN "channel" "CommunicationChannel";
ALTER TABLE "InvitationToken" ADD COLUMN "deliveryStatus" "InvitationDeliveryStatus";
ALTER TABLE "InvitationToken" ADD COLUMN "deliveryMessage" TEXT;
ALTER TABLE "InvitationToken" ADD COLUMN "sentAt" TIMESTAMP(3);
