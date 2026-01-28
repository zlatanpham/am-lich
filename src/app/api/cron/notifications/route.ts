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

    // Get current time
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const actualTime = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;

    console.log(
      `[CRON] Daily notification job running at ${actualTime} (scheduled for 09:00)`,
    );
    console.log(
      `[CRON] Note: On Hobby plan, cron may run anytime within the hour`,
    );

    // Process notifications for ALL users with enabled notifications
    // Fixed at 9:00 AM - all users get notified at this time
    const result = await processScheduledNotifications(
      9, // Fixed at 9 AM
      0,
    );

    console.log(
      `[CRON] Completed: ${result.processed} users, ${result.notificationsSent} notifications, ${result.errors} errors`,
    );

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      scheduledTime: "09:00",
      actualRunTime: actualTime,
      note: "On Hobby plan, notifications may arrive up to 59 minutes after 9:00 AM",
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
