import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  Moon,
  ScrollText,
  Smartphone,
  CheckCircle2,
  Clock,
  Star,
} from "lucide-react";

export default function FeaturesPage() {
  return (
    <div className="container mx-auto max-w-5xl space-y-16 py-12 md:py-20">
      {/* Header Section */}
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
          Tính năng nổi bật
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl">
          Khám phá các công cụ hỗ trợ xem lịch âm, quản lý sự kiện truyền thống
          và tối ưu hóa trải nghiệm tâm linh của bạn.
        </p>
      </div>

      {/* Feature 1: Xem Lịch Âm */}
      <section className="grid items-center gap-8 md:grid-cols-2">
        <div className="order-2 space-y-4 md:order-1">
          <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg">
            <CalendarIcon className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold">Xem Lịch Âm</h2>
          <p className="text-muted-foreground">
            Xem lịch âm theo tháng với giao diện trực quan. Chuyển đổi dễ dàng
            giữa ngày dương lịch và âm lịch, hiển thị các ngày lễ quan trọng và
            thông tin thiên văn chi tiết.
          </p>
          <ul className="space-y-2">
            {[
              "Tra cứu ngày âm/dương nhanh chóng",
              "Hiển thị ngày lễ tết, rằm, mùng 1",
              "Thông tin tiết khí, giờ hoàng đạo",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle2 className="text-primary h-5 w-5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="order-1 md:order-2">
          <Card className="border-primary/20 overflow-hidden border-1 py-0 shadow-xl">
            <CardHeader className="bg-muted/50 border-b py-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Tháng 3, 2025</div>
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-red-400" />
                  <div className="h-2 w-2 rounded-full bg-yellow-400" />
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-muted-foreground grid grid-cols-7 border-b text-center text-xs font-medium uppercase">
                {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
                  <div key={d} className="border-r py-2 last:border-0">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {Array.from({ length: 14 }).map((_, i) => {
                  const day = i + 1;
                  const lunarDay = ((day + 5) % 30) + 1;
                  const isSpecial = lunarDay === 1 || lunarDay === 15;
                  return (
                    <div
                      key={i}
                      className={`relative flex h-16 flex-col items-center justify-center border-r border-b p-1 last:border-r-0 ${
                        day === 10 ? "bg-primary/5" : ""
                      }`}
                    >
                      <span className="text-sm font-medium">{day}</span>
                      <span
                        className={`text-[10px] ${
                          isSpecial
                            ? "font-bold text-red-500"
                            : "text-muted-foreground"
                        }`}
                      >
                        {lunarDay === 1 ? `1/${(day % 12) + 1}` : lunarDay}
                      </span>
                      {day === 10 && (
                        <div className="bg-primary absolute bottom-1 h-1 w-1 rounded-full" />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="bg-white">
                    Ngày 10/3
                  </Badge>
                  <span className="font-medium text-red-600">
                    Giỗ Tổ Hùng Vương
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Feature 2: Quản Lý Sự Kiện */}
      <section className="grid items-center gap-8 md:grid-cols-2">
        <div className="order-1">
          <Card className="border-primary/10 border-1 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Sự kiện sắp tới</CardTitle>
                <Badge>3 sự kiện</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border bg-white p-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <Star className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">Giỗ ông nội</p>
                    <Badge variant="secondary" className="text-[10px]">
                      Hàng năm
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Ngày 10 tháng 3 (Âm lịch)
                  </p>
                  <div className="flex items-center gap-1 text-[10px] font-medium text-orange-600">
                    <Clock className="h-3 w-3" />
                    <span>Còn 5 ngày nữa</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border bg-white p-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Moon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">Rằm tháng Giêng</p>
                    <Badge variant="outline" className="text-[10px]">
                      Lễ tiết
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Ngày 15 tháng 1 (Âm lịch)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="order-2 space-y-4">
          <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg">
            <Star className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold">Quản Lý Sự Kiện Âm Lịch</h2>
          <p className="text-muted-foreground">
            Tạo và quản lý các sự kiện theo âm lịch như ngày giỗ tổ tiên, sinh
            nhật, lễ hội. Hệ thống tự động chuyển đổi sang dương lịch và gửi
            thông báo nhắc nhở kịp thời.
          </p>
          <ul className="space-y-2">
            {[
              "Tự động tính toán ngày dương hàng năm",
              "Cài đặt nhắc nhở trước 1, 3, hoặc 7 ngày",
              "Phân loại sự kiện gia đình và lễ tiết",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle2 className="text-primary h-5 w-5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Feature 3: Sớ Khấn */}
      <section className="grid items-center gap-8 md:grid-cols-2">
        <div className="order-2 space-y-4 md:order-1">
          <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg">
            <ScrollText className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold">Cấu Hình Sớ Khấn</h2>
          <p className="text-muted-foreground">
            Quản lý danh sách tín chủ trong gia đình và tùy chỉnh văn khấn
            truyền thống. Hỗ trợ tự động điền thông tin vào các mẫu văn khấn cho
            ngày mùng 1, rằm, và ngày giỗ.
          </p>
          <ul className="space-y-2">
            {[
              "Lưu trữ danh sách thành viên gia đình",
              "Tùy chỉnh nội dung văn khấn theo ý muốn",
              "Tự động điền họ tên, địa chỉ vào văn khấn",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle2 className="text-primary h-5 w-5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="order-1 space-y-4 md:order-2">
          <Card className="border-primary/10 bg-muted/50 border-1 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Danh sách tín chủ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between rounded-md border bg-white p-2 text-xs shadow-sm">
                <div className="flex flex-col">
                  <span className="font-semibold">Nguyễn Văn An</span>
                  <span className="text-muted-foreground">Năm sinh: 1985</span>
                </div>
                <Badge variant="secondary">Tín chủ chính</Badge>
              </div>
              <div className="flex items-center justify-between rounded-md border bg-white p-2 text-xs shadow-sm">
                <div className="flex flex-col">
                  <span className="font-semibold">Trần Thị Bình</span>
                  <span className="text-muted-foreground">Năm sinh: 1988</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary/10 border-1 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Mẫu văn khấn Mùng 1</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 text-muted-foreground line-clamp-4 rounded-md p-3 text-[10px] leading-relaxed italic">
                "Nam mô A Di Đà Phật! Con lạy chín phương Trời, mười phương Chư
                Phật... Tín chủ con là [Nguyễn Văn An], ngụ tại [Số 123, Đường
                ABC...], cùng toàn thể gia quyến thành tâm sắm lễ..."
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Feature 4: Mobile Friendly (Mockup) */}
      <section className="grid items-center gap-12 md:grid-cols-2">
        <div className="order-1 flex justify-center">
          {/* Mobile Mockup Frame */}
          <div className="relative h-[500px] w-[250px] rounded-[3rem] border-[8px] border-slate-900 bg-slate-900 shadow-2xl">
            {/* Speaker/Notch */}
            <div className="absolute top-0 left-1/2 z-20 h-6 w-24 -translate-x-1/2 rounded-b-xl bg-slate-900" />

            {/* Screen Content */}
            <div className="relative h-full w-full overflow-hidden rounded-[2.2rem] bg-white pt-8">
              <div className="bg-primary/5 flex items-center justify-between border-b px-4 py-2">
                <div className="bg-primary flex size-5 items-center justify-center rounded">
                  <Moon className="size-3 text-white" />
                </div>
                <div className="bg-muted h-4 w-20 animate-pulse rounded" />
                <div className="bg-muted size-5 animate-pulse rounded-full" />
              </div>
              <div className="space-y-4 p-3">
                <div className="bg-primary/10 flex h-24 w-full flex-col items-center justify-center gap-2 rounded-xl">
                  <div className="bg-primary/20 h-3 w-1/2 rounded" />
                  <div className="bg-primary/40 h-6 w-3/4 rounded" />
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-muted/30 aspect-square rounded-md"
                    />
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex h-12 w-full items-center gap-2 rounded-lg border bg-white px-3">
                    <div className="size-6 rounded-full bg-red-100" />
                    <div className="bg-muted h-3 w-1/2 rounded" />
                  </div>
                </div>
              </div>

              {/* Add to Home Screen Overlay Example */}
              <div className="absolute right-4 bottom-4 left-4 rounded-xl bg-slate-800/90 p-3 text-white shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
                    <Smartphone className="size-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold">
                      Thêm vào màn hình chính
                    </p>
                    <p className="text-[8px] text-slate-300">
                      Cài đặt như ứng dụng di động
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="order-2 space-y-4">
          <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg">
            <Smartphone className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold">Tối Ưu Cho Di Động</h2>
          <p className="text-muted-foreground">
            Giao diện được thiết kế hiện đại, phản hồi nhanh trên mọi thiết bị.
            Bạn có thể cài đặt ứng dụng trực tiếp từ trình duyệt lên màn hình
            chính điện thoại để truy cập nhanh chóng như một ứng dụng thực thụ.
          </p>
          <ul className="space-y-2">
            {[
              "Giao diện Mobile-first mượt mà",
              "Hỗ trợ cài đặt PWA (Web App)",
              "Dễ dàng xem lịch mọi lúc, mọi nơi",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle2 className="text-primary h-5 w-5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Footer Call to Action (Simple) */}
      <div className="bg-muted rounded-3xl px-8 py-12 text-center shadow-sm">
        <h2 className="mb-4 text-2xl font-bold">
          Trải nghiệm Lịch Âm ngay hôm nay
        </h2>
        <p className="text-muted-foreground mx-auto mb-8 max-w-xl">
          Hãy bắt đầu quản lý các sự kiện tâm linh và truyền thống của gia đình
          bạn một cách khoa học và tiện lợi nhất.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/signup"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-3 font-semibold transition-colors"
          >
            Đăng ký miễn phí
          </Link>
          <Link
            href="/"
            className="rounded-full border bg-white px-8 py-3 font-semibold transition-colors hover:bg-slate-50"
          >
            Xem lịch ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
