-- CreateTable
CREATE TABLE "Petitioner" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "birthYear" INTEGER NOT NULL,
    "buddhistName" VARCHAR(255),
    "isHead" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Petitioner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrayerTemplate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrayerTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrayerSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "familySurname" VARCHAR(255),
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrayerSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Petitioner_userId_idx" ON "Petitioner"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PrayerTemplate_userId_type_key" ON "PrayerTemplate"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "PrayerSettings_userId_key" ON "PrayerSettings"("userId");

-- AddForeignKey
ALTER TABLE "Petitioner" ADD CONSTRAINT "Petitioner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerTemplate" ADD CONSTRAINT "PrayerTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerSettings" ADD CONSTRAINT "PrayerSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
