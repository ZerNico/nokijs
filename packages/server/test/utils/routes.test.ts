import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { Route } from "../../src/route";
import type { SomeResponse } from "../../src/types";
import { groupRoutes } from "../../src/utils/routes";

describe("groupRoutes", () => {
  const createRoute = <TPath extends string, TMethod extends string>(
    path: TPath,
    method: TMethod,
  ) => new Route({ path, method, fn: vi.fn(), handlers: [] });

  const mockRoutes = [
    createRoute("/route1", "GET"),
    createRoute("/route2", "POST"),
  ] as const;

  it("should returns as is if no prefix is provided", () => {
    const result = groupRoutes(mockRoutes);
    expect(result).toEqual(mockRoutes);
  });

  it("should prefix all routes with the provided prefix", () => {
    const result = groupRoutes(mockRoutes, { prefix: "/prefix" });

    expect(result[0].path).toBe("/prefix/route1");
    expect(result[0].method).toBe("GET");
    expect(result[0].fn).toBe(mockRoutes[0].fn);
    expect(result[0].handlers).toBe(mockRoutes[0].handlers);
    expect(result[0].errorHandler).toBe(mockRoutes[0].errorHandler);
    expectTypeOf(result[0]).toMatchTypeOf<
      Route<"GET", "/prefix/route1", SomeResponse, any>
    >();

    expect(result[1].path).toBe("/prefix/route2");
    expect(result[1].method).toBe("POST");
    expect(result[1].fn).toBe(mockRoutes[1].fn);
    expect(result[1].handlers).toBe(mockRoutes[1].handlers);
    expect(result[1].errorHandler).toBe(mockRoutes[1].errorHandler);
    expectTypeOf(result[1]).toMatchTypeOf<
      Route<"POST", "/prefix/route2", SomeResponse, any>
    >();
  });

  it("should properly handle a trailing slash prefix", () => {
    const routes = [
      createRoute("/", "GET"),
      createRoute("/route", "GET"),
      createRoute("/route/", "GET"),
      createRoute("route/", "GET"),
      createRoute("route", "GET"),
      createRoute("", "GET"),
    ] as const;

    const result = groupRoutes(routes, { prefix: "/prefix/" });

    expect(result[0].path).toBe("/prefix/");
    expectTypeOf(result[0].path).toEqualTypeOf<"/prefix/">();
    expect(result[1].path).toBe("/prefix/route");
    expectTypeOf(result[1].path).toEqualTypeOf<"/prefix/route">();
    expect(result[2].path).toBe("/prefix/route/");
    expectTypeOf(result[2].path).toEqualTypeOf<"/prefix/route/">();
    expect(result[3].path).toBe("/prefix/route/");
    expectTypeOf(result[3].path).toEqualTypeOf<"/prefix/route/">();
    expect(result[4].path).toBe("/prefix/route");
    expectTypeOf(result[4].path).toEqualTypeOf<"/prefix/route">();
    expect(result[5].path).toBe("/prefix/");
    expectTypeOf(result[5].path).toEqualTypeOf<"/prefix/">();
  });

  it("should properly handle a prefix without a trailing slash", () => {
    const routes = [
      createRoute("/", "GET"),
      createRoute("/route", "POST"),
      createRoute("/route/", "GET"),
      createRoute("route/", "GET"),
      createRoute("route", "GET"),
      createRoute("", "GET"),
    ] as const;

    const result = groupRoutes(routes, { prefix: "/prefix" });

    expect(result[0].path).toBe("/prefix");
    expectTypeOf(result[0].path).toEqualTypeOf<"/prefix">();
    expect(result[1].path).toBe("/prefix/route");
    expectTypeOf(result[1].path).toEqualTypeOf<"/prefix/route">();
    expect(result[2].path).toBe("/prefix/route/");
    expectTypeOf(result[2].path).toEqualTypeOf<"/prefix/route/">();
    expect(result[3].path).toBe("/prefix/route/");
    expectTypeOf(result[3].path).toEqualTypeOf<"/prefix/route/">();
    expect(result[4].path).toBe("/prefix/route");
    expectTypeOf(result[4].path).toEqualTypeOf<"/prefix/route">();
    expect(result[5].path).toBe("/prefix");
    expectTypeOf(result[5].path).toEqualTypeOf<"/prefix">();
  });

  it("should properly handle a prefix without slash", () => {
    const routes = [
      createRoute("/", "GET"),
      createRoute("/route", "POST"),
      createRoute("/route/", "GET"),
      createRoute("route/", "GET"),
      createRoute("route", "GET"),
      createRoute("", "GET"),
    ] as const;

    const result = groupRoutes(routes, { prefix: "prefix" });

    expect(result[0].path).toBe("prefix");
    expectTypeOf(result[0].path).toEqualTypeOf<"prefix">();
    expect(result[1].path).toBe("prefix/route");
    expectTypeOf(result[1].path).toEqualTypeOf<"prefix/route">();
    expect(result[2].path).toBe("prefix/route/");
    expectTypeOf(result[2].path).toEqualTypeOf<"prefix/route/">();
    expect(result[3].path).toBe("prefix/route/");
    expectTypeOf(result[3].path).toEqualTypeOf<"prefix/route/">();
    expect(result[4].path).toBe("prefix/route");
    expectTypeOf(result[4].path).toEqualTypeOf<"prefix/route">();
    expect(result[5].path).toBe("prefix");
    expectTypeOf(result[5].path).toEqualTypeOf<"prefix">();
  });
});
