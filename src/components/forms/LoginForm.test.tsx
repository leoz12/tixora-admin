import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import LoginForm from "@/components/forms/LoginForm";
import { login } from "@/lib/auth";
import { useAdminAuth } from "@/lib/store/auth.store";

const push = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

jest.mock("@/lib/auth", () => ({
  login: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const mockedLogin = login as jest.MockedFunction<typeof login>;

function renderLoginForm() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <LoginForm />
    </QueryClientProvider>
  );
}

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAdminAuth.setState({ admin: null, isAuthenticated: false, isHydrated: false });
  });

  it("shows validation errors and does not submit for invalid input", async () => {
    const user = userEvent.setup();
    renderLoginForm();

    await user.type(screen.getByLabelText(/email/i), "not-an-email");
    await user.type(screen.getByLabelText(/^password$/i), "123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Enter a valid email")).toBeInTheDocument();
    expect(
      screen.getByText("Password must be at least 6 characters")
    ).toBeInTheDocument();
    expect(mockedLogin).not.toHaveBeenCalled();
  });

  it("logs in, updates the auth store, and redirects on success", async () => {
    const admin = { id: "1", name: "Ada Lovelace", email: "ada@tixora.com" };
    mockedLogin.mockResolvedValueOnce({ admin });

    const user = userEvent.setup();
    renderLoginForm();

    await user.type(screen.getByLabelText(/email/i), "ada@tixora.com");
    await user.type(screen.getByLabelText(/^password$/i), "secret123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockedLogin).toHaveBeenCalledWith(
        { email: "ada@tixora.com", password: "secret123" },
        expect.anything()
      );
    });

    await waitFor(() => {
      expect(useAdminAuth.getState().admin).toEqual(admin);
    });
    expect(useAdminAuth.getState().isAuthenticated).toBe(true);
    expect(toast.success).toHaveBeenCalledWith("Welcome back, Ada Lovelace");
    expect(push).toHaveBeenCalledWith("/dashboard");
  });

  it("shows a toast and does not redirect when login fails", async () => {
    mockedLogin.mockRejectedValueOnce(new Error("Invalid credentials"));

    const user = userEvent.setup();
    renderLoginForm();

    await user.type(screen.getByLabelText(/email/i), "ada@tixora.com");
    await user.type(screen.getByLabelText(/^password$/i), "wrongpass");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid email or password");
    });
    expect(push).not.toHaveBeenCalled();
    expect(useAdminAuth.getState().isAuthenticated).toBe(false);
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const passwordInput = screen.getByLabelText(/^password$/i);
    expect(passwordInput).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: /toggle password visibility/i }));
    expect(passwordInput).toHaveAttribute("type", "text");
  });
});
