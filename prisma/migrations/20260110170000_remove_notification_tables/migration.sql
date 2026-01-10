-- DropForeignKey
ALTER TABLE "public"."NotificationPreference" DROP CONSTRAINT "NotificationPreference_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PushSubscription" DROP CONSTRAINT "PushSubscription_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."VietnameseNotificationPreference" DROP CONSTRAINT "VietnameseNotificationPreference_userId_fkey";

-- DropTable
DROP TABLE "public"."NotificationPreference";

-- DropTable
DROP TABLE "public"."PushSubscription";

-- DropTable
DROP TABLE "public"."VietnameseNotificationPreference";
