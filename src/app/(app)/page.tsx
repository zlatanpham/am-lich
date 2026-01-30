import { CurrentDateDisplay } from "@/components/lunar/current-date-display";
import { UpcomingImportantDates } from "@/components/lunar/upcoming-important-dates";
import { CalendarGrid } from "@/components/lunar/calendar-grid";

export default function HomePage() {
  return (
    <div className="space-y-8 py-4 sm:py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column - Current date and upcoming important dates */}
        <div className="space-y-6 lg:col-span-1">
          <CurrentDateDisplay />
          <UpcomingImportantDates />
        </div>

        {/* Right column - Calendar grid */}
        <div className="lg:col-span-2">
          <CalendarGrid showEvents={true} showSharedEvents={true} />
        </div>
      </div>
    </div>
  );
}
