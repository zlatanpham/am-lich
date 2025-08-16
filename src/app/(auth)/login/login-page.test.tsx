import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

// Mock dependencies with minimal implementation for rendering test
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
  }),
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    update: vi.fn(),
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock("@/app/actions/auth", () => ({
  login: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: function MockLink({ 
    children, 
    href, 
    ...props 
  }: { 
    children: React.ReactNode; 
    href: string;
    [key: string]: unknown;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  },
}));

// Mock AuthLayout to avoid complex mocking for basic rendering test
vi.mock("@/components/auth-layout", () => ({
  AuthLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-layout">{children}</div>
  ),
}));

// Import the actual component after mocks are set up
import LoginPage from "./page";

describe("LoginPage", () => {
  it("renders login form with Vietnamese text", () => {
    render(<LoginPage />);

    // Check Vietnamese title and description
    expect(screen.getByText("Chào mừng trở lại")).toBeInTheDocument();
    expect(screen.getByText("Đăng nhập bằng email và mật khẩu của bạn")).toBeInTheDocument();

    // Check Vietnamese form labels
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Mật khẩu")).toBeInTheDocument();

    // Check Vietnamese button text
    expect(screen.getByRole("button", { name: "Đăng nhập" })).toBeInTheDocument();

    // Check Vietnamese link text
    expect(screen.getByText("Quên mật khẩu?")).toBeInTheDocument();
    expect(screen.getByText("Chưa có tài khoản?")).toBeInTheDocument();
    expect(screen.getByText("Đăng ký ngay")).toBeInTheDocument();
  });

  it("has proper form structure and accessibility", () => {
    render(<LoginPage />);

    // Check form inputs
    const emailInput = screen.getByPlaceholderText("email@example.com");
    const passwordInput = screen.getByPlaceholderText("********");

    expect(emailInput).toHaveAttribute("type", "email");
    expect(passwordInput).toHaveAttribute("type", "password");

    // Check form submission
    const form = emailInput.closest("form");
    expect(form).toBeInTheDocument();

    // Check button attributes
    const submitButton = screen.getByRole("button", { name: "Đăng nhập" });
    expect(submitButton).toHaveAttribute("type", "submit");
  });

  it("renders within auth layout", () => {
    render(<LoginPage />);
    
    // Check that the auth layout wrapper is present
    expect(screen.getByTestId("auth-layout")).toBeInTheDocument();
  });

  it("has proper navigation links", () => {
    render(<LoginPage />);

    // Check forgot password link
    const forgotPasswordLink = screen.getByRole("link", { name: "Quên mật khẩu?" });
    expect(forgotPasswordLink).toHaveAttribute("href", "/forgot-password");

    // Check signup link
    const signupLink = screen.getByRole("link", { name: "Đăng ký ngay" });
    expect(signupLink).toHaveAttribute("href", "/signup");
  });
});