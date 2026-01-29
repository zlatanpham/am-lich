import { NextResponse } from "next/server";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

/**
 * Debug endpoint to check notification system state
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json(
        { error: "Cron secret not configured" },
        { status: 500 },
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all notification preferences
    const allPrefs = await db.notificationPreference.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            pushSubscription: true,
          },
        },
      },
    });

    // Get all lunar events
    const allEvents = await db.lunarEvent.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    // Get recent notification logs
    const recentLogs = await db.notificationLog.findMany({
      take: 5,
      orderBy: { sentAt: "desc" },
    });

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      today: today.toISOString(),
      summary: {
        totalPreferences: allPrefs.length,
        enabledUsers: allPrefs.filter((p) => p.enabled).length,
        usersWithPushSubscription: allPrefs.filter(
          (p) => p.user.pushSubscription,
        ).length,
        totalEvents: await db.lunarEvent.count(),
      },
      preferences: allPrefs.map((p) => ({
        userId: p.userId,
        userEmail: p.user.email,
        enabled: p.enabled,
        lastNotifiedAt: p.lastNotifiedAt,
        notificationTime: p.notificationTime,
        personalEvents: p.personalEvents,
        sharedEvents: p.sharedEvents,
        systemEvents: p.systemEvents,
        hasPushSubscription: !!p.user.pushSubscription,
        pushSubscriptionEndpoint: p.user.pushSubscription?.endpoint
          ? `${p.user.pushSubscription.endpoint.substring(0, 50)}...`
          : null,
      })),
      recentEvents: allEvents,
      recentLogs: recentLogs,
    });
  } catch (error) {
    console.error("[DEBUG] Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
