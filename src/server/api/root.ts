import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
import { organizationRouter } from "./routers/organization";
import { userRouter } from "./routers/user";
import { lunarCalendarRouter } from "./routers/lunar-calendar";
import { lunarEventsRouter } from "./routers/lunar-events";
import { notificationsRouter } from "./routers/notifications";
import { calendarExportRouter } from "./routers/calendar-export";

export const appRouter = createTRPCRouter({
  organization: organizationRouter,
  user: userRouter,
  lunarCalendar: lunarCalendarRouter,
  lunarEvents: lunarEventsRouter,
  notifications: notificationsRouter,
  calendarExport: calendarExportRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
