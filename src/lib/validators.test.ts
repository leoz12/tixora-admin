import { CategorySchema, EventSchema, LoginSchema } from "@/lib/validators";

describe("LoginSchema", () => {
  it("accepts a valid email and password", () => {
    const result = LoginSchema.safeParse({
      email: "admin@tixora.com",
      password: "secret1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = LoginSchema.safeParse({
      email: "not-an-email",
      password: "secret1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Enter a valid email");
    }
  });

  it("rejects a password shorter than 6 characters", () => {
    const result = LoginSchema.safeParse({
      email: "admin@tixora.com",
      password: "123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Password must be at least 6 characters"
      );
    }
  });
});

describe("CategorySchema", () => {
  it("accepts a valid category", () => {
    const result = CategorySchema.safeParse({ name: "Concerts", is_active: true });
    expect(result.success).toBe(true);
  });

  it("rejects a name shorter than 3 characters", () => {
    const result = CategorySchema.safeParse({ name: "AB", is_active: true });
    expect(result.success).toBe(false);
  });

  it("rejects a missing is_active flag", () => {
    const result = CategorySchema.safeParse({ name: "Concerts" });
    expect(result.success).toBe(false);
  });
});

describe("EventSchema", () => {
  const validEvent = {
    title: "Jazz Night",
    event_date: "2026-12-01",
    location: "Jakarta",
    price: 100000,
    total_tickets: 100,
    category_id: "cat-1",
  };

  it("accepts a valid event without optional fields", () => {
    const result = EventSchema.safeParse(validEvent);
    expect(result.success).toBe(true);
  });

  it("rejects a negative price", () => {
    const result = EventSchema.safeParse({ ...validEvent, price: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects a non-positive total_tickets", () => {
    const result = EventSchema.safeParse({ ...validEvent, total_tickets: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects a title shorter than 3 characters", () => {
    const result = EventSchema.safeParse({ ...validEvent, title: "AB" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty location", () => {
    const result = EventSchema.safeParse({ ...validEvent, location: "" });
    expect(result.success).toBe(false);
  });
});
