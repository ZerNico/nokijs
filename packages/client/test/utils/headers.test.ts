import { describe, expect, it } from "vitest";
import { joinHeaders } from "../../src/utils/headers";

describe("joinHeaders", () => {
  it("should join multiple headers into one", () => {
    const headers1 = new Headers({ "Content-Type": "application/json" });
    const headers2 = new Headers({ Authorization: "Bearer token" });
    const result = joinHeaders(headers1, headers2);

    expect(result.get("Content-Type")).toBe("application/json");
    expect(result.get("Authorization")).toBe("Bearer token");
  });

  it("should handle undefined headers", () => {
    const headers1 = new Headers({ "Content-Type": "application/json" });
    const result = joinHeaders(headers1, undefined);

    expect(result.get("Content-Type")).toBe("application/json");
  });

  it("should handle empty headers", () => {
    const result = joinHeaders();

    expect(result.keys().next().done).toBe(true);
  });

  it("should append values for the same header key", () => {
    const headers1 = new Headers({ "X-Custom-Header": "value1" });
    const headers2 = new Headers({ "X-Custom-Header": "value2" });
    const result = joinHeaders(headers1, headers2);

    expect(result.get("X-Custom-Header")).toEqual("value1, value2");
  });

  it("should handle all types of headers", () => {
    const headers1 = new Headers({ "Content-Type": "application/json" });
    const headers2 = { Authorization: "Bearer token" };
    const headers3 = [
      ["X-Custom-Header", "value1"],
      ["X-Custom-Header", "value2"],
    ] as [string, string][];

    const result = joinHeaders(headers1, headers2, headers3);

    expect(result.get("Content-Type")).toBe("application/json");
    expect(result.get("Authorization")).toBe("Bearer token");
    expect(result.get("X-Custom-Header")).toEqual("value1, value2");
  });
});
