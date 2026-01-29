import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { sendPushNotification } from "@/lib/notifications";
import type webpush from "web-push";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Test Push Notification Endpoint
 *
 * This endpoint sends a test push notification to verify the push notification system is working.
 * It can be triggered:
 * 1. Manually via Vercel Cron Jobs dashboard (intended use)
 * 2. Via HTTP GET request with CRON_SECRET authorization header
 *
 * Query Parameters:
 * - userId: Optional. Send notification to a specific user. If not provided, sends to the first available subscription.
 *
 * Cron Schedule: 0 0 1 1 * (January 1st at midnight - scheduled for year 2126 in vercel.json so it won't auto-run)
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("[TEST PUSH] CRON_SECRET not configured");
      return NextResponse.json(
        { error: "Cron secret not configured" },
        { status: 500 },
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get optional userId from query parameters
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("userId");

    console.log("[TEST PUSH] Starting test push notification...");

    // Check VAPID configuration
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      console.error("[TEST PUSH] VAPID keys not configured");
      return NextResponse.json(
        {
          error: "VAPID keys not configured",
          missing: {
            VAPID_PUBLIC_KEY: !process.env.VAPID_PUBLIC_KEY,
            VAPID_PRIVATE_KEY: !process.env.VAPID_PRIVATE_KEY,
          },
          message:
            "Please set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, and VAPID_SUBJECT environment variables",
        },
        { status: 500 },
      );
    }

    // Find push subscription
    let subscription;
    let userId: string;

    if (targetUserId) {
      // Get specific user's subscription
      subscription = await db.pushSubscription.findUnique({
        where: { userId: targetUserId },
      });
      userId = targetUserId;

      if (!subscription) {
        return NextResponse.json(
          {
            error: "User not found or has no push subscription",
            userId: targetUserId,
          },
          { status: 404 },
        );
      }
    } else {
      // Get the first available subscription
      subscription = await db.pushSubscription.findFirst({
        include: {
          user: {
            select: { id: true, email: true, name: true },
          },
        },
      });

      if (!subscription) {
        return NextResponse.json(
          {
            error: "No push subscriptions found in database",
            message: "Please have a user subscribe to push notifications first",
          },
          { status: 404 },
        );
      }

      userId = subscription.userId;
    }

    // Get user details
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    console.log(
      `[TEST PUSH] Sending test notification to user: ${user?.email ?? userId}`,
    );

    // Prepare webpush subscription object
    const pushSubscription: webpush.PushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };

    // Send test notification
    const result = await sendPushNotification(pushSubscription, {
      title: "🧪 Test Push Notification",
      body: `This is a test notification sent at ${new Date().toLocaleString()}`,
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
      tag: "test-notification",
      url: "/",
      requireInteraction: false,
    });

    // Log the test notification
    await db.notificationLog.create({
      data: {
        userId,
        eventType: "system",
        title: "🧪 Test Push Notification",
        body: `Test notification sent at ${new Date().toISOString()}`,
        success: result.success,
        error: result.error ?? null,
      },
    });

    if (result.success) {
      console.log(`[TEST PUSH] Successfully sent to ${user?.email ?? userId}`);

      return NextResponse.json({
        success: true,
        message: "Test push notification sent successfully",
        timestamp: new Date().toISOString(),
        recipient: {
          userId,
          email: user?.email,
          name: user?.name,
        },
        note: "This endpoint is designed to be triggered manually from Vercel Cron Jobs dashboard",
      });
    } else {
      console.error(
        `[TEST PUSH] Failed to send to ${user?.email ?? userId}:`,
        result.error,
      );

      return NextResponse.json(
        {
          success: false,
          error: "Failed to send push notification",
          details: result.error,
          recipient: {
            userId,
            email: user?.email,
            name: user?.name,
          },
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error(
      "[TEST PUSH] Error in test push notification endpoint:",
      error,
    );
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
