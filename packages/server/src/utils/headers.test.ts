import { describe, expect, it } from "vitest";
import { joinHeaders } from "./headers";

describe("joinHeaders", () => {
  it("should join headers", () => {
    const headers = joinHeaders(new Headers({ "content-type": "text/plain" }), new Headers({ "x-test": "test" }));

    expect(headers.get("content-type")).toBe("text/plain");
    expect(headers.get("x-test")).toBe("test");
  });

  it("should handle undefined headers", () => {
    const headers = joinHeaders(undefined, new Headers({ "x-test": "test" }));

    expect(headers.get("x-test")).toBe("test");
  });

  it("should handle all types of HeadersInit", () => {
    const headers = joinHeaders(new Headers({ "content-type": "text/plain" }), { "x-test": "test" }, [
      ["x-test-2", "test2"],
    ]);

    expect(headers.get("content-type")).toBe("text/plain");
    expect(headers.get("x-test")).toBe("test");
    expect(headers.get("x-test-2")).toBe("test2");
  });
});
