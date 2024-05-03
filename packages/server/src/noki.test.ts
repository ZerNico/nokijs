import { describe, expect, it, vi } from "vitest";
import { Noki } from "./noki";
import { RouteBuilder } from "./route-builder";

describe("Noki", () => {
  it("should allow creating a Noki instance", () => {
    const noki = new Noki({ routes: [] });

    expect(noki).toBeInstanceOf(Noki);
  });

  it("should handle a request", async () => {
    const response = new Response("Hello, world!");
    const route = new RouteBuilder().get("/", () => response);
    const noki = new Noki({ routes: [route] });

    const request = new Request("http://localhost/");
    const result = await noki.fetch(request);

    expect(result).toBe(response);
  });

  it("should pass route params to the fn", async () => {
    const response = new Response("Hello, world!");
    const fn = vi.fn(() => response);
    const route = new RouteBuilder().get("/:name", fn);
    const noki = new Noki({ routes: [route] });

    const request = new Request("http://localhost/vi");
    await noki.fetch(request);

    expect(fn).toHaveBeenCalledWith(expect.objectContaining({ params: { name: "vi" } }));
  });

  it("should handle a 404", async () => {
    const noki = new Noki({ routes: [] });

    const request = new Request("http://localhost/");
    const result = await noki.fetch(request);

    expect(result.status).toBe(404);
  });

  it("should handle an unexpected error", async () => {
    const route = new RouteBuilder()
      .error(() => {
        throw new Error("Unexpected error");
      })
      .get("/", () => {
        throw new Error("Unexpected error");
      });

    const noki = new Noki({ routes: [route] });

    const request = new Request("http://localhost/");
    const result = await noki.fetch(request);

    expect(result.status).toBe(500);
  });
});
