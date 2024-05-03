import * as v from "valibot";
import { describe, expect, it, vi } from "vitest";
import { RouteBuilder } from "./route-builder";

describe("RouteBuilder", () => {
  it("should allow creating a route builder without options", () => {
    const routeBuilder = new RouteBuilder();
    expect(routeBuilder).toBeInstanceOf(RouteBuilder);
  });

  it("should allow adding a derive handler", () => {
    const deriveFn = vi.fn();
    const routeBuilder = new RouteBuilder().derive(deriveFn);

    expect(routeBuilder.opts?.handler?.[0]).toEqual({ type: "derive", fn: deriveFn });
  });

  describe("body", () => {
    it("should add a body validation handler", () => {
      const schema = v.string();
      const routeBuilder = new RouteBuilder().body(schema);

      expect(routeBuilder.opts?.handler?.[0]).toEqual({ type: "validate", key: "body" });
      expect(routeBuilder.opts?.validationSchemas?.body).toBe(schema);
    });

    it("should replace an existing body validation handler", () => {
      const schema = v.string();
      const replacedSchema = v.number();
      const routeBuilder = new RouteBuilder().body(replacedSchema).body(schema);

      expect(routeBuilder).toBeInstanceOf(RouteBuilder);
      expect(routeBuilder.opts?.handler?.[0]).toEqual({ type: "validate", key: "body" });
      expect(routeBuilder.opts?.validationSchemas?.body).toBe(schema);
      expect(routeBuilder.opts?.validationSchemas?.body).not.toBe(replacedSchema);
    });
  });

  describe("query", () => {
    it("should add a query validation handler", () => {
      const schema = v.string();
      const routeBuilder = new RouteBuilder().query(schema);

      expect(routeBuilder.opts?.handler?.[0]).toEqual({ type: "validate", key: "query" });
      expect(routeBuilder.opts?.validationSchemas?.query).toBe(schema);
    });

    it("should replace an existing query validation handler", () => {
      const schema = v.string();
      const replacedSchema = v.number();
      const routeBuilder = new RouteBuilder().query(replacedSchema).query(schema);

      expect(routeBuilder).toBeInstanceOf(RouteBuilder);
      expect(routeBuilder.opts?.handler?.[0]).toEqual({ type: "validate", key: "query" });
      expect(routeBuilder.opts?.validationSchemas?.query).toBe(schema);
      expect(routeBuilder.opts?.validationSchemas?.query).not.toBe(replacedSchema);
    });
  });

  describe("error", () => {
    it("should add an error handler", () => {
      const errorHandler = vi.fn();
      const routeBuilder = new RouteBuilder().error(errorHandler);

      expect(routeBuilder.opts?.errorHandler).toBe(errorHandler);
    });

    it("should replace an existing error handler", () => {
      const errorHandler = vi.fn();
      const replacedErrorHandler = vi.fn();
      const routeBuilder = new RouteBuilder().error(replacedErrorHandler).error(errorHandler);

      expect(routeBuilder.opts?.errorHandler).toBe(errorHandler);
      expect(routeBuilder.opts?.errorHandler).not.toBe(replacedErrorHandler);
    });
  });

  it("should add a before handler", () => {
    const beforeFn = vi.fn();
    const routeBuilder = new RouteBuilder().before(beforeFn);

    expect(routeBuilder.opts?.handler?.[0]).toEqual({ type: "before", fn: beforeFn });
  });

  it("should add an after handler", () => {
    const afterFn = vi.fn();
    const routeBuilder = new RouteBuilder().after(afterFn);

    expect(routeBuilder.opts?.handler?.[0]).toEqual({ type: "after", fn: afterFn });
  });

  it("should create a GET route", () => {
    const fn = vi.fn();
    const route = new RouteBuilder().get("/path", fn);

    expect(route.method).toBe("GET");
    expect(route.path).toBe("/path");
    expect(route.fn).toBe(fn);
  });

  it("should create a POST route", () => {
    const fn = vi.fn();
    const route = new RouteBuilder().post("/path", fn);

    expect(route.method).toBe("POST");
    expect(route.path).toBe("/path");
    expect(route.fn).toBe(fn);
  });

  it("should create a PUT route", () => {
    const fn = vi.fn();
    const route = new RouteBuilder().put("/path", fn);

    expect(route.method).toBe("PUT");
    expect(route.path).toBe("/path");
    expect(route.fn).toBe(fn);
  });

  it("should create a HEAD route", () => {
    const fn = vi.fn();
    const route = new RouteBuilder().head("/path", fn);

    expect(route.method).toBe("HEAD");
    expect(route.path).toBe("/path");
    expect(route.fn).toBe(fn);
  });

  it("should create a DELETE route", () => {
    const fn = vi.fn();
    const route = new RouteBuilder().delete("/path", fn);

    expect(route.method).toBe("DELETE");
    expect(route.path).toBe("/path");
    expect(route.fn).toBe(fn);
  });

  it("should create a OPTIONS route", () => {
    const fn = vi.fn();
    const route = new RouteBuilder().options("/path", fn);

    expect(route.method).toBe("OPTIONS");
    expect(route.path).toBe("/path");
    expect(route.fn).toBe(fn);
  });

  describe("handle", () => {
    it("should return a route with the given method and path", () => {
      const fn = vi.fn().mockResolvedValue(new Response("OK"));
      const route = new RouteBuilder().handle("GET", "/path", fn);

      expect(route.method).toBe("GET");
      expect(route.path).toBe("/path");
      expect(route.fn).toBe(fn);
    });

    it("should path handlers and validation schemas to the route", () => {
      const fn = vi.fn().mockResolvedValue(new Response("OK"));
      const schema = v.string();
      const route = new RouteBuilder().body(schema).handle("GET", "/path", fn);

      expect(route.handler?.[0]).toEqual({ type: "validate", key: "body" });
      expect(route.validationSchemas).toEqual({ body: schema, query: undefined });
    });
  });
});
