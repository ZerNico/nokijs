import { describe, expect, it, vi } from "vitest";
import { ResponseBuilder } from "../response";
import { buildContext } from "./context";

describe("buildContext", () => {
  it("should return an object with cookies and headers", () => {
    const request = new Request("https://localhost:3000", {
      headers: new Headers({
        cookie: "key1=value1; key2=value2",
        "other-header": "value",
      }),
    });

    const context = buildContext(request);

    expect(context.cookies).toEqual({
      key1: "value1",
      key2: "value2",
    });
    expect(context.headers).toEqual({
      cookie: "key1=value1; key2=value2",
      "other-header": "value",
    });
  });

  it("should handle missing cookie header gracefully", () => {
    const request = new Request("https://localhost:3000", {
      headers: new Headers({
        "other-header": "value",
      }),
    });

    const context = buildContext(request);

    expect(context.cookies).toEqual({});
    expect(context.headers).toEqual({
      "other-header": "value",
    });
  });

  it("should include a response builder", () => {
    const request = new Request("https://localhost:3000");

    const context = buildContext(request);

    expect(context.res).toBeInstanceOf(ResponseBuilder);
  });

  it("should include the query", () => {
    const request = new Request("https://localhost:3000?foo=bar");

    const context = buildContext(request);

    expect(context.query).toEqual({ foo: "bar" });
  });

  it("should include a clone of the request", () => {
    const request = new Request("https://localhost:3000");

    const context = buildContext(request);

    expect(context.raw).toBeInstanceOf(Request);
    expect(context.raw).not.toBe(request);
  });
});
