import { describe, expect, expectTypeOf, it } from "vitest";
import { Noki, TypedResponse } from "../src";
import type { Route } from "../src/route";
import { RouteBuilder } from "../src/route-builder";
import type { SomeResponse, ValidationKeys } from "../src/types";

describe("Noki", () => {
  it("should allow creating a new Noki instance", () => {
    const noki = new Noki([]);
    expect(noki).toBeInstanceOf(Noki);
  });

  it("should allow creating a new Noki instance with routes", () => {
    const route = new RouteBuilder().handle(
      "GET",
      "/",
      () => new Response("Hello, World!"),
    );
    const noki = new Noki([route]);

    expectTypeOf(noki.routes).items.toMatchTypeOf<
      Route<"GET", "/", SomeResponse, Record<ValidationKeys, unknown>>
    >();
  });

  it("should handle a request", async () => {
    const route = new RouteBuilder().handle(
      "GET",
      "/test",
      () => new Response("Hello, World!"),
    );
    const noki = new Noki([route]);

    const response = await noki.fetch(new Request("http://localhost/test"));
    expect(await response.text()).toBe("Hello, World!");
  });

  it("should handle a request with a route that has a parameter", async () => {
    const route = new RouteBuilder().handle(
      "GET",
      "/test/:id",
      (request) => new Response(request.params.id),
    );
    const noki = new Noki([route]);

    const response = await noki.fetch(new Request("http://localhost/test/123"));
    expect(await response.text()).toBe("123");
  });

  it("should handle a request with a wildcard route", async () => {
    const route = new RouteBuilder().handle(
      "GET",
      "/test/*",
      (request) => new Response(request.params["*"]),
    );
    const noki = new Noki([route]);

    const response = await noki.fetch(new Request("http://localhost/test/123"));
    expect(await response.text()).toBe("123");
  });

  it("should handle a request with a route that has multiple parameters", async () => {
    const route = new RouteBuilder().handle(
      "GET",
      "/test/:id/:name",
      (request) => new Response(`${request.params.id} ${request.params.name}`),
    );
    const noki = new Noki([route]);

    const response = await noki.fetch(
      new Request("http://localhost/test/123/john"),
    );
    expect(await response.text()).toBe("123 john");
  });

  it("should handle when no route is found", async () => {
    const route = new RouteBuilder().handle(
      "GET",
      "/test",
      () => new Response("Hello, World!"),
    );
    const noki = new Noki([route]);

    const response = await noki.fetch(
      new Request("http://localhost/not-found"),
    );
    expect(response.status).toBe(404);
  });

  it("should convert a typed response to a response", async () => {
    const route = new RouteBuilder().handle(
      "GET",
      "/test",
      () => new TypedResponse("Hello, World!"),
    );
    const noki = new Noki([route]);

    const response = await noki.fetch(new Request("http://localhost/test"));
    expect(await response.text()).toBe("Hello, World!");
  });
});
