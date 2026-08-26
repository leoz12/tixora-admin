import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TablePagination from "@/components/tables/TablePagination";

describe("TablePagination", () => {
  it("renders nothing when there is only one page", () => {
    const { container } = render(
      <TablePagination page={1} totalPages={1} onPageChange={jest.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a page link for every page when the total is small", () => {
    render(<TablePagination page={1} totalPages={3} onPageChange={jest.fn()} />);
    expect(screen.getByRole("link", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "2" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "3" })).toBeInTheDocument();
  });

  it("marks the current page as active", () => {
    render(<TablePagination page={2} totalPages={3} onPageChange={jest.fn()} />);
    expect(screen.getByRole("link", { name: "2" })).toHaveAttribute("aria-current", "page");
  });

  it("collapses far-away pages behind an ellipsis for a large total", () => {
    render(<TablePagination page={5} totalPages={20} onPageChange={jest.fn()} />);

    // Windowed: 1, ..., 4, 5, 6, ..., 20
    expect(screen.getByRole("link", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "4" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "5" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "6" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "20" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "10" })).not.toBeInTheDocument();
    expect(screen.getAllByText("…")).toHaveLength(2);
  });

  it("calls onPageChange with the clicked page", async () => {
    const onPageChange = jest.fn();
    const user = userEvent.setup();
    render(<TablePagination page={1} totalPages={3} onPageChange={onPageChange} />);

    await user.click(screen.getByRole("link", { name: "2" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("does not go below page 1 when Previous is clicked on the first page", async () => {
    const onPageChange = jest.fn();
    const user = userEvent.setup();
    render(<TablePagination page={1} totalPages={3} onPageChange={onPageChange} />);

    await user.click(screen.getByRole("link", { name: /go to previous page/i }));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("does not go past the last page when Next is clicked on the last page", async () => {
    const onPageChange = jest.fn();
    const user = userEvent.setup();
    render(<TablePagination page={3} totalPages={3} onPageChange={onPageChange} />);

    await user.click(screen.getByRole("link", { name: /go to next page/i }));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("advances to the next page when Next is clicked mid-range", async () => {
    const onPageChange = jest.fn();
    const user = userEvent.setup();
    render(<TablePagination page={2} totalPages={3} onPageChange={onPageChange} />);

    await user.click(screen.getByRole("link", { name: /go to next page/i }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
