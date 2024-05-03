import { describe, expect, it } from "vitest";
import { parseBody } from "./body";

describe("parseBody", () => {
  it("should parse a JSON body", async () => {
    const request = new Request("https://localhost:3000", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ foo: "bar" }),
    });

    const body = await parseBody(request);

    expect(body).toEqual({ foo: "bar" });
  });

  it("should parse a text body", async () => {
    const request = new Request("https://localhost:3000", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "Hello, World!",
    });

    const body = await parseBody(request);

    expect(body).toBe("Hello, World!");
  });

  it("should parse a form body", async () => {
    const formData = new FormData();
    formData.append("foo", "bar");

    const request = new Request("https://localhost:3000", {
      method: "POST",
      body: formData,
    });

    const body = await parseBody(request);

    expect(body).toEqual({ foo: "bar" });
  });
});
