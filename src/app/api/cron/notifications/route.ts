import { NextResponse } from "next/server";
import { processScheduledNotifications } from "@/lib/notifications";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes timeout for cron jobs

/**
 * Vercel Cron Job - Runs daily at 9:00 AM
 *
 * This cron job processes ALL users who have push notifications enabled
 * and sends them notifications for upcoming events.
 *
 * Note: On Hobby plan, Vercel cron jobs have hourly precision with
 * up to 59 minutes delay. This endpoint processes all enabled users
 * regardless of when it runs within the hour.
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("[CRON] CRON_SECRET not configured");
      return NextResponse.json(
        { error: "Cron secret not configured" },
        { status: 500 },
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check VAPID configuration
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      console.error("[CRON] VAPID keys not configured");
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

    const now = new Date();
    const vietnamFormatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    console.log(
      `[CRON] Starting daily notification job at ${now.toISOString()} (UTC)`,
    );
    console.log(`[CRON] Vietnam time: ${vietnamFormatter.format(now)}`);

    // Check for force mode query parameter (for testing)
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";

    if (force) {
      console.log("[CRON] FORCE MODE: Bypassing lastNotifiedAt check");
    }

    // Process all enabled users with pending notifications
    const result = await processScheduledNotifications(force);

    console.log(
      `[CRON] Completed: ${result.processed} users processed, ${result.notificationsSent} notifications sent, ${result.errors} errors`,
    );

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      ...result,
    });
  } catch (error) {
    console.error("[CRON] Error in notification cron job:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
