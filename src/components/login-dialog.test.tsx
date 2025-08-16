import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, type MockedFunction } from "vitest";
import { LoginDialog } from "./login-dialog";
import { toast } from "sonner";
import { login } from "@/app/actions/auth";
import { useSession } from "next-auth/react";

// Mock dependencies
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/app/actions/auth", () => ({
  login: vi.fn(),
}));

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: function MockLink({ children, href, onClick }: { children: React.ReactNode; href: string; onClick?: () => void }) {
    return (
      <a href={href} onClick={onClick}>
        {children}
      </a>
    );
  },
}));

describe("LoginDialog", () => {
  const mockUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useSession as MockedFunction<typeof useSession>).mockReturnValue({
      update: mockUpdate,
    } as any);
  });

  it("renders trigger button and opens dialog when clicked", async () => {
    const user = userEvent.setup();
    render(
      <LoginDialog>
        <button>Open Login</button>
      </LoginDialog>
    );

    const triggerButton = screen.getByRole("button", { name: "Open Login" });
    expect(triggerButton).toBeInTheDocument();

    await user.click(triggerButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Đăng nhập" })).toBeInTheDocument();
    expect(screen.getByText("Đăng nhập bằng email và mật khẩu của bạn")).toBeInTheDocument();
  });

  it("renders form fields correctly", async () => {
    const user = userEvent.setup();
    render(
      <LoginDialog>
        <button>Open Login</button>
      </LoginDialog>
    );

    await user.click(screen.getByRole("button", { name: "Open Login" }));

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Mật khẩu")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Đăng nhập" })).toBeInTheDocument();
    expect(screen.getByText("Quên mật khẩu?")).toBeInTheDocument();
    expect(screen.getByText("Đăng ký")).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    const user = userEvent.setup();
    render(
      <LoginDialog>
        <button>Open Login</button>
      </LoginDialog>
    );

    await user.click(screen.getByRole("button", { name: "Open Login" }));
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid email address.")).toBeInTheDocument();
      expect(screen.getByText("Password is required.")).toBeInTheDocument();
    });
  });


  it("submits form with valid data", async () => {
    const user = userEvent.setup();
    (login as MockedFunction<typeof login>).mockResolvedValue(undefined);

    render(
      <LoginDialog>
        <button>Open Login</button>
      </LoginDialog>
    );

    await user.click(screen.getByRole("button", { name: "Open Login" }));

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Mật khẩu");
    
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith(expect.any(FormData));
      expect(mockUpdate).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Đăng nhập thành công!");
    });
  });

  it("handles login error", async () => {
    const user = userEvent.setup();
    (login as MockedFunction<typeof login>).mockRejectedValue(new Error("Login failed"));

    render(
      <LoginDialog>
        <button>Open Login</button>
      </LoginDialog>
    );

    await user.click(screen.getByRole("button", { name: "Open Login" }));

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Mật khẩu");
    
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "wrongpassword");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    });
  });

  it("disables submit button while submitting", async () => {
    const user = userEvent.setup();
    (login as MockedFunction<typeof login>).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <LoginDialog>
        <button>Open Login</button>
      </LoginDialog>
    );

    await user.click(screen.getByRole("button", { name: "Open Login" }));

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Mật khẩu");
    const submitButton = screen.getByRole("button", { name: "Đăng nhập" });
    
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
  });

  it("renders forgot password and signup links", async () => {
    const user = userEvent.setup();
    render(
      <LoginDialog>
        <button>Open Login</button>
      </LoginDialog>
    );

    await user.click(screen.getByRole("button", { name: "Open Login" }));
    
    expect(screen.getByText("Quên mật khẩu?")).toBeInTheDocument();
    expect(screen.getByText("Đăng ký")).toBeInTheDocument();
    expect(screen.getByText("Chưa có tài khoản?")).toBeInTheDocument();
  });
});