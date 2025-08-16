import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { EditNameDialog } from "./edit-name-dialog";

const mockMutate = vi.fn();
const mockUpdateName = {
  mutate: mockMutate,
  isPending: false,
  error: null,
};

vi.mock("@/trpc/react", () => ({
  api: {
    user: {
      updateName: {
        useMutation: vi.fn(() => mockUpdateName),
      },
    },
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("EditNameDialog", () => {
  const defaultProps = {
    currentName: "John Doe",
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the trigger button", () => {
    render(<EditNameDialog {...defaultProps} />);
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
  });

  it("opens dialog when trigger button is clicked", async () => {
    const user = userEvent.setup();
    render(<EditNameDialog {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /edit/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Edit Name")).toBeInTheDocument();
  });

  it("pre-fills the form with current name", async () => {
    const user = userEvent.setup();
    render(<EditNameDialog {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /edit/i }));

    const nameInput = screen.getByRole("textbox", { name: /name/i });
    expect(nameInput).toHaveValue("John Doe");
  });

  it("submits the form with updated name", async () => {
    const user = userEvent.setup();
    render(<EditNameDialog {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /edit/i }));

    const nameInput = screen.getByRole("textbox", { name: /name/i });
    await user.clear(nameInput);
    await user.type(nameInput, "Jane Smith");

    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(mockMutate).toHaveBeenCalledWith({ name: "Jane Smith" });
  });

  it("shows validation error for names that are too short", async () => {
    const user = userEvent.setup();
    render(<EditNameDialog {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /edit/i }));

    const nameInput = screen.getByRole("textbox", { name: /name/i });
    await user.clear(nameInput);
    await user.type(nameInput, "A");

    await user.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Name must be at least 2 characters."),
      ).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("closes dialog when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(<EditNameDialog {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /edit/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("shows loading state when mutation is pending", async () => {
    mockUpdateName.isPending = true;
    const user = userEvent.setup();
    render(<EditNameDialog {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /edit/i }));

    const saveButton = screen.getByRole("button", { name: /save/i });
    expect(saveButton).toBeDisabled();
  });

  it("calls onSuccess callback when mutation succeeds", async () => {
    const onSuccessMock = vi.fn();
    const user = userEvent.setup();

    render(<EditNameDialog currentName="John Doe" onSuccess={onSuccessMock} />);

    await user.click(screen.getByRole("button", { name: /edit/i }));

    const nameInput = screen.getByRole("textbox", { name: /name/i });
    await user.clear(nameInput);
    await user.type(nameInput, "Updated Name");

    await user.click(screen.getByRole("button", { name: /save/i }));

    const { api } = await import("@/trpc/react");
    const mockUseMutation = vi.mocked(api.user.updateName.useMutation);
    const mutationOptions = mockUseMutation.mock.calls[0]?.[0];

    if (mutationOptions?.onSuccess) {
      await mutationOptions.onSuccess(
        {
          name: "Updated Name",
          id: "test-id",
          email: "test@example.com",
          emailVerified: null,
          image: null,
          password: null,
          reset_password_token: null,
          reset_password_expires: null,
        },
        { name: "Updated Name" },
        undefined,
      );
    }

    expect(onSuccessMock).toHaveBeenCalled();
  });
});
