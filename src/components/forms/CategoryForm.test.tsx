import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CategoryForm from "@/components/forms/CategoryForm";
import type { Category } from "@/lib/types";

const back = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ back }),
}));

const category: Category = {
  id: "1",
  name: "Concerts",
  slug: "concerts",
  is_active: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

describe("CategoryForm", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows a validation error and does not submit for a too-short name", async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();
    render(<CategoryForm isSubmitting={false} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/name/i), "AB");
    await user.click(screen.getByRole("button", { name: /create category/i }));

    expect(
      await screen.findByText("Name must be at least 3 characters")
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits the trimmed form data for a new category", async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();
    render(<CategoryForm isSubmitting={false} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/name/i), "Concerts");
    await user.click(screen.getByRole("button", { name: /create category/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      { name: "Concerts", is_active: true },
      expect.anything()
    );
  });

  it("does not show the active checkbox when creating (no category prop)", () => {
    render(<CategoryForm isSubmitting={false} onSubmit={jest.fn()} />);
    expect(screen.queryByLabelText(/active/i)).not.toBeInTheDocument();
  });

  it("shows the active checkbox pre-filled from the category when editing", () => {
    render(<CategoryForm category={category} isSubmitting={false} onSubmit={jest.fn()} />);
    expect(screen.getByLabelText(/active/i)).toBeChecked();
  });

  it("calls router.back when Cancel is clicked", async () => {
    const user = userEvent.setup();
    render(<CategoryForm isSubmitting={false} onSubmit={jest.fn()} />);

    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(back).toHaveBeenCalled();
  });

  it("disables the submit button and shows saving state while submitting", () => {
    render(<CategoryForm isSubmitting={true} onSubmit={jest.fn()} />);
    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
  });

  it("shows 'Save changes' label when editing an existing category", () => {
    render(<CategoryForm category={category} isSubmitting={false} onSubmit={jest.fn()} />);
    expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
  });
});
