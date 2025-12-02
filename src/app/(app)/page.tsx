import { CurrentDateDisplay } from "@/components/lunar/current-date-display";
import { UpcomingImportantDates } from "@/components/lunar/upcoming-important-dates";
import { CalendarGrid } from "@/components/lunar/calendar-grid";

export default function HomePage() {
  return (
    <div className="space-y-8 py-4 sm:py-8">
      <div className="hidden space-y-2 text-center sm:block">
        <h1 className="text-3xl font-bold">Lịch Âm</h1>
        <p className="text-muted-foreground">
          Xem ngày tháng âm lịch, lễ hội quan trọng và thông tin thiên văn
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column - Current date and upcoming important dates */}
        <div className="space-y-6 lg:col-span-1">
          <CurrentDateDisplay />
          <UpcomingImportantDates />
        </div>

        {/* Right column - Calendar grid */}
        <div className="lg:col-span-2">
          <CalendarGrid showEvents={true} />
        </div>
      </div>
    </div>
  );
}
