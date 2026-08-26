import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { formatISO, parseISO } from "date-fns";
import EventForm from "@/components/forms/EventForm";
import type { EventItem } from "@/lib/types";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/lib/queries/categories", () => ({
  useCategories: jest.fn(),
}));

jest.mock("@/lib/queries/files", () => ({
  usePresignUpload: jest.fn(),
  uploadFileToPresignedUrl: jest.fn(),
}));

import { useRouter } from "next/navigation";
import { useCategories } from "@/lib/queries/categories";
import { usePresignUpload, uploadFileToPresignedUrl } from "@/lib/queries/files";

const mockedUseRouter = useRouter as jest.Mock;
const mockedUseCategories = useCategories as jest.Mock;
const mockedUsePresignUpload = usePresignUpload as jest.Mock;
const mockedUploadFile = uploadFileToPresignedUrl as jest.Mock;

const back = jest.fn();
const mutateAsync = jest.fn();

function pngFile(name = "poster.png") {
  return new File(["bytes"], name, { type: "image/png" });
}

describe("EventForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({ back });
    mockedUseCategories.mockReturnValue({
      data: [
        { id: "cat-1", name: "Concerts" },
        { id: "cat-2", name: "Conferences" },
      ],
      isLoading: false,
    });
    mockedUsePresignUpload.mockReturnValue({ isPending: false, mutateAsync });
  });

  it("shows validation errors and does not submit for an empty required field", async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();
    render(<EventForm isSubmitting={false} onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: /create event/i }));

    expect(await screen.findByText("Title must be at least 3 characters")).toBeInTheDocument();
    expect(screen.getByText("Location is required")).toBeInTheDocument();
    expect(screen.getByText("Select a category")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls router.back when Cancel is clicked", async () => {
    const user = userEvent.setup();
    render(<EventForm isSubmitting={false} onSubmit={jest.fn()} />);

    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(back).toHaveBeenCalled();
  });

  it("submits with the event_date normalized to a full ISO string", async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();
    render(<EventForm isSubmitting={false} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/title/i), "Jazz Night");
    await user.type(screen.getByLabelText(/location/i), "Jakarta");
    const dateInput = screen.getByLabelText(/event date/i);
    await user.clear(dateInput);
    await user.type(dateInput, "2026-12-01T19:00");
    await user.type(screen.getByLabelText(/price/i), "150000");
    await user.type(screen.getByLabelText(/total tickets/i), "100");

    await user.click(screen.getByRole("combobox", { name: /category/i }));
    await user.click(await screen.findByRole("option", { name: "Concerts" }));

    await user.click(screen.getByRole("button", { name: /create event/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const submitted = onSubmit.mock.calls[0][0];
    expect(submitted).toMatchObject({
      title: "Jazz Night",
      location: "Jakarta",
      price: 150000,
      total_tickets: 100,
      category_id: "cat-1",
    });
    // The <input type="datetime-local"> value has no timezone, so date-fns
    // parses/formats it in the local (test-runner) timezone - assert
    // against the same transform rather than a hardcoded offset.
    expect(submitted.event_date).toBe(formatISO(parseISO("2026-12-01T19:00")));
  });

  it("uploads the selected image via presign + PUT and stores the returned file id", async () => {
    mutateAsync.mockResolvedValueOnce({
      file_id: "file-1",
      upload_url: "https://cdn.example/upload",
      expires_in_seconds: 60,
    });
    mockedUploadFile.mockResolvedValueOnce(undefined);

    const user = userEvent.setup();
    render(<EventForm isSubmitting={false} onSubmit={jest.fn()} />);

    const file = pngFile();
    const fileInput = document.getElementById("image") as HTMLInputElement;
    await user.upload(fileInput, file);

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        filename: "poster.png",
        mime_type: "image/png",
        size: file.size,
      })
    );
    expect(mockedUploadFile).toHaveBeenCalledWith("https://cdn.example/upload", file);
  });

  it("shows an upload error message when the presign request fails", async () => {
    mutateAsync.mockRejectedValueOnce(new Error("network down"));

    const user = userEvent.setup();
    render(<EventForm isSubmitting={false} onSubmit={jest.fn()} />);

    const fileInput = document.getElementById("image") as HTMLInputElement;
    await user.upload(fileInput, pngFile());

    expect(await screen.findByText("Failed to upload image")).toBeInTheDocument();
    expect(mockedUploadFile).not.toHaveBeenCalled();
  });

  it("pre-fills fields and shows 'Save changes' when editing an existing event", () => {
    const event: EventItem = {
      id: "1",
      title: "Jazz Night",
      description: "A night of jazz",
      event_date: "2026-12-01T19:00:00Z",
      location: "Jakarta",
      image_url: "https://cdn.example/poster.png",
      price: 150000,
      total_tickets: 100,
      available_tickets: 50,
      category_id: "cat-1",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    };

    render(<EventForm event={event} isSubmitting={false} onSubmit={jest.fn()} />);

    expect(screen.getByLabelText(/title/i)).toHaveValue("Jazz Night");
    expect(screen.getByLabelText(/location/i)).toHaveValue("Jakarta");
    expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
  });
});
