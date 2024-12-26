import { describe, expect, it } from "vitest";
import { createContextFromRequest } from "../src/context";
import { ResponseBuilder } from "../src/response";

describe("createContextFromRequest", () => {
  it("should create a context with a cloned request", () => {
    const mockRequest = new Request("http://example.com");
    const context = createContextFromRequest(mockRequest);

    expect(context.raw).toBeInstanceOf(Request);
    expect(context.raw).not.toBe(mockRequest);
    expect(context.raw.url).toBe(mockRequest.url);
  });

  it("should create a context with a response builder", () => {
    const mockRequest = new Request("http://example.com");
    const context = createContextFromRequest(mockRequest);

    expect(context.res).toBeInstanceOf(ResponseBuilder);
  });

  it("should create a context with a query object", () => {
    const mockRequest = new Request("http://example.com?foo=bar");
    const context = createContextFromRequest(mockRequest);

    expect(context.query).toEqual({ foo: "bar" });
  });

  it("should create a context with a headers object", () => {
    const mockRequest = new Request("http://example.com");
    mockRequest.headers.set("foo", "bar");

    const context = createContextFromRequest(mockRequest);

    expect(context.headers).toEqual({ foo: "bar" });
  });
});
