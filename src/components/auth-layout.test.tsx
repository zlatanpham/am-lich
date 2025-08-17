import { render, screen } from "@testing-library/react";
import { AuthLayout } from "./auth-layout";
import { vi } from "vitest";

// Mock Next.js Link component
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

describe("AuthLayout", () => {
  it("renders the logo and app name correctly", () => {
    render(
      <AuthLayout>
        <div>Test content</div>
      </AuthLayout>,
    );

    // Check if the app name is rendered
    expect(screen.getByText("Lịch âm")).toBeInTheDocument();

    // Check if the description is rendered
    expect(
      screen.getByText("Hệ thống lịch âm truyền thống Việt Nam"),
    ).toBeInTheDocument();

    // Check if the logo link points to home
    const logoLink = screen.getByRole("link", { name: /lịch âm/i });
    expect(logoLink).toHaveAttribute("href", "/");
  });

  it("renders children content properly", () => {
    const testContent = "This is test auth form content";

    render(
      <AuthLayout>
        <div>{testContent}</div>
      </AuthLayout>,
    );

    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it("applies proper layout classes for centering", () => {
    const { container } = render(
      <AuthLayout>
        <div>Test content</div>
      </AuthLayout>,
    );

    // Check if the main container has the proper centering classes
    const mainContainer = container.querySelector(".min-h-screen");
    expect(mainContainer).toHaveClass(
      "min-h-screen",
      "bg-gradient-to-br",
      "from-slate-50",
      "to-slate-100",
      "dark:from-slate-950",
      "dark:to-slate-900",
    );

    // Check if the flex container has proper centering classes
    const flexContainer = container.querySelector(".flex.min-h-screen");
    expect(flexContainer).toHaveClass(
      "flex",
      "min-h-screen",
      "flex-col",
      "items-center",
      "justify-center",
      "p-4",
    );

    // Check if the content wrapper has max width
    const contentWrapper = container.querySelector(".w-full.max-w-md");
    expect(contentWrapper).toHaveClass("w-full", "max-w-md");
  });

  it("has proper responsive padding", () => {
    const { container } = render(
      <AuthLayout>
        <div>Test content</div>
      </AuthLayout>,
    );

    const flexContainer = container.querySelector(".flex.min-h-screen");
    expect(flexContainer).toHaveClass("p-4");
  });

  it("renders calendar icon in the logo", () => {
    render(
      <AuthLayout>
        <div>Test content</div>
      </AuthLayout>,
    );

    // Check if the calendar icon container exists
    const iconContainer = screen
      .getByText("Lịch âm")
      .closest("a")
      ?.querySelector(".bg-primary");
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer).toHaveClass(
      "bg-primary",
      "text-primary-foreground",
      "flex",
      "size-10",
      "items-center",
      "justify-center",
      "rounded-lg",
    );
  });
});
