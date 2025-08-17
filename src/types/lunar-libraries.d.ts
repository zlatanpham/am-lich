declare module "lunar-javascript" {
  export class Lunar {
    static fromYmd(year: number, month: number, day: number): Lunar;
    static fromYmdHms(
      year: number,
      month: number,
      day: number,
      hour: number,
      minute: number,
      second: number,
    ): Lunar;

    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getMinute(): number;
    getSecond(): number;

    getMonthInChinese(): string;
    getDayInChinese(): string;

    getYearInGanZhi(): string;
    getMonthInGanZhi(): string;
    getDayInGanZhi(): string;

    getSolar(): Solar;
    getDayCount(): number;
  }

  export class Solar {
    static fromDate(date: Date): Solar;
    static fromYmd(year: number, month: number, day: number): Solar;

    getYear(): number;
    getMonth(): number;
    getDay(): number;

    getLunar(): Lunar;
  }
}

declare module "chinese-lunar-calendar" {
  interface LunarResult {
    lunarMonth: number;
    lunarDate: number;
    isLeap: boolean;
    solarTerm: string | null;
    lunarYear: string;
    zodiac: string;
    dateStr: string;
  }

  export function getLunar(
    year: number,
    month: number,
    day: number,
  ): LunarResult;
}
