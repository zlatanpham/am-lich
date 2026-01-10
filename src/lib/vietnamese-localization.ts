/**
 * Vietnamese Localization Utilities
 *
 * Comprehensive Vietnamese localization support including
 * typography, formatting, timezone, and cultural constants
 */

/**
 * Vietnamese timezone configuration
 */
export const VIETNAM_TIMEZONE = "Asia/Ho_Chi_Minh";
export const VIETNAM_UTC_OFFSET = "+07:00";

/**
 * Vietnamese language constants
 */
export const VIETNAMESE_LOCALE = "vi-VN";

/**
 * Vietnamese date formatting options
 */
export const vietnameseDateFormats = {
  full: {
    weekday: "long" as const,
    year: "numeric" as const,
    month: "long" as const,
    day: "numeric" as const,
  },
  long: {
    year: "numeric" as const,
    month: "long" as const,
    day: "numeric" as const,
  },
  medium: {
    year: "numeric" as const,
    month: "short" as const,
    day: "numeric" as const,
  },
  short: {
    year: "2-digit" as const,
    month: "numeric" as const,
    day: "numeric" as const,
  },
};

/**
 * Vietnamese UI text constants
 */
export const vietnameseText = {
  // Navigation and General
  appName: "Âm Lịch Việt Nam",
  home: "Trang chủ",
  calendar: "Lịch",
  events: "Sự kiện",
  account: "Tài khoản",
  settings: "Cài đặt",
  logout: "Đăng xuất",
  login: "Đăng nhập",
  register: "Đăng ký",

  // Calendar Terms
  today: "Hôm nay",
  yesterday: "Hôm qua",
  tomorrow: "Ngày mai",
  thisWeek: "Tuần này",
  thisMonth: "Tháng này",
  thisYear: "Năm này",

  // Lunar Calendar Specific
  lunarCalendar: "Âm lịch",
  solarCalendar: "Dương lịch",
  lunarDate: "Ngày âm lịch",
  currentLunarDate: "Ngày âm lịch hôm nay",
  nextImportantDates: "Ngày quan trọng sắp tới",

  // Important Days
  mong1: "Mồng 1",
  ram: "Rằm",
  importantDay: "Ngày quan trọng",
  newMoon: "Trăng non",
  fullMoon: "Trăng tròn",

  // Events
  createEvent: "Tạo sự kiện",
  editEvent: "Sửa sự kiện",
  deleteEvent: "Xóa sự kiện",
  eventTitle: "Tiêu đề sự kiện",
  eventDescription: "Mô tả sự kiện",
  eventDate: "Ngày sự kiện",
  reminderDays: "Nhắc nhở trước",
  isRecurring: "Lặp lại hàng năm",

  // Event Types
  lunarEvent: "Sự kiện âm lịch",
  culturalEvent: "Sự kiện văn hóa",
  ancestorWorship: "Giỗ tổ tiên",
  traditionalHoliday: "Lễ hội truyền thống",

  // Ancestor Worship
  ancestorName: "Tên tổ tiên",
  anniversaryDate: "Ngày giỗ",
  worshipReminder: "Nhắc nhở cúng bái",

  // Cultural Elements
  culturalSignificance: "Ý nghĩa văn hóa",
  zodiacYear: "Năm can chi",
  lunarPhase: "Pha trăng",
  auspiciousDay: "Ngày tốt",
  inauspiciousDay: "Ngày xấu",

  // Time expressions
  daysUntil: "còn {0} ngày",
  daysPassed: "đã qua {0} ngày",
  inDays: "trong {0} ngày",

  // Loading and Error States
  loading: "Đang tải...",
  error: "Lỗi",
  noData: "Không có dữ liệu",
  tryAgain: "Thử lại",

  // Form Elements
  save: "Lưu",
  cancel: "Hủy",
  delete: "Xóa",
  edit: "Sửa",
  add: "Thêm",
  confirm: "Xác nhận",

  // Vietnamese Months (Gregorian)
  months: [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ],

  // Vietnamese Weekdays
  weekdays: [
    "Chủ nhật",
    "Thứ hai",
    "Thứ ba",
    "Thứ tư",
    "Thứ năm",
    "Thứ sáu",
    "Thứ bảy",
  ],

  // Short weekdays
  weekdaysShort: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
};

/**
 * Vietnamese cultural constants
 */
export const vietnameseCultural = {
  // Traditional Colors
  colors: {
    auspicious: "#dc2626", // Red for good luck
    gold: "#eab308", // Gold for prosperity
    traditional: "#7c2d12", // Traditional brown
    warning: "#ea580c", // Orange for caution
    calm: "#0369a1", // Blue for peace
  },

  // Lucky Numbers in Vietnamese Culture
  luckyNumbers: [1, 6, 8, 9],
  unluckyNumbers: [4, 7],

  // Traditional Vietnamese Elements (Ngũ hành)
  elements: {
    kim: "Kim (Kim loại)", // Metal
    moc: "Mộc (Gỗ)", // Wood
    thuy: "Thủy (Nước)", // Water
    hoa: "Hỏa (Lửa)", // Fire
    tho: "Thổ (Đất)", // Earth
  },

  // Vietnamese Zodiac Animals with detailed names
  zodiacAnimals: [
    {
      name: "Tý (Chuột)",
      element: "Thủy",
      characteristics: "Thông minh, lanh lợi",
    },
    {
      name: "Sửu (Trâu)",
      element: "Thổ",
      characteristics: "Chăm chỉ, kiên nhẫn",
    },
    {
      name: "Dần (Hổ)",
      element: "Mộc",
      characteristics: "Dũng mãnh, quyết đoán",
    },
    { name: "Mão (Mèo)", element: "Mộc", characteristics: "Khéo léo, tế nhị" },
    {
      name: "Thìn (Rồng)",
      element: "Thổ",
      characteristics: "Uy nghiêm, tài năng",
    },
    { name: "Tỵ (Rắn)", element: "Hỏa", characteristics: "Thông thái, bí ẩn" },
    { name: "Ngọ (Ngựa)", element: "Hỏa", characteristics: "Năng động, tự do" },
    {
      name: "Mùi (Dê)",
      element: "Thổ",
      characteristics: "Hiền lành, sáng tạo",
    },
    {
      name: "Thân (Khỉ)",
      element: "Kim",
      characteristics: "Lanh lẹ, hóm hỉnh",
    },
    { name: "Dậu (Gà)", element: "Kim", characteristics: "Cần cù, trung thực" },
    {
      name: "Tuất (Chó)",
      element: "Thổ",
      characteristics: "Trung thành, đáng tin",
    },
    {
      name: "Hợi (Lợn)",
      element: "Thủy",
      characteristics: "Thật thà, hào phóng",
    },
  ],
};

/**
 * Format date in Vietnamese style
 */
export function formatVietnameseDate(
  date: Date,
  format: keyof typeof vietnameseDateFormats = "long",
  includeTime = false,
): string {
  const dateOptions = vietnameseDateFormats[format];
  const timeOptions = includeTime
    ? { hour: "2-digit" as const, minute: "2-digit" as const }
    : {};

  return new Intl.DateTimeFormat(VIETNAMESE_LOCALE, {
    ...dateOptions,
    ...timeOptions,
    timeZone: VIETNAM_TIMEZONE,
  }).format(date);
}

/**
 * Format time in Vietnamese style
 */
export function formatVietnameseTime(date: Date): string {
  return new Intl.DateTimeFormat(VIETNAMESE_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: VIETNAM_TIMEZONE,
  }).format(date);
}

/**
 * Get current time in Vietnam timezone
 */
export function getVietnamTime(): Date {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: VIETNAM_TIMEZONE }));
}

/**
 * Convert any date to Vietnam timezone
 */
export function toVietnamTime(date: Date): Date {
  return new Date(date.toLocaleString("en-US", { timeZone: VIETNAM_TIMEZONE }));
}

/**
 * Check if a date is in Vietnam timezone
 */
export function isVietnamTimezone(date: Date): boolean {
  const vietnamOffset = -420; // UTC+7 in minutes
  return date.getTimezoneOffset() === vietnamOffset;
}

/**
 * Vietnamese number formatting
 */
export function formatVietnameseNumber(num: number): string {
  return new Intl.NumberFormat(VIETNAMESE_LOCALE).format(num);
}

/**
 * Vietnamese currency formatting (VND)
 */
export function formatVietnameseCurrency(amount: number): string {
  return new Intl.NumberFormat(VIETNAMESE_LOCALE, {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

/**
 * Get Vietnamese weekday name
 */
export function getVietnameseWeekday(date: Date, short = false): string {
  const dayIndex = date.getDay();
  return short
    ? (vietnameseText.weekdaysShort[dayIndex] ?? "CN")
    : (vietnameseText.weekdays[dayIndex] ?? "Chủ nhật");
}

/**
 * Get Vietnamese month name
 */
export function getVietnameseMonth(monthIndex: number): string {
  return vietnameseText.months[monthIndex] ?? "Tháng không xác định";
}

/**
 * Vietnamese text interpolation helper
 */
export function interpolateVietnameseText(
  template: string,
  ...values: (string | number)[]
): string {
  return template.replace(/\{(\d+)\}/g, (match, index: string) => {
    const value = values[parseInt(index, 10)];
    return value !== undefined ? String(value) : match;
  });
}

/**
 * Vietnamese pluralization helper (Vietnamese doesn't have complex pluralization)
 */
export function vietnamesePlural(
  count: number,
  singular: string,
  plural?: string,
): string {
  // Vietnamese typically uses the same form for singular and plural
  // Sometimes adds "các" or "những" for plural, but this is context-dependent
  return count === 1 ? singular : (plural ?? singular);
}

/**
 * Vietnamese cultural day assessment
 */
export function getVietnameseDayAssessment(lunarDay: number): {
  type: "auspicious" | "neutral" | "inauspicious";
  title: string;
  description: string;
} {
  if (lunarDay === 1) {
    return {
      type: "auspicious",
      title: "Ngày Mồng 1 - Rất tốt",
      description:
        "Ngày đầu tháng âm lịch, rất thích hợp cho mọi việc quan trọng.",
    };
  }

  if (lunarDay === 15) {
    return {
      type: "auspicious",
      title: "Ngày Rằm - Rất tốt",
      description:
        "Ngày trăng tròn, rất thích hợp cho việc cúng bái và tâm linh.",
    };
  }

  if ([3, 5, 13, 23].includes(lunarDay)) {
    return {
      type: "inauspicious",
      title: "Ngày nên tránh",
      description:
        "Ngày không tốt theo quan niệm dân gian, nên tránh các việc quan trọng.",
    };
  }

  if (lunarDay >= 2 && lunarDay <= 7) {
    return {
      type: "auspicious",
      title: "Ngày tốt",
      description: "Đầu tháng âm lịch, thích hợp cho việc khởi sự.",
    };
  }

  return {
    type: "neutral",
    title: "Ngày bình thường",
    description: "Ngày thường trong tháng âm lịch.",
  };
}

/**
 * Vietnamese honorific titles for ancestors
 */
export const vietnameseHonorifics = {
  grandfather: ["Ông cố", "Ông tổ", "Ông nội", "Ông ngoại"],
  grandmother: ["Bà cố", "Bà tổ", "Bà nội", "Bà ngoại"],
  father: ["Thân phụ", "Cha", "Ba"],
  mother: ["Thân mẫu", "Mẹ", "Má"],
  ancestor: ["Tổ tiên", "Tiên tổ", "Ông bà tổ tiên"],
};

/**
 * Vietnamese cultural event categories
 */
export const vietnameseEventCategories = {
  worship: {
    name: "Cúng bái",
    description: "Các nghi lễ thờ cúng tổ tiên và thần linh",
    icon: "🙏",
  },
  festival: {
    name: "Lễ hội",
    description: "Các lễ hội truyền thống của người Việt",
    icon: "🎊",
  },
  ceremony: {
    name: "Nghi lễ",
    description: "Các nghi lễ quan trọng trong đời sống",
    icon: "🎭",
  },
  memorial: {
    name: "Giỗ chạp",
    description: "Ngày giỗ và các dịp tưởng nhớ",
    icon: "🕯️",
  },
  seasonal: {
    name: "Theo mùa",
    description: "Các hoạt động theo mùa và thời tiết",
    icon: "🌸",
  },
};
