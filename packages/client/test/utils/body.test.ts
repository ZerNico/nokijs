import { describe, expect, it } from "vitest";
import {
  encodeBody,
  inferContentType,
  parseResponseBody,
} from "../../src/utils/body";

describe("parseResponseBody", () => {
  it("should parse JSON response", async () => {
    const response = new Response(JSON.stringify({ foo: "bar" }), {
      headers: { "content-type": "application/json" },
    });

    const data = await parseResponseBody(response);

    expect(data).toEqual({ foo: "bar" });
  });

  it("should parse text response", async () => {
    const response = new Response("Hello, World!", {
      headers: { "content-type": "text/plain" },
    });

    const data = await parseResponseBody(response);

    expect(data).toBe("Hello, World!");
  });

  it("should parse response without content type", async () => {
    const response = new Response("Hello, World!");

    const data = await parseResponseBody(response);

    expect(data).toBe("Hello, World!");
  });

  it("should parse response with unknown content type", async () => {
    const response = new Response("Hello, World!", {
      headers: { "content-type": "application/octet-stream" },
    });

    const data = await parseResponseBody(response);

    expect(data).toBe("Hello, World!");
  });
});

describe("inferContentType", () => {
  it("should infer content type for string", () => {
    const contentType = inferContentType("Hello, World!");

    expect(contentType).toBe("text/plain");
  });

  it("should infer content type for object", () => {
    const contentType = inferContentType({ foo: "bar" });

    expect(contentType).toBe("application/json");
  });

  it("should infer content type for null", () => {
    const contentType = inferContentType(null);

    expect(contentType).toBeUndefined();
  });
});

describe("encodeBody", () => {
  it("should return undefined for null body", () => {
    const encoded = encodeBody(null);
    expect(encoded).toBeUndefined();
  });

  it("should encode object to JSON string", () => {
    const body = { foo: "bar" };
    const encoded = encodeBody(body, "application/json");
    expect(encoded).toBe(JSON.stringify(body));
  });

  it("should return string as is for text/plain content type", () => {
    const body = "Hello, World!";
    const encoded = encodeBody(body, "text/plain");
    expect(encoded).toBe(body);
  });

  it("should return empty string for unknown content type", () => {
    const body = { foo: "bar" };
    const encoded = encodeBody(body, "application/octet-stream");
    expect(encoded).toBe("");
  });
});
