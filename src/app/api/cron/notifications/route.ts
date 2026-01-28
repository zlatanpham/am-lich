import { NextResponse } from "next/server";
import { processScheduledNotifications } from "@/lib/notifications";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes timeout for cron jobs

/**
 * Vercel Cron Job - Runs daily at 9:00 AM
 *
 * IMPORTANT: On Hobby plan, Vercel cron jobs have hourly precision with
 * up to 59 minutes delay. A job scheduled for 9:00 can run anytime
 * between 9:00 and 9:59. All subscribed users will be notified at this time.
 *
 * This cron job processes ALL users who have push notifications enabled
 * and sends them notifications for upcoming events.
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("CRON_SECRET not configured");
      return NextResponse.json(
        { error: "Cron secret not configured" },
        { status: 500 },
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for force mode query parameter
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";

    // Get current time
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const actualTime = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;

    if (force) {
      console.log(
        `[CRON] FORCE MODE: Processing ALL enabled users regardless of notification time`,
      );
    } else {
      console.log(
        `[CRON] Daily notification job running at ${actualTime} (scheduled for 09:00)`,
      );
      console.log(
        `[CRON] Note: On Hobby plan, cron may run anytime within the hour`,
      );
    }

    // Process notifications
    // In normal mode: only users with notificationTime matching current time (9:00)
    // In force mode: all enabled users regardless of their notification time
    const result = await processScheduledNotifications(
      9, // Fixed at 9 AM
      0,
      force, // Pass force flag to process all enabled users when true
    );

    console.log(
      `[CRON] Completed: ${result.processed} users, ${result.notificationsSent} notifications, ${result.errors} errors`,
    );

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      scheduledTime: "09:00",
      actualRunTime: actualTime,
      force: force,
      note: force
        ? "Force mode: Processed all enabled users regardless of notification time"
        : "On Hobby plan, notifications may arrive up to 59 minutes after 9:00 AM",
      ...result,
    });
  } catch (error) {
    console.error("Error in notification cron job:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
