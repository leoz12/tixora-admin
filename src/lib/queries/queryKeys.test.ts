import { categoryKeys, eventKeys, orderKeys, userKeys } from "@/lib/queries/queryKeys";

describe.each([
  ["eventKeys", eventKeys, "events"],
  ["categoryKeys", categoryKeys, "categories"],
  ["orderKeys", orderKeys, "orders"],
  ["userKeys", userKeys, "users"],
])("%s", (_name, keys, resource) => {
  it("builds the base key", () => {
    expect(keys.all).toEqual([resource]);
  });

  it("builds the list key namespaced under the base key", () => {
    expect(keys.lists()).toEqual([resource, "list"]);
  });

  it("includes the query params in the list key", () => {
    const params = { page: 1, search: "abc" };
    expect(keys.list(params)).toEqual([resource, "list", params]);
  });

  it("builds the detail key namespaced under the base key", () => {
    expect(keys.details()).toEqual([resource, "detail"]);
  });

  it("includes the id in the detail key", () => {
    expect(keys.detail("123")).toEqual([resource, "detail", "123"]);
  });
});
