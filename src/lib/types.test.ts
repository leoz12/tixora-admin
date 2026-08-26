import { toPaginated, type ApiListEnvelope } from "@/lib/types";

describe("toPaginated", () => {
  it("flattens an API list envelope into the internal Paginated shape", () => {
    const envelope: ApiListEnvelope<{ id: string }> = {
      success: true,
      data: [{ id: "1" }, { id: "2" }],
      pagination: {
        current_page: 2,
        total_pages: 5,
        total_items: 42,
        per_page: 10,
      },
    };

    expect(toPaginated(envelope)).toEqual({
      items: [{ id: "1" }, { id: "2" }],
      page: 2,
      per_page: 10,
      total: 42,
      total_pages: 5,
    });
  });

  it("handles an empty data array", () => {
    const envelope: ApiListEnvelope<unknown> = {
      success: true,
      data: [],
      pagination: { current_page: 1, total_pages: 0, total_items: 0, per_page: 10 },
    };

    expect(toPaginated(envelope).items).toEqual([]);
  });
});
