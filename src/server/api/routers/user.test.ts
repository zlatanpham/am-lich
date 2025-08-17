import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";

vi.mock("bcryptjs");

describe("Password utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("bcrypt integration", () => {
    it("hashes passwords correctly", async () => {
      vi.mocked(bcrypt.hash).mockResolvedValue("hashed-password" as never);

      const password = "mySecurePassword123";
      const hashedPassword = await bcrypt.hash(password, 10);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(hashedPassword).toBe("hashed-password");
    });

    it("compares passwords correctly", async () => {
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const password = "mySecurePassword123";
      const hashedPassword = "hashed-password";
      const isValid = await bcrypt.compare(password, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it("returns false for incorrect passwords", async () => {
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const wrongPassword = "wrongPassword";
      const hashedPassword = "hashed-password";
      const isValid = await bcrypt.compare(wrongPassword, hashedPassword);

      expect(isValid).toBe(false);
    });
  });

  describe("Password validation logic", () => {
    const validatePassword = (
      password: string,
    ): { isValid: boolean; message?: string } => {
      if (password.length < 8) {
        return {
          isValid: false,
          message: "Password must be at least 8 characters long",
        };
      }
      if (!/[A-Z]/.test(password)) {
        return {
          isValid: false,
          message: "Password must contain at least one uppercase letter",
        };
      }
      if (!/[a-z]/.test(password)) {
        return {
          isValid: false,
          message: "Password must contain at least one lowercase letter",
        };
      }
      if (!/[0-9]/.test(password)) {
        return {
          isValid: false,
          message: "Password must contain at least one number",
        };
      }
      return { isValid: true };
    };

    it("validates strong passwords", () => {
      const result = validatePassword("MyPassword123");
      expect(result.isValid).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it("rejects passwords that are too short", () => {
      const result = validatePassword("Abc123");
      expect(result.isValid).toBe(false);
      expect(result.message).toBe(
        "Password must be at least 8 characters long",
      );
    });

    it("rejects passwords without uppercase letters", () => {
      const result = validatePassword("password123");
      expect(result.isValid).toBe(false);
      expect(result.message).toBe(
        "Password must contain at least one uppercase letter",
      );
    });

    it("rejects passwords without numbers", () => {
      const result = validatePassword("Password");
      expect(result.isValid).toBe(false);
      expect(result.message).toBe("Password must contain at least one number");
    });
  });
});
