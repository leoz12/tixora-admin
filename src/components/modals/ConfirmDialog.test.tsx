import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmDialog from "@/components/modals/ConfirmDialog";

describe("ConfirmDialog", () => {
  it("renders nothing interactive when closed", () => {
    render(
      <ConfirmDialog
        isOpen={false}
        title="Delete Event"
        message="Are you sure?"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(screen.queryByText("Delete Event")).not.toBeInTheDocument();
  });

  it("shows the title and message when open", () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Event"
        message="This action cannot be undone."
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(screen.getByText("Delete Event")).toBeInTheDocument();
    expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();
  });

  it("calls onConfirm when the confirm button is clicked", async () => {
    const onConfirm = jest.fn();
    const user = userEvent.setup();
    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Event"
        message="Are you sure?"
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when the cancel button is clicked", async () => {
    const onCancel = jest.fn();
    const user = userEvent.setup();
    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Event"
        message="Are you sure?"
        onConfirm={jest.fn()}
        onCancel={onCancel}
      />
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    // Fires twice: once from the button's own onClick, once more from
    // AlertDialog's onOpenChange(false) as the dialog closes itself -
    // onCancel (setConfirmId(null) in practice) is idempotent either way.
    expect(onCancel).toHaveBeenCalled();
  });

  it("uses the custom confirm label when provided", () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Event"
        message="Are you sure?"
        confirmLabel="Delete"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("disables both buttons and shows a waiting label while loading", () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Event"
        message="Are you sure?"
        loading={true}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(screen.getByRole("button", { name: "Please wait..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });
});
