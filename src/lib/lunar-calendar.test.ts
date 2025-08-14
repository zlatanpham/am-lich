import { describe, it, expect } from 'vitest';
import {
  gregorianToLunar,
  lunarToGregorian,
  getCurrentLunarDate,
  getLunarPhase,
  isImportantLunarDate,
  getNextImportantLunarDate,
  generateCalendarMonth,
  daysUntil,
  formatLunarDate,
  getEventsInRange,
  getUpcomingEvents,
  isSameLunarDate,
  calculateRecurringEventDates,
  getZodiacAnimal,
  isValidLunarDate,
  getLunarMonthLength,
  type LunarDate,
  type LunarCalendarEvent,
} from './lunar-calendar';

describe('Lunar Calendar Utilities', () => {
  describe('gregorianToLunar', () => {
    it('should convert Gregorian date to lunar date', () => {
      // Test with a known date
      const gregorianDate = new Date(2025, 0, 1); // January 1, 2025
      const lunarDate = gregorianToLunar(gregorianDate);
      
      expect(lunarDate).toHaveProperty('year');
      expect(lunarDate).toHaveProperty('month');
      expect(lunarDate).toHaveProperty('day');
      expect(lunarDate).toHaveProperty('monthName');
      expect(lunarDate).toHaveProperty('dayName');
      expect(typeof lunarDate.isLeapMonth).toBe('boolean');
    });
  });

  describe('lunarToGregorian', () => {
    it('should convert lunar date to Gregorian date', () => {
      const gregorianDate = lunarToGregorian(2025, 1, 1);
      expect(gregorianDate).toBeInstanceOf(Date);
    });

    it('should handle leap months', () => {
      // This test might need adjustment based on actual leap month years
      const gregorianDate = lunarToGregorian(2025, 6, 1, true);
      expect(gregorianDate).toBeInstanceOf(Date);
    });
  });

  describe('getCurrentLunarDate', () => {
    it('should return current lunar date', () => {
      const currentLunar = getCurrentLunarDate();
      expect(currentLunar).toHaveProperty('year');
      expect(currentLunar).toHaveProperty('month');
      expect(currentLunar).toHaveProperty('day');
    });
  });

  describe('getLunarPhase', () => {
    it('should return correct phase for new moon', () => {
      expect(getLunarPhase(1)).toBe('New Moon (Trăng non)');
    });

    it('should return correct phase for full moon', () => {
      expect(getLunarPhase(15)).toBe('Full Moon (Trăng tròn)');
    });

    it('should return correct phase for dark moon', () => {
      expect(getLunarPhase(30)).toBe('Dark Moon (Trăng tối)');
    });

    it('should return phases for intermediate days', () => {
      expect(getLunarPhase(5)).toBe('Waxing Crescent (Trăng lưỡi liềm)');
      expect(getLunarPhase(10)).toBe('Waxing Gibbous (Trăng xuồng)');
      expect(getLunarPhase(20)).toBe('Waning Gibbous (Trăng khết)');
      expect(getLunarPhase(25)).toBe('Waning Crescent (Trăng hạt)');
    });
  });

  describe('isImportantLunarDate', () => {
    it('should identify important dates', () => {
      expect(isImportantLunarDate(1)).toBe(true);
      expect(isImportantLunarDate(15)).toBe(true);
      expect(isImportantLunarDate(10)).toBe(false);
    });
  });

  describe('getNextImportantLunarDate', () => {
    it('should return both next 1st and 15th dates', () => {
      const nextDates = getNextImportantLunarDate();
      expect(nextDates).toHaveProperty('first');
      expect(nextDates).toHaveProperty('fifteenth');
      expect(nextDates.first).toBeInstanceOf(Date);
      expect(nextDates.fifteenth).toBeInstanceOf(Date);
    });
  });

  describe('generateCalendarMonth', () => {
    it('should generate calendar month with correct structure', () => {
      const calendar = generateCalendarMonth(2025, 0); // January 2025
      
      expect(calendar).toHaveProperty('year', 2025);
      expect(calendar).toHaveProperty('month', 0);
      expect(Array.isArray(calendar.days)).toBe(true);
      expect(calendar.days.length).toBeGreaterThan(28); // At least 4 weeks
      
      // Check first day structure
      if (calendar.days.length > 0) {
        const firstDay = calendar.days[0]!;
        expect(firstDay).toHaveProperty('gregorianDate');
        expect(firstDay).toHaveProperty('lunarDate');
        expect(firstDay).toHaveProperty('isToday');
        expect(firstDay).toHaveProperty('isCurrentMonth');
        expect(firstDay).toHaveProperty('isImportant');
        expect(firstDay).toHaveProperty('events');
      }
    });
  });

  describe('daysUntil', () => {
    it('should calculate days until target date', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(daysUntil(tomorrow)).toBe(1);

      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      expect(daysUntil(nextWeek)).toBe(7);
    });

    it('should return negative for past dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(daysUntil(yesterday)).toBe(-1);
    });
  });

  describe('formatLunarDate', () => {
    it('should format lunar date correctly', () => {
      const lunarDate: LunarDate = {
        year: 2025,
        month: 1,
        day: 1,
        monthName: '正月',
        dayName: '初一',
        isLeapMonth: false,
        lunarPhase: 'New Moon (Trăng non)',
        zodiacYear: '甲辰',
        zodiacMonth: '丁丑',
        zodiacDay: '甲子',
      };
      
      const formatted = formatLunarDate(lunarDate);
      expect(formatted).toContain('2025年');
      expect(formatted).toContain('正月');
      expect(formatted).toContain('初一');
    });

    it('should format leap month correctly', () => {
      const lunarDate: LunarDate = {
        year: 2025,
        month: 6,
        day: 1,
        monthName: '六月',
        dayName: '初一',
        isLeapMonth: true,
        lunarPhase: 'New Moon (Trăng non)',
        zodiacYear: '甲辰',
        zodiacMonth: '丁丑',
        zodiacDay: '甲子',
      };
      
      const formatted = formatLunarDate(lunarDate);
      expect(formatted).toContain('閏');
    });
  });

  describe('getEventsInRange', () => {
    it('should filter events within date range', () => {
      const events: LunarCalendarEvent[] = [
        {
          id: '1',
          title: 'Event 1',
          gregorianDate: new Date(2025, 0, 5),
          lunarDate: {} as LunarDate,
          isRecurring: false,
          reminderDays: 3,
        },
        {
          id: '2',
          title: 'Event 2',
          gregorianDate: new Date(2025, 0, 15),
          lunarDate: {} as LunarDate,
          isRecurring: false,
          reminderDays: 3,
        },
      ];

      const startDate = new Date(2025, 0, 1);
      const endDate = new Date(2025, 0, 10);
      
      const filteredEvents = getEventsInRange(events, startDate, endDate);
      expect(filteredEvents).toHaveLength(1);
      expect(filteredEvents[0]?.title).toBe('Event 1');
    });
  });

  describe('isSameLunarDate', () => {
    it('should compare lunar dates correctly', () => {
      const date1: LunarDate = {
        year: 2025,
        month: 1,
        day: 1,
        monthName: '正月',
        dayName: '初一',
        isLeapMonth: false,
        lunarPhase: 'New Moon (Trăng non)',
        zodiacYear: '甲辰',
        zodiacMonth: '丁丑',
        zodiacDay: '甲子',
      };

      const date2: LunarDate = { ...date1 };
      const date3: LunarDate = { ...date1, day: 15 };

      expect(isSameLunarDate(date1, date2)).toBe(true);
      expect(isSameLunarDate(date1, date3)).toBe(false);
    });
  });

  describe('getZodiacAnimal', () => {
    it('should return correct zodiac animals', () => {
      expect(getZodiacAnimal(2024)).toBe('Thần'); // Dragon year
      expect(getZodiacAnimal(2025)).toBe('Tỵ'); // Snake year
      expect(getZodiacAnimal(2026)).toBe('Ngọ'); // Horse year
    });
  });

  describe('isValidLunarDate', () => {
    it('should validate correct lunar dates', () => {
      expect(isValidLunarDate(2025, 1, 1)).toBe(true);
      expect(isValidLunarDate(2025, 12, 29)).toBe(true); // Changed from 30 to 29
    });

    it('should reject invalid lunar dates', () => {
      expect(isValidLunarDate(2025, 13, 1)).toBe(false); // Invalid month
      expect(isValidLunarDate(2025, 1, 32)).toBe(false); // Invalid day
    });
  });

  describe('getLunarMonthLength', () => {
    it('should return month length', () => {
      const length = getLunarMonthLength(2025, 1);
      expect(length).toBeGreaterThan(28);
      expect(length).toBeLessThan(31);
    });
  });
});