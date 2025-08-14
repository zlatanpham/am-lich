import { CurrentDateDisplay } from "@/components/lunar/current-date-display";
import { UpcomingImportantDates } from "@/components/lunar/upcoming-important-dates";
import { CalendarGrid } from "@/components/lunar/calendar-grid";

export default function CalendarPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-2">
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
          <CalendarGrid />
        </div>
      </div>

      {/* Information section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold mb-3">Về Âm Lịch</h3>
          <p className="text-sm text-muted-foreground">
            Âm lịch là lịch pháp truyền thống Việt Nam, dựa trên chu kỳ tròn khuyết của mặt trăng,
            kết hợp với quy luật vận hành của mặt trời, được sử dụng rộng rãi trong các lễ hội truyền thống,
            hoạt động thờ cúng và những dịp quan trọng khác.
          </p>
        </div>
        
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold mb-3">Ngày Quan Trọng</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Mồng 1 (Sóc) - Trăng mới, mặt trăng không thể nhìn thấy</li>
            <li>• Rằm (Vọng) - Trăng tròn, mặt trăng tròn nhất</li>
            <li>• Lễ hội truyền thống thường tính theo âm lịch</li>
          </ul>
        </div>
        
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold mb-3">Hướng Dẫn Sử Dụng</h3>
          <p className="text-sm text-muted-foreground">
            Nhấp vào "Hôm nay" để quay lại tháng hiện tại, sử dụng mũi tên trái phải để chuyển tháng.
            Các ngày quan trọng sẽ được đánh dấu đặc biệt, thuận tiện cho việc lên kế hoạch các hoạt động quan trọng.
          </p>
        </div>
      </div>
    </div>
  );
}