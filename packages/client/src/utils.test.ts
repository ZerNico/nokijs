import { describe, expect, it } from "vitest";
import { buildTypedResponse, detectRequestContentType } from "./utils";

describe("detectRequestContentType", () => {
  it("should return application/json when body is an object", () => {
    expect(detectRequestContentType({})).toBe("application/json");
  });

  it("should return text/plain when body is not an object", () => {
    expect(detectRequestContentType("")).toBe("text/plain");
  });

  it("should return text/plain when body is a number", () => {
    expect(detectRequestContentType(42)).toBe("text/plain");
  });

  it("should return application/json when body is a boolean", () => {
    expect(detectRequestContentType(true)).toBe("application/json");
  });

  it("should return text/plain when body is null", () => {
    expect(detectRequestContentType(null)).toBe("application/json");
  });

  it("should return text/plain when body is undefined", () => {
    expect(detectRequestContentType(undefined)).toBe("text/plain");
  });
});

describe("buildTypedResponse", () => {
  it("should return a TypedResponse with text body", async () => {
    const response = new Response("Hello, World!");
    const nokiResponse = await buildTypedResponse(response);
    expect(nokiResponse.data).toEqual("Hello, World!");
  });

  it("should return a TypedResponse with JSON body", async () => {
    const response = new Response('{"test": "Hello, World!"}', {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const nokiResponse = await buildTypedResponse(response);
    expect(nokiResponse.data).toEqual({ test: "Hello, World!" });
  });

  it("should return a TypedResponse with status code", async () => {
    const response = new Response("Hello, World!", { status: 201 });
    const nokiResponse = await buildTypedResponse(response);
    expect(nokiResponse.status).toEqual(201);
  });

  it("should return a TypedResponse with headers", async () => {
    const response = new Response("Hello, World!", {
      headers: { "Content-Type": "text/plain" },
    });
    const nokiResponse = await buildTypedResponse(response);
    expect(nokiResponse.headers.get("Content-Type")).toEqual("text/plain");
  });

  it("should return a TypedResponse with Response object", async () => {
    const response = new Response("Hello, World!");
    const nokiResponse = await buildTypedResponse(response);
    expect(nokiResponse.response).toEqual(response);
  });

  it("should parse text if no Content-Type header is present", async () => {
    const response = new Response("Hello, World!", {
      headers: { "Content-Type": "" },
    });
    const nokiResponse = await buildTypedResponse(response);
    expect(nokiResponse.data).toEqual("Hello, World!");
  });
});
