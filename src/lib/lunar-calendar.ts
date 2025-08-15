/**
 * Vietnamese Lunar Calendar Utilities (Âm Lịch)
 * 
 * Comprehensive Vietnamese lunar calendar calculations and conversions
 * using the Vietnamese lunar calendar system with proper cultural terminology
 */

import { Lunar, Solar } from 'lunar-javascript';
import { getLunar } from 'chinese-lunar-calendar';

export interface VietnameseLunarDate {
  year: number;
  month: number;
  day: number;
  monthName: string; // Vietnamese month names (Tháng Giêng, Tháng Hai, etc.)
  dayName: string; // Vietnamese day names (Mồng 1, Mồng 2, Rằm, etc.)
  isLeapMonth: boolean;
  lunarPhase: string; // Vietnamese lunar phase descriptions
  zodiacYear: string; // Vietnamese Can Chi year
  zodiacMonth: string; // Vietnamese Can Chi month
  zodiacDay: string; // Vietnamese Can Chi day
  vietnameseAnimal: string; // Vietnamese zodiac animal name
  culturalSignificance?: string; // Cultural significance of the date
}

// Legacy interface for backwards compatibility
export interface LunarDate extends VietnameseLunarDate {}

export interface VietnameseLunarEvent {
  id: string;
  title: string;
  description?: string;
  lunarDate: VietnameseLunarDate;
  gregorianDate: Date;
  isRecurring: boolean;
  reminderDays: number;
  eventType: 'personal' | 'cultural' | 'ancestor_worship' | 'holiday';
  culturalSignificance?: string;
  isAncestorWorship?: boolean;
  ancestorName?: string;
}

// Legacy interface for backwards compatibility
export interface LunarCalendarEvent extends VietnameseLunarEvent {}

export interface VietnameseCalendarDay {
  gregorianDate: Date;
  lunarDate: VietnameseLunarDate;
  isToday: boolean;
  isCurrentMonth: boolean;
  isImportant: boolean; // Mồng 1 (1st) or Rằm (15th) lunar day
  events: VietnameseLunarEvent[];
  vietnameseHoliday?: string; // Vietnamese traditional holiday name
}

// Legacy interface for backwards compatibility
export interface CalendarDay extends VietnameseCalendarDay {}

export interface VietnameseCalendarMonth {
  year: number;
  month: number;
  days: VietnameseCalendarDay[];
  lunarMonthInfo: {
    startDate: Date;
    endDate: Date;
    lunarMonth: number;
    lunarYear: number;
    vietnameseMonthName: string; // Vietnamese lunar month name
    zodiacInfo: string; // Vietnamese zodiac information
  };
}

// Legacy interface for backwards compatibility
export interface CalendarMonth extends VietnameseCalendarMonth {}

/**
 * Helper function to get Vietnamese lunar month name
 */
function getVietnameseMonthName(month: number): string {
  const monthNames = [
    '', 
    'Tháng Giêng', 'Tháng Hai', 'Tháng Ba', 'Tháng Tư', 'Tháng Năm', 'Tháng Sáu',
    'Tháng Bảy', 'Tháng Tám', 'Tháng Chín', 'Tháng Mười', 'Tháng Mười Một', 'Tháng Chạp'
  ];
  return monthNames[month] || 'Tháng không xác định';
}

/**
 * Helper function to get Vietnamese lunar day name
 */
function getVietnameseDayName(day: number): string {
  const dayNames = [
    '', 
    'Mồng 1', 'Mồng 2', 'Mồng 3', 'Mồng 4', 'Mồng 5', 'Mồng 6', 'Mồng 7', 'Mồng 8', 'Mồng 9', 'Mồng 10',
    'Ngày 11', 'Ngày 12', 'Ngày 13', 'Ngày 14', 'Rằm', 'Ngày 16', 'Ngày 17', 'Ngày 18', 'Ngày 19', 'Ngày 20',
    'Ngày 21', 'Ngày 22', 'Ngày 23', 'Ngày 24', 'Ngày 25', 'Ngày 26', 'Ngày 27', 'Ngày 28', 'Ngày 29', 'Ngày 30'
  ];
  return dayNames[day] || 'Ngày không xác định';
}

/**
 * Get Vietnamese zodiac animal for a given year
 */
export function getVietnameseZodiacAnimal(year: number): string {
  const animals = [
    'Tí (Chuột)', 'Sửu (Trâu)', 'Dần (Hổ)', 'Mão (Mèo)', 'Thìn (Rồng)', 'Tỵ (Rắn)',
    'Ngọ (Ngựa)', 'Mùi (Dê)', 'Thân (Khỉ)', 'Dậu (Gà)', 'Tuất (Chó)', 'Hợi (Lợn)'
  ];
  
  // Vietnamese zodiac starts from year 4 (1924 was Year of the Rat)
  const animal = animals[(year - 4) % 12];
  return animal ?? 'Không xác định';
}

/**
 * Helper function to get Vietnamese Can Chi combination
 */
function getVietnameseCanChi(ganZhi: string): string {
  // First try complete Can Chi mappings
  const canChiMap: { [key: string]: string } = {
    // Complete 60-year cycle of Can Chi combinations in Vietnamese
    '甲子': 'Giáp Tý', '乙丑': 'Ất Sửu', '丙寅': 'Bính Dần', '丁卯': 'Đinh Mão',
    '戊辰': 'Mậu Thìn', '己巳': 'Kỷ Tỵ', '庚午': 'Canh Ngọ', '辛未': 'Tân Mùi',
    '壬申': 'Nhâm Thân', '癸酉': 'Quý Dậu', '甲戌': 'Giáp Tuất', '乙亥': 'Ất Hợi',
    '丙子': 'Bính Tý', '丁丑': 'Đinh Sửu', '戊寅': 'Mậu Dần', '己卯': 'Kỷ Mão',
    '庚辰': 'Canh Thìn', '辛巳': 'Tân Tỵ', '壬午': 'Nhâm Ngọ', '癸未': 'Quý Mùi',
    '甲申': 'Giáp Thân', '乙酉': 'Ất Dậu', '丙戌': 'Bính Tuất', '丁亥': 'Đinh Hợi',
    '戊子': 'Mậu Tý', '己丑': 'Kỷ Sửu', '庚寅': 'Canh Dần', '辛卯': 'Tân Mão',
    '壬辰': 'Nhâm Thìn', '癸巳': 'Quý Tỵ', '甲午': 'Giáp Ngọ', '乙未': 'Ất Mùi',
    '丙申': 'Bính Thân', '丁酉': 'Đinh Dậu', '戊戌': 'Mậu Tuất', '己亥': 'Kỷ Hợi',
    '庚子': 'Canh Tý', '辛丑': 'Tân Sửu', '壬寅': 'Nhâm Dần', '癸卯': 'Quý Mão',
    '甲辰': 'Giáp Thìn', '乙巳': 'Ất Tỵ', '丙午': 'Bính Ngọ', '丁未': 'Đinh Mùi',
    '戊申': 'Mậu Thân', '己酉': 'Kỷ Dậu', '庚戌': 'Canh Tuất', '辛亥': 'Tân Hợi',
    '壬子': 'Nhâm Tý', '癸丑': 'Quý Sửu', '甲寅': 'Giáp Dần', '乙卯': 'Ất Mão',
    '丙辰': 'Bính Thìn', '丁巳': 'Đinh Tỵ', '戊午': 'Mậu Ngọ', '己未': 'Kỷ Mùi',
    '庚申': 'Canh Thân', '辛酉': 'Tân Dậu', '壬戌': 'Nhâm Tuất', '癸亥': 'Quý Hợi'
  };
  
  // Return mapped combination if found
  if (canChiMap[ganZhi]) {
    return canChiMap[ganZhi];
  }
  
  // If not found, try individual character mapping
  const canMap: { [key: string]: string } = {
    '甲': 'Giáp', '乙': 'Ất', '丙': 'Bính', '丁': 'Đinh', '戊': 'Mậu', 
    '己': 'Kỷ', '庚': 'Canh', '辛': 'Tân', '壬': 'Nhâm', '癸': 'Quý'
  };
  
  const chiMap: { [key: string]: string } = {
    '子': 'Tý', '丑': 'Sửu', '寅': 'Dần', '卯': 'Mão', '辰': 'Thìn', '巳': 'Tỵ',
    '午': 'Ngọ', '未': 'Mùi', '申': 'Thân', '酉': 'Dậu', '戌': 'Tuất', '亥': 'Hợi'
  };
  
  // Try to translate character by character
  let result = '';
  for (const char of ganZhi) {
    if (canMap[char]) {
      result += canMap[char] + ' ';
    } else if (chiMap[char]) {
      result += chiMap[char] + ' ';
    } else {
      result += char;
    }
  }
  
  return result.trim() || ganZhi;
}

/**
 * Get cultural significance for specific Vietnamese lunar dates
 */
function getCulturalSignificance(month: number, day: number): string | undefined {
  if (day === 1) {
    return 'Ngày Mồng 1 - Ngày đầu tháng âm lịch, thích hợp cho việc cúng lễ và khởi đầu việc mới';
  }
  if (day === 15) {
    return 'Ngày Rằm - Ngày trăng tròn, thích hợp cho việc cúng tổ tiên và cầu nguyện';
  }
  if (month === 1 && day === 1) {
    return 'Tết Nguyên Đán - Tết cổ truyền của người Việt Nam';
  }
  if (month === 8 && day === 15) {
    return 'Tết Trung Thu - Lễ hội đoàn viên và trăng rằm tháng 8';
  }
  return undefined;
}

/**
 * Convert Gregorian date to Vietnamese Lunar date
 */
export function gregorianToLunar(date: Date): VietnameseLunarDate {
  // Use chinese-lunar-calendar for basic lunar date info (Vietnamese lunar calendar follows the same system)
  const lunarInfo = getLunar(date.getFullYear(), date.getMonth() + 1, date.getDate());
  
  // Use lunar-javascript for additional info like GanZhi (Can Chi in Vietnamese)
  const solar = Solar.fromDate(date);
  const lunarJs = solar.getLunar();
  
  // Extract lunar year - Vietnamese lunar year follows the same calculation
  const lunarYear = lunarJs.getYear();
  const vietnameseAnimal = getVietnameseZodiacAnimal(lunarYear);
  const culturalSignificance = getCulturalSignificance(lunarInfo.lunarMonth, lunarInfo.lunarDate);
  
  return {
    year: lunarYear,
    month: lunarInfo.lunarMonth,
    day: lunarInfo.lunarDate,
    monthName: getVietnameseMonthName(lunarInfo.lunarMonth),
    dayName: getVietnameseDayName(lunarInfo.lunarDate),
    isLeapMonth: lunarInfo.isLeap,
    lunarPhase: getVietnameseLunarPhase(lunarInfo.lunarDate),
    zodiacYear: getVietnameseCanChi(lunarJs.getYearInGanZhi()),
    zodiacMonth: getVietnameseCanChi(lunarJs.getMonthInGanZhi()),
    zodiacDay: getVietnameseCanChi(lunarJs.getDayInGanZhi()),
    vietnameseAnimal,
    culturalSignificance,
  };
}

/**
 * Convert Vietnamese Lunar date to Gregorian date
 */
export function lunarToGregorian(lunarYear: number, lunarMonth: number, lunarDay: number, isLeapMonth = false): Date {
  let lunar;
  if (isLeapMonth) {
    // For leap months, we need to handle them specially
    lunar = Lunar.fromYmdHms(lunarYear, -lunarMonth, lunarDay, 0, 0, 0); // Negative month indicates leap month
  } else {
    lunar = Lunar.fromYmd(lunarYear, lunarMonth, lunarDay);
  }
  const solar = lunar.getSolar();
  return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay());
}

/**
 * Get current Vietnamese lunar date
 */
export function getCurrentLunarDate(): VietnameseLunarDate {
  return gregorianToLunar(new Date());
}

/**
 * Get current Vietnamese lunar date with Vietnam timezone
 */
export function getCurrentVietnameseLunarDate(): VietnameseLunarDate {
  // Get current time in Vietnam timezone (UTC+7)
  const now = new Date();
  const vietnamTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}));
  return gregorianToLunar(vietnamTime);
}

/**
 * Get Vietnamese lunar phase description based on day
 */
export function getVietnameseLunarPhase(lunarDay: number): string {
  if (lunarDay === 1) return "Trăng non (Mồng 1)";
  if (lunarDay >= 2 && lunarDay <= 7) return "Trăng lưỡi liềm (Trăng tăng)";
  if (lunarDay >= 8 && lunarDay <= 14) return "Trăng mập dần (Trăng tăng giá)";
  if (lunarDay === 15) return "Trăng tròn (Rằm)";
  if (lunarDay >= 16 && lunarDay <= 22) return "Trăng khuyết (Trăng giảm)";
  if (lunarDay >= 23 && lunarDay <= 29) return "Trăng tàn (Trăng giảm dần)";
  if (lunarDay === 30) return "Trăng mới (Hạc)";
  return "Pha trăng không xác định";
}

// Legacy function for backwards compatibility
export function getLunarPhase(lunarDay: number): string {
  return getVietnameseLunarPhase(lunarDay);
}

/**
 * Check if a lunar date is important (1st or 15th)
 */
export function isImportantLunarDate(lunarDay: number): boolean {
  return lunarDay === 1 || lunarDay === 15;
}

/**
 * Get next important Vietnamese lunar dates (Mồng 1 and Rằm)
 */
export function getNextImportantVietnameseLunarDate(): { 
  mong1: Date; 
  ram: Date;
  mong1Info: VietnameseLunarDate;
  ramInfo: VietnameseLunarDate;
} {
  // Use Vietnam timezone for calculations
  const today = new Date();
  const vietnamTime = new Date(today.toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}));
  const currentLunar = gregorianToLunar(vietnamTime);
  
  let nextMong1: Date;
  let nextRam: Date;
  
  if (currentLunar.day < 15) {
    // Next Rằm is in current month, next Mồng 1 is in next month
    nextRam = lunarToGregorian(currentLunar.year, currentLunar.month, 15, currentLunar.isLeapMonth);
    
    const nextMonth = currentLunar.month === 12 ? 1 : currentLunar.month + 1;
    const nextYear = currentLunar.month === 12 ? currentLunar.year + 1 : currentLunar.year;
    nextMong1 = lunarToGregorian(nextYear, nextMonth, 1);
  } else {
    // Next Mồng 1 is in next month, next Rằm is in month after that
    const nextMonth = currentLunar.month === 12 ? 1 : currentLunar.month + 1;
    const nextYear = currentLunar.month === 12 ? currentLunar.year + 1 : currentLunar.year;
    nextMong1 = lunarToGregorian(nextYear, nextMonth, 1);
    
    const ramMonth = nextMonth === 12 ? 1 : nextMonth + 1;
    const ramYear = nextMonth === 12 ? nextYear + 1 : nextYear;
    nextRam = lunarToGregorian(ramYear, ramMonth, 15);
  }
  
  return { 
    mong1: nextMong1, 
    ram: nextRam,
    mong1Info: gregorianToLunar(nextMong1),
    ramInfo: gregorianToLunar(nextRam)
  };
}

// Legacy function for backwards compatibility
export function getNextImportantLunarDate(): { first: Date; fifteenth: Date } {
  const dates = getNextImportantVietnameseLunarDate();
  return { first: dates.mong1, fifteenth: dates.ram };
}

/**
 * Get Vietnamese traditional holiday for a specific date
 */
function getVietnameseHoliday(lunarMonth: number, lunarDay: number, gregorianDate: Date): string | undefined {
  // Vietnamese lunar holidays
  if (lunarMonth === 1 && lunarDay === 1) {
    return 'Tết Nguyên Đán';
  }
  if (lunarMonth === 1 && lunarDay === 15) {
    return 'Tết Nguyên Tiêu';
  }
  if (lunarMonth === 3 && lunarDay === 3) {
    return 'Tết Hàn Thực';
  }
  if (lunarMonth === 5 && lunarDay === 5) {
    return 'Tết Đoan Ngọ';
  }
  if (lunarMonth === 7 && lunarDay === 15) {
    return 'Vu Lan (Xa tội vong nhơn)';
  }
  if (lunarMonth === 8 && lunarDay === 15) {
    return 'Tết Trung Thu';
  }
  if (lunarMonth === 9 && lunarDay === 9) {
    return 'Tết Trọng Dương';
  }
  if (lunarMonth === 12 && lunarDay === 23) {
    return 'Ông Công Ông Táo về trời';
  }
  
  // Vietnamese Gregorian holidays
  const month = gregorianDate.getMonth() + 1;
  const day = gregorianDate.getDate();
  
  if (month === 1 && day === 1) {
    return 'Tết Dương lịch';
  }
  if (month === 4 && day === 30) {
    return 'Giải phóng miền Nam';
  }
  if (month === 9 && day === 2) {
    return 'Quốc khánh Việt Nam';
  }
  
  return undefined;
}

/**
 * Generate Vietnamese calendar month with both Gregorian and Lunar information
 */
export function generateVietnameseCalendarMonth(year: number, month: number, events: VietnameseLunarEvent[] = []): VietnameseCalendarMonth {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const today = new Date();
  
  // Start from the beginning of the week (Sunday)
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  
  // End at the end of the week (Saturday)
  const endDate = new Date(lastDay);
  endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
  
  const days: VietnameseCalendarDay[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const lunarDate = gregorianToLunar(currentDate);
    const dayEvents = events.filter(event => 
      event.gregorianDate.toDateString() === currentDate.toDateString()
    );
    
    // Check for Vietnamese traditional holidays
    const vietnameseHoliday = getVietnameseHoliday(lunarDate.month, lunarDate.day, currentDate);
    
    days.push({
      gregorianDate: new Date(currentDate),
      lunarDate,
      isToday: currentDate.toDateString() === today.toDateString(),
      isCurrentMonth: currentDate.getMonth() === month,
      isImportant: lunarDate.day === 1 || lunarDate.day === 15,
      events: dayEvents,
      vietnameseHoliday,
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Get Vietnamese lunar month info for the Gregorian month
  const midMonth = new Date(year, month, 15);
  const midMonthLunar = gregorianToLunar(midMonth);
  
  return {
    year,
    month,
    days,
    lunarMonthInfo: {
      startDate: firstDay,
      endDate: lastDay,
      lunarMonth: midMonthLunar.month,
      lunarYear: midMonthLunar.year,
      vietnameseMonthName: midMonthLunar.monthName,
      zodiacInfo: midMonthLunar.vietnameseAnimal,
    },
  };
}

// Legacy function for backwards compatibility
export function generateCalendarMonth(year: number, month: number, events: LunarCalendarEvent[] = []): CalendarMonth {
  return generateVietnameseCalendarMonth(year, month, events);
}

/**
 * Calculate days until a specific date (using Vietnam timezone)
 */
export function daysUntilVietnam(targetDate: Date): number {
  const now = new Date();
  const today = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}));
  today.setHours(0, 0, 0, 0);
  
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Legacy function for backwards compatibility
export function daysUntil(targetDate: Date): number {
  return daysUntilVietnam(targetDate);
}

/**
 * Format Vietnamese lunar date for display
 */
export function formatVietnameseLunarDate(lunarDate: VietnameseLunarDate, includeZodiac = false): string {
  const monthPrefix = lunarDate.isLeapMonth ? "Năm nhuận " : "";
  let formatted = `${lunarDate.dayName} ${monthPrefix}${lunarDate.monthName} năm ${lunarDate.year}`;
  
  if (includeZodiac) {
    formatted += ` (${lunarDate.zodiacYear})`;
  }
  
  return formatted;
}

// Legacy function for backwards compatibility
export function formatLunarDate(lunarDate: LunarDate, includeZodiac = false): string {
  return formatVietnameseLunarDate(lunarDate, includeZodiac);
}

/**
 * Get Vietnamese lunar calendar events for a specific date range
 */
export function getVietnameseEventsInRange(
  events: VietnameseLunarEvent[],
  startDate: Date,
  endDate: Date
): VietnameseLunarEvent[] {
  return events.filter(event => {
    const eventDate = event.gregorianDate;
    return eventDate >= startDate && eventDate <= endDate;
  });
}

// Legacy function for backwards compatibility
export function getEventsInRange(
  events: LunarCalendarEvent[],
  startDate: Date,
  endDate: Date
): LunarCalendarEvent[] {
  return getVietnameseEventsInRange(events, startDate, endDate);
}

/**
 * Get upcoming Vietnamese events within specified days
 */
export function getUpcomingVietnameseEvents(
  events: VietnameseLunarEvent[],
  days: number = 7
): VietnameseLunarEvent[] {
  const now = new Date();
  const today = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}));
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + days);
  
  return getVietnameseEventsInRange(events, today, futureDate)
    .sort((a, b) => a.gregorianDate.getTime() - b.gregorianDate.getTime());
}

// Legacy function for backwards compatibility
export function getUpcomingEvents(
  events: LunarCalendarEvent[],
  days: number = 7
): LunarCalendarEvent[] {
  return getUpcomingVietnameseEvents(events, days);
}

/**
 * Check if two Vietnamese lunar dates are the same
 */
export function isSameVietnameseLunarDate(date1: VietnameseLunarDate, date2: VietnameseLunarDate): boolean {
  return (
    date1.year === date2.year &&
    date1.month === date2.month &&
    date1.day === date2.day &&
    date1.isLeapMonth === date2.isLeapMonth
  );
}

// Legacy function for backwards compatibility
export function isSameLunarDate(date1: LunarDate, date2: LunarDate): boolean {
  return isSameVietnameseLunarDate(date1, date2);
}

/**
 * Calculate recurring Vietnamese event dates for a year
 */
export function calculateRecurringVietnameseEventDates(
  baseEvent: VietnameseLunarEvent,
  year: number
): Date[] {
  if (!baseEvent.isRecurring) {
    return [baseEvent.gregorianDate];
  }
  
  const dates: Date[] = [];
  const baseLunar = baseEvent.lunarDate;
  
  try {
    const gregorianDate = lunarToGregorian(
      year,
      baseLunar.month,
      baseLunar.day,
      baseLunar.isLeapMonth
    );
    dates.push(gregorianDate);
  } catch (error) {
    // Handle cases where the lunar date doesn't exist in the target year
    console.warn(`Could not calculate recurring event for year ${year}:`, error);
  }
  
  return dates;
}

// Legacy function for backwards compatibility
export function calculateRecurringEventDates(
  baseEvent: LunarCalendarEvent,
  year: number
): Date[] {
  return calculateRecurringVietnameseEventDates(baseEvent, year);
}


/**
 * Get complete Vietnamese Can Chi for a given year
 */
export function getVietnameseCanChiYear(year: number): string {
  const can = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
  const chi = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  
  // Vietnamese Can Chi cycle starts from year 4 (1924 was Giáp Tý)
  const canIndex = (year - 4) % 10;
  const chiIndex = (year - 4) % 12;
  
  return `${can[canIndex]} ${chi[chiIndex]}`;
}

// Legacy function for backwards compatibility
export function getZodiacAnimal(year: number): string {
  return getVietnameseZodiacAnimal(year);
}

/**
 * Validate Vietnamese lunar date
 */
export function isValidVietnameseLunarDate(year: number, month: number, day: number, isLeapMonth = false): boolean {
  try {
    let lunar;
    if (isLeapMonth) {
      lunar = Lunar.fromYmdHms(year, -month, day, 0, 0, 0); // Negative month indicates leap month
    } else {
      lunar = Lunar.fromYmd(year, month, day);
    }
    lunar.getSolar(); // This will throw if invalid
    return true;
  } catch {
    return false;
  }
}

// Legacy function for backwards compatibility
export function isValidLunarDate(year: number, month: number, day: number, isLeapMonth = false): boolean {
  return isValidVietnameseLunarDate(year, month, day, isLeapMonth);
}

/**
 * Get Vietnamese lunar month length
 */
export function getVietnameseLunarMonthLength(year: number, month: number, isLeapMonth = false): number {
  try {
    let lunar;
    if (isLeapMonth) {
      lunar = Lunar.fromYmdHms(year, -month, 1, 0, 0, 0); // Negative month indicates leap month
    } else {
      lunar = Lunar.fromYmd(year, month, 1);
    }
    const dayCount = lunar.getDayCount();
    return dayCount || 30; // Ensure we return a number
  } catch {
    return 30; // Default fallback
  }
}

// Legacy function for backwards compatibility
export function getLunarMonthLength(year: number, month: number, isLeapMonth = false): number {
  return getVietnameseLunarMonthLength(year, month, isLeapMonth);
}

/**
 * Get Vietnamese lunar calendar information for today
 */
export function getTodayVietnameseLunarInfo(): {
  lunarDate: VietnameseLunarDate;
  formattedDate: string;
  nextImportantDates: ReturnType<typeof getNextImportantVietnameseLunarDate>;
  daysToMong1: number;
  daysToRam: number;
} {
  const lunarDate = getCurrentVietnameseLunarDate();
  const formattedDate = formatVietnameseLunarDate(lunarDate, true);
  const nextImportantDates = getNextImportantVietnameseLunarDate();
  
  return {
    lunarDate,
    formattedDate,
    nextImportantDates,
    daysToMong1: daysUntilVietnam(nextImportantDates.mong1),
    daysToRam: daysUntilVietnam(nextImportantDates.ram),
  };
}

/**
 * Get Vietnamese cultural significance text for display
 */
export function getVietnameseCulturalSignificanceText(lunarDay: number): string {
  if (lunarDay === 1) {
    return 'Ngày Mồng 1 - Ngày đầu tháng âm lịch, thích hợp cho việc cúng lễ và khởi đầu việc mới. Đây là ngày tốt để cầu may mắn và thành công.';
  }
  if (lunarDay === 15) {
    return 'Ngày Rằm - Ngày trăng tròn, thích hợp cho việc cúng tổ tiên và cầu nguyện. Đây là ngày thiêng liêng trong tâm linh người Việt.';
  }
  if (lunarDay >= 2 && lunarDay <= 5) {
    return 'Đầu tháng âm lịch - Thời gian tốt để bắt đầu công việc mới và thực hiện các kế hoạch quan trọng.';
  }
  if (lunarDay >= 14 && lunarDay <= 16) {
    return 'Giữa tháng âm lịch - Thời gian thiêng liêng, thích hợp cho việc cúng bái và tâm linh.';
  }
  return 'Ngày bình thường trong tháng âm lịch.';
}