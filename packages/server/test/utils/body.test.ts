import { describe, expect, it } from "vitest";
import { parseBody } from "../../src/utils/body";

describe("parseBody", () => {
  it("should return undefined if content-type is not present", async () => {
    const request = new Request("http://localhost/test");
    const result = await parseBody(request);
    expect(result).toBeUndefined();
  });

  it("should parse JSON body", async () => {
    const request = new Request("http://localhost/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ foo: "bar" }),
    });
    const result = await parseBody(request);
    expect(result).toEqual({ foo: "bar" });
  });

  it("should parse form-urlencoded body", async () => {
    const request = new Request("http://localhost/test", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ foo: "bar" }),
    });
    const result = await parseBody(request);
    expect(result).toEqual({ foo: "bar" });
  });

  it("should parse text/plain body", async () => {
    const request = new Request("http://localhost/test", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: "plain text",
    });
    const result = await parseBody(request);
    expect(result).toBe("plain text");
  });

  it("should return undefined for unsupported content-type", async () => {
    const request = new Request("http://localhost/test", {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: "<foo>bar</foo>",
    });
    const result = await parseBody(request);
    expect(result).toBeUndefined();
  });
});
