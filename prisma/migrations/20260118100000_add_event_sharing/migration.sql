-- CreateEnum
CREATE TYPE "EventShareStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED');

-- CreateTable
CREATE TABLE "EventShare" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "recipientId" TEXT,
    "recipientEmail" TEXT NOT NULL,
    "status" "EventShareStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "declinedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "EventShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventShareInvitation" (
    "id" TEXT NOT NULL,
    "eventShareId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventShareInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventShare_ownerId_idx" ON "EventShare"("ownerId");

-- CreateIndex
CREATE INDEX "EventShare_recipientId_idx" ON "EventShare"("recipientId");

-- CreateIndex
CREATE INDEX "EventShare_recipientEmail_idx" ON "EventShare"("recipientEmail");

-- CreateIndex
CREATE UNIQUE INDEX "EventShare_ownerId_recipientEmail_key" ON "EventShare"("ownerId", "recipientEmail");

-- CreateIndex
CREATE UNIQUE INDEX "EventShareInvitation_eventShareId_key" ON "EventShareInvitation"("eventShareId");

-- CreateIndex
CREATE UNIQUE INDEX "EventShareInvitation_token_key" ON "EventShareInvitation"("token");

-- CreateIndex
CREATE INDEX "EventShareInvitation_token_idx" ON "EventShareInvitation"("token");

-- CreateIndex
CREATE INDEX "EventShareInvitation_email_idx" ON "EventShareInvitation"("email");

-- AddForeignKey
ALTER TABLE "EventShare" ADD CONSTRAINT "EventShare_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventShare" ADD CONSTRAINT "EventShare_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventShareInvitation" ADD CONSTRAINT "EventShareInvitation_eventShareId_fkey" FOREIGN KEY ("eventShareId") REFERENCES "EventShare"("id") ON DELETE CASCADE ON UPDATE CASCADE;
