-- CreateTable
CREATE TABLE "public"."Event" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VietnameseLunarEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "lunarYear" INTEGER NOT NULL,
    "lunarMonth" SMALLINT NOT NULL,
    "lunarDay" SMALLINT NOT NULL,
    "vietnameseZodiacYear" VARCHAR(50) NOT NULL,
    "eventType" VARCHAR(50) NOT NULL DEFAULT 'personal',
    "culturalSignificance" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "reminderDays" SMALLINT NOT NULL DEFAULT 3,
    "isAncestorWorship" BOOLEAN NOT NULL DEFAULT false,
    "ancestorName" VARCHAR(255),
    "isLeapMonth" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VietnameseLunarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VietnameseNotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enablePushNotifications" BOOLEAN NOT NULL DEFAULT false,
    "enableEmailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "defaultReminderDays" SMALLINT NOT NULL DEFAULT 3,
    "remindForMong1" BOOLEAN NOT NULL DEFAULT true,
    "remindForRam" BOOLEAN NOT NULL DEFAULT true,
    "remindForAncestorWorship" BOOLEAN NOT NULL DEFAULT true,
    "remindForTraditionalHolidays" BOOLEAN NOT NULL DEFAULT true,
    "preferredLanguage" VARCHAR(10) NOT NULL DEFAULT 'vi',
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    "culturalReminderLevel" VARCHAR(20) NOT NULL DEFAULT 'moderate',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VietnameseNotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VietnameseHoliday" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "lunarMonth" SMALLINT,
    "lunarDay" SMALLINT,
    "gregorianMonth" SMALLINT,
    "gregorianDay" SMALLINT,
    "description" TEXT,
    "category" VARCHAR(50) NOT NULL,
    "culturalSignificance" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VietnameseHoliday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VietnameseZodiacInfo" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "vietnameseYear" VARCHAR(50) NOT NULL,
    "canChi" VARCHAR(20) NOT NULL,
    "animalName" VARCHAR(50) NOT NULL,
    "element" VARCHAR(20) NOT NULL,
    "characteristics" TEXT,
    "luckyNumbers" VARCHAR(100),
    "luckyColors" VARCHAR(100),
    "culturalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VietnameseZodiacInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VietnameseCulturalTip" (
    "id" TEXT NOT NULL,
    "lunarDay" SMALLINT NOT NULL,
    "tipCategory" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "culturalContext" TEXT,
    "isGoodDay" BOOLEAN NOT NULL DEFAULT true,
    "priority" SMALLINT NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VietnameseCulturalTip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Event_userId_date_idx" ON "public"."Event"("userId", "date");

-- CreateIndex
CREATE INDEX "VietnameseLunarEvent_userId_lunarYear_lunarMonth_idx" ON "public"."VietnameseLunarEvent"("userId", "lunarYear", "lunarMonth");

-- CreateIndex
CREATE INDEX "VietnameseLunarEvent_eventType_lunarMonth_lunarDay_idx" ON "public"."VietnameseLunarEvent"("eventType", "lunarMonth", "lunarDay");

-- CreateIndex
CREATE INDEX "VietnameseLunarEvent_isAncestorWorship_userId_idx" ON "public"."VietnameseLunarEvent"("isAncestorWorship", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "VietnameseNotificationPreference_userId_key" ON "public"."VietnameseNotificationPreference"("userId");

-- CreateIndex
CREATE INDEX "VietnameseHoliday_lunarMonth_lunarDay_idx" ON "public"."VietnameseHoliday"("lunarMonth", "lunarDay");

-- CreateIndex
CREATE INDEX "VietnameseHoliday_gregorianMonth_gregorianDay_idx" ON "public"."VietnameseHoliday"("gregorianMonth", "gregorianDay");

-- CreateIndex
CREATE INDEX "VietnameseHoliday_category_idx" ON "public"."VietnameseHoliday"("category");

-- CreateIndex
CREATE UNIQUE INDEX "VietnameseZodiacInfo_year_key" ON "public"."VietnameseZodiacInfo"("year");

-- CreateIndex
CREATE INDEX "VietnameseZodiacInfo_year_idx" ON "public"."VietnameseZodiacInfo"("year");

-- CreateIndex
CREATE INDEX "VietnameseCulturalTip_lunarDay_tipCategory_idx" ON "public"."VietnameseCulturalTip"("lunarDay", "tipCategory");

-- CreateIndex
CREATE INDEX "VietnameseCulturalTip_isGoodDay_priority_idx" ON "public"."VietnameseCulturalTip"("isGoodDay", "priority");

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VietnameseLunarEvent" ADD CONSTRAINT "VietnameseLunarEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VietnameseNotificationPreference" ADD CONSTRAINT "VietnameseNotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
