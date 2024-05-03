import { describe, expect, it, vi } from "vitest";
import { ResponseBuilder } from "../response";
import { buildOptions } from "./options";

describe("buildOptions", () => {
  it("should return an object with cookies and headers", () => {
    const request = new Request("https://localhost:3000", {
      headers: new Headers({
        cookie: "key1=value1; key2=value2",
        "other-header": "value",
      }),
    });

    const options = buildOptions(request);

    expect(options.cookies).toEqual({
      key1: "value1",
      key2: "value2",
    });
    expect(options.headers).toEqual({
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

    const options = buildOptions(request);

    expect(options.cookies).toEqual({});
    expect(options.headers).toEqual({
      "other-header": "value",
    });
  });

  it("should include a response builder", () => {
    const request = new Request("https://localhost:3000");

    const options = buildOptions(request);

    expect(options.res).toBeInstanceOf(ResponseBuilder);
  });

  it("should include the query", () => {
    const request = new Request("https://localhost:3000?foo=bar");

    const options = buildOptions(request);

    expect(options.query).toEqual({ foo: "bar" });
  });

  it("should include a clone of the request", () => {
    const request = new Request("https://localhost:3000");

    const options = buildOptions(request);

    expect(options.raw).toBeInstanceOf(Request);
    expect(options.raw).not.toBe(request);
  });
});
