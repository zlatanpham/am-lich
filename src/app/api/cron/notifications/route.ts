import { NextResponse } from "next/server";
import { processScheduledNotifications } from "@/lib/notifications";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes timeout for cron jobs

/**
 * Vercel Cron Job - Runs every hour
 * Checks for users whose notification time matches current time
 * and sends them push notifications for upcoming events
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

    console.log(
      `Running notification cron job at ${currentHour}:${currentMinute.toString().padStart(2, "0")}`,
    );

    // Process notifications for users whose preferred time matches current time
    const result = await processScheduledNotifications(
      currentHour,
      currentMinute,
    );

    console.log(
      `Cron job completed: ${result.processed} users processed, ${result.notificationsSent} notifications sent, ${result.errors} errors`,
    );

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      currentTime: `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`,
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
