import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { Route } from "../../src/route";
import type { SomeResponse } from "../../src/types";
import { groupRoutes } from "../../src/utils/routes";

describe("groupRoutes", () => {
  const mockRoutes = [
    new Route({ path: "/route1", method: "GET", fn: vi.fn(), handlers: [] }),
    new Route({ path: "/route2", method: "POST", fn: vi.fn(), handlers: [] }),
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
    expectTypeOf(result[0]).toMatchTypeOf<
      Route<"GET", "/prefix/route1", SomeResponse, any>
    >();

    expect(result[1].path).toBe("/prefix/route2");
    expect(result[1].method).toBe("POST");
    expect(result[1].fn).toBe(mockRoutes[1].fn);
    expect(result[1].handlers).toBe(mockRoutes[1].handlers);
    expectTypeOf(result[1]).toMatchTypeOf<
      Route<"POST", "/prefix/route2", SomeResponse, any>
    >();
  });
});
