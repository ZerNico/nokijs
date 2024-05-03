import * as v from "valibot";
import { describe, expect, it, vi } from "vitest";
import { Route } from "./route";

describe("Route", () => {
  it("should create a route", () => {
    const route = new Route({
      method: "GET",
      path: "/",
      fn: () => Promise.resolve(new Response("Hello, World!")),
    });

    expect(route.method).toBe("GET");
    expect(route.path).toBe("/");
  });

  it("should handle a route", async () => {
    const mockFn = vi.fn(() => Promise.resolve(new Response("Hello, World!")));

    const route = new Route({
      method: "GET",
      path: "/",
      fn: mockFn,
    });

    const response = (await route.handle(new Request("https://localhost:3000", { method: "GET" }), {})) as Response;

    expect(response.status).toBe(200);
    expect(mockFn).toHaveBeenCalled();
  });

  it("handles derive handlers", async () => {
    const mockFn = vi.fn(() => Promise.resolve(new Response("Hello, World!")));

    const route = new Route({
      method: "GET",
      path: "/",
      fn: mockFn,
      handler: [
        {
          type: "derive",
          fn: () => ({ foo: "bar" }),
        },
      ],
    });

    await route.handle(new Request("https://localhost:3000", { method: "GET" }), {});
    expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ foo: "bar" }));
  });

  it("handles before handlers", async () => {
    const mockFn = vi.fn(() => Promise.resolve(new Response("Hello, World!")));

    const route = new Route({
      method: "GET",
      path: "/",
      fn: mockFn,
      handler: [
        {
          type: "before",
          fn: () => new Response("Hello, World!"),
        },
      ],
    });

    const response = (await route.handle(new Request("https://localhost:3000", { method: "GET" }), {})) as Response;
    expect(mockFn).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.text()).resolves.toBe("Hello, World!");
  });

  it("handles after handlers", async () => {
    const mockFn = vi.fn(() => Promise.resolve(new Response("Hello, World!")));

    const route = new Route({
      method: "GET",
      path: "/",
      fn: mockFn,
      handler: [
        {
          type: "after",
          fn: (response) => new Response(response.body, { status: 201 }),
        },
      ],
    });

    const response = (await route.handle(new Request("https://localhost:3000", { method: "GET" }), {})) as Response;
    expect(response.status).toBe(201);
    expect(response.text()).resolves.toBe("Hello, World!");
  });

  it("handles validate handlers for json body", async () => {
    const mockFn = vi.fn(() => Promise.resolve(new Response("Hello, World!")));

    const route = new Route({
      method: "GET",
      path: "/",
      fn: mockFn,
      handler: [
        {
          type: "validate",
          key: "body",
        },
      ],
      validationSchemas: {
        body: v.object({
          foo: v.string(),
        }),
      },
    });

    const response = (await route.handle(
      new Request("https://localhost:3000", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ foo: "bar" }),
      }),
      {},
    )) as Response;

    expect(response.status).toBe(200);
    expect(mockFn).toHaveBeenCalled();
  });

  it("handles wrong json body on validate handlers", async () => {
    const mockFn = vi.fn(() => Promise.resolve(new Response("Hello, World!")));

    const route = new Route({
      method: "GET",
      path: "/",
      fn: mockFn,
      handler: [
        {
          type: "validate",
          key: "body",
        },
      ],
      validationSchemas: {
        body: v.object({
          foo: v.number(),
        }),
      },
    });

    const response = (await route.handle(
      new Request("https://localhost:3000", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ bar: "foo" }),
      }),
      {},
    )) as Response;

    expect(response.text()).resolves.toBe("Invalid type: Expected number but received undefined");
  });

  it("handles validate handlers for text body", async () => {
    const mockFn = vi.fn(() => Promise.resolve(new Response("Hello, World!")));

    const route = new Route({
      method: "GET",
      path: "/",
      fn: mockFn,
      handler: [
        {
          type: "validate",
          key: "body",
        },
      ],
      validationSchemas: {
        body: v.string(),
      },
    });

    const response = (await route.handle(
      new Request("https://localhost:3000", {
        method: "POST",
        headers: {
          "content-type": "text/plain",
        },
        body: "Hello, World!",
      }),
      {},
    )) as Response;

    expect(response.status).toBe(200);
    expect(mockFn).toHaveBeenCalled();
  });

  it("handles wrong text body on validate handlers", async () => {
    const mockFn = vi.fn(() => Promise.resolve(new Response("Hello, World!")));

    const route = new Route({
      method: "GET",
      path: "/",
      fn: mockFn,
      handler: [
        {
          type: "validate",
          key: "body",
        },
      ],
      validationSchemas: {
        body: v.string([v.maxLength(1)]),
      },
    });

    const response = (await route.handle(
      new Request("https://localhost:3000", {
        method: "POST",
        headers: {
          "content-type": "text/plain",
        },
        body: "123",
      }),
      {},
    )) as Response;

    expect(response.text()).resolves.toBe("Invalid length: Expected <=1 but received 3");
  });

  it("handles validate handlers for form urlencoded data body", async () => {
    const mockFn = vi.fn(() => Promise.resolve(new Response("Hello, World!")));

    const route = new Route({
      method: "GET",
      path: "/",
      fn: mockFn,
      handler: [
        {
          type: "validate",
          key: "body",
        },
      ],
      validationSchemas: {
        body: v.object({
          foo: v.string(),
        }),
      },
    });

    const response = (await route.handle(
      new Request("https://localhost:3000", {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
        body: "foo=bar",
      }),
      {},
    )) as Response;

    expect(response.status).toBe(200);
    expect(mockFn).toHaveBeenCalled();
  });

  it("handles wrong form urlencoded data body on validate handlers", async () => {
    const mockFn = vi.fn(() => Promise.resolve(new Response("Hello, World!")));

    const route = new Route({
      method: "GET",
      path: "/",
      fn: mockFn,
      handler: [
        {
          type: "validate",
          key: "body",
        },
      ],
      validationSchemas: {
        body: v.object({
          foo: v.number(),
        }),
      },
    });

    const response = (await route.handle(
      new Request("https://localhost:3000", {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
        body: "foo=bar",
      }),
      {},
    )) as Response;

    expect(response.text()).resolves.toBe('Invalid type: Expected number but received "bar"');
  });

  it("handles validate handlers for multipart form-data body", async () => {
    const mockFn = vi.fn(() => Promise.resolve(new Response("Hello, World!")));

    const route = new Route({
      method: "GET",
      path: "/",
      fn: mockFn,
      handler: [
        {
          type: "validate",
          key: "body",
        },
      ],
      validationSchemas: {
        body: v.object({
          foo: v.string(),
        }),
      },
    });

    const formData = new FormData();
    formData.append("foo", "bar");

    const response = (await route.handle(
      new Request("https://localhost:3000", {
        method: "POST",
        body: formData,
      }),
      {},
    )) as Response;

    expect(response.status).toBe(200);
    expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ body: { foo: "bar" } }));
  });

  it("handles wrong multipart form-data body on validate handlers", async () => {
    const mockFn = vi.fn(() => Promise.resolve(new Response("Hello, World!")));

    const route = new Route({
      method: "GET",
      path: "/",
      fn: mockFn,
      handler: [
        {
          type: "validate",
          key: "body",
        },
      ],
      validationSchemas: {
        body: v.object({
          foo: v.number(),
        }),
      },
    });

    const formData = new FormData();
    formData.append("foo", "bar");

    const response = (await route.handle(
      new Request("https://localhost:3000", {
        method: "POST",
        body: formData,
      }),
      {},
    )) as Response;

    expect(response.text()).resolves.toBe('Invalid type: Expected number but received "bar"');
  });

  it("handles validate handlers for query", async () => {
    const mockFn = vi.fn(() => Promise.resolve(new Response("Hello, World!")));

    const route = new Route({
      method: "GET",
      path: "/",
      fn: mockFn,
      handler: [
        {
          type: "validate",
          key: "query",
        },
      ],
      validationSchemas: {
        query: v.object({
          foo: v.string(),
        }),
      },
    });

    const response = (await route.handle(
      new Request("https://localhost:3000?foo=bar", { method: "GET" }),
      {},
    )) as Response;

    expect(response.status).toBe(200);
    expect(mockFn).toHaveBeenCalled();
  });

  it("handles wrong query on validate handlers", async () => {
    const mockFn = vi.fn(() => Promise.resolve(new Response("Hello, World!")));

    const route = new Route({
      method: "GET",
      path: "/",
      fn: mockFn,
      handler: [
        {
          type: "validate",
          key: "query",
        },
      ],
      validationSchemas: {
        query: v.object({
          foo: v.number(),
        }),
      },
    });

    const response = (await route.handle(
      new Request("https://localhost:3000?foo=bar", { method: "GET" }),
      {},
    )) as Response;

    expect(response.text()).resolves.toBe('Invalid type: Expected number but received "bar"');
  });

  it("should handle errors with the default error handler", async () => {
    const route = new Route({
      method: "GET",
      path: "/",
      fn: () => {
        throw new Error("An error occurred");
      },
    });

    const response = (await route.handle(new Request("https://localhost:3000", { method: "GET" }), {})) as Response;

    expect(response.status).toBe(500);
    expect(response.text()).resolves.toBe("An error occurred");
  });

  it("should use a custom error handler if provided", async () => {
    const route = new Route({
      method: "GET",
      path: "/",
      fn: () => {
        throw new Error("An error occurred");
      },
      errorHandler: (error) => new Response("Test", { status: 400 }),
    });

    const response = (await route.handle(new Request("https://localhost:3000", { method: "GET" }), {})) as Response;

    expect(response.status).toBe(400);
    expect(response.text()).resolves.toBe("Test");
  });
});
