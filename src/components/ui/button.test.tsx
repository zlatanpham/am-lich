import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";

describe("Button", () => {
  it("renders button with text", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: /click me/i }),
    ).toBeInTheDocument();
  });

  it("handles click events", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole("button", { name: /click me/i }));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("applies variant classes correctly", () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole("button", { name: /delete/i });
    expect(button).toHaveClass("bg-destructive");
  });

  it("applies size classes correctly", () => {
    render(<Button size="lg">Large Button</Button>);
    const button = screen.getByRole("button", { name: /large button/i });
    expect(button).toHaveClass("h-8");
  });

  it("shows loading state correctly", () => {
    render(<Button isLoading>Loading Button</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled Button</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled when loading", () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("passes through data attributes", () => {
    render(<Button data-testid="custom-button">Button</Button>);
    expect(screen.getByTestId("custom-button")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByRole("button")).toHaveClass("custom-class");
  });

  it("renders with icon", () => {
    const TestIcon = () => <svg data-testid="test-icon" />;
    render(
      <Button>
        <TestIcon />
        Button with icon
      </Button>,
    );

    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /button with icon/i }),
    ).toBeInTheDocument();
  });
});
