import { describe, expect, it, vi } from "vitest";
import { Route } from "../route";
import type { AnyRoute } from "../types";
import { groupRoutes } from "./routes";

describe("groupRoutes", () => {
  const mockRoutes: AnyRoute[] = [
    new Route({ path: "/route1", method: "GET", fn: vi.fn(), handler: [] }),
    new Route({ path: "/route2", method: "POST", fn: vi.fn(), handler: [] }),
  ];

  it("should return the same routes if no prefix is provided", () => {
    const result = groupRoutes(mockRoutes);
    expect(result).toEqual(mockRoutes);
  });

  it("should prefix routes correctly when a prefix is provided", () => {
    const result = groupRoutes(mockRoutes, { prefix: "/api" });

    for (let i = 0; i < mockRoutes.length; i++) {
      const expectedPath = `/api${mockRoutes[i]!.path}` as any;
      expect(result[i]!.path).toEqual(expectedPath);
    }
  });

  it("should copy all opts from the original routes", () => {
    const result = groupRoutes(mockRoutes, { prefix: "/api" });

    expect(result[0]!.method).toEqual(mockRoutes[0]!.method);
    expect(result[0]!.fn).toEqual(mockRoutes[0]!.fn);
    expect(result[0]!.handler).toEqual(mockRoutes[0]!.handler);
    expect(result[0]!.validationSchemas).toEqual(mockRoutes[0]!.validationSchemas);
    expect(result[0]!.errorHandler).toEqual(mockRoutes[0]!.errorHandler);
  });
});
