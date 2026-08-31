import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChangePasswordForm from "@/components/forms/ChangePasswordForm";

describe("ChangePasswordForm", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows a validation error and does not submit for a too-short new password", async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();
    render(<ChangePasswordForm isSubmitting={false} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/current password/i), "old-password");
    await user.type(screen.getByLabelText(/^new password/i), "short");
    await user.type(screen.getByLabelText(/confirm new password/i), "short");
    await user.click(screen.getByRole("button", { name: /update password/i }));

    expect(
      await screen.findByText("New password must be at least 8 characters")
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows an error when the confirmation does not match", async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();
    render(<ChangePasswordForm isSubmitting={false} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/current password/i), "old-password");
    await user.type(screen.getByLabelText(/^new password/i), "brand-new-password");
    await user.type(screen.getByLabelText(/confirm new password/i), "different-password");
    await user.click(screen.getByRole("button", { name: /update password/i }));

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits the current and new password when valid", async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();
    render(<ChangePasswordForm isSubmitting={false} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/current password/i), "old-password");
    await user.type(screen.getByLabelText(/^new password/i), "brand-new-password");
    await user.type(screen.getByLabelText(/confirm new password/i), "brand-new-password");
    await user.click(screen.getByRole("button", { name: /update password/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      {
        current_password: "old-password",
        new_password: "brand-new-password",
        confirm_password: "brand-new-password",
      },
      expect.anything()
    );
  });

  it("disables the submit button while submitting", () => {
    render(<ChangePasswordForm isSubmitting={true} onSubmit={jest.fn()} />);
    expect(screen.getByRole("button", { name: /updating/i })).toBeDisabled();
  });
});
