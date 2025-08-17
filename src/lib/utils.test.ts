import { describe, it, expect, beforeEach, vi } from "vitest";
import { cn, timeAgo } from "./utils";

describe("utils", () => {
  describe("cn", () => {
    it("merges class names correctly", () => {
      expect(cn("px-4", "py-2")).toBe("px-4 py-2");
    });

    it("handles conflicting Tailwind classes", () => {
      expect(cn("px-4", "px-6")).toBe("px-6");
    });

    it("handles conditional classes", () => {
      expect(cn("base", true && "conditional")).toBe("base conditional");
      expect(cn("base", false && "conditional")).toBe("base");
    });

    it("handles arrays and objects", () => {
      expect(cn(["px-4", "py-2"], { "bg-red": true, "bg-blue": false })).toBe(
        "px-4 py-2 bg-red",
      );
    });
  });

  describe("timeAgo", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it("formats time ago from Date object", () => {
      const now = new Date("2024-01-01T12:00:00Z");
      const pastDate = new Date("2024-01-01T11:00:00Z");
      vi.setSystemTime(now);

      expect(timeAgo(pastDate)).toBe("1 hour ago");
    });

    it("formats time ago from string", () => {
      const now = new Date("2024-01-01T12:00:00Z");
      vi.setSystemTime(now);

      expect(timeAgo("2024-01-01T11:00:00Z")).toBe("1 hour ago");
    });

    it("handles minutes", () => {
      const now = new Date("2024-01-01T12:00:00Z");
      const pastDate = new Date("2024-01-01T11:30:00Z");
      vi.setSystemTime(now);

      expect(timeAgo(pastDate)).toBe("30 minutes ago");
    });

    it("handles future dates", () => {
      const now = new Date("2024-01-01T12:00:00Z");
      const futureDate = new Date("2024-01-01T13:00:00Z");
      vi.setSystemTime(now);

      expect(timeAgo(futureDate)).toBe("in 1 hour");
    });
  });
});
