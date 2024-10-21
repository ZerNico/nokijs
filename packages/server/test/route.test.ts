import { object, string } from "valibot";
import { describe, expect, it, vi } from "vitest";
import { Route } from "../src/route";

describe("Route", () => {
  it("should create a route", () => {
    const route = new Route({
      method: "GET",
      path: "/test",
      handlers: [],
      fn: () => new Response(),
    });

    expect(route).toBeInstanceOf(Route);
    expect(route.method).toBe("GET");
    expect(route.path).toBe("/test");
  });

  describe("handleRequest", () => {
    it("should handle a request", async () => {
      const mockFn = vi.fn(() => new Response("test"));
      const route = new Route({
        method: "GET",
        path: "/test",
        handlers: [],
        fn: mockFn,
      });

      const request = new Request("http://localhost/test", {
        method: "GET",
      });
      const response = await route.handleRequest(request, {});

      expect(mockFn).toHaveBeenCalledWith(
        expect.objectContaining({ raw: expect.any(Request) }),
      );
      expect(response).toBeInstanceOf(Response);
      expect(await (response as Response).text()).toBe("test");
    });

    it("should use the passed params", async () => {
      const mockFn = vi.fn(() => new Response("test"));
      const route = new Route({
        method: "GET",
        path: "/test",
        handlers: [],
        fn: mockFn,
      });

      const request = new Request("http://localhost/test", {
        method: "GET",
      });
      const response = await route.handleRequest(request, { foo: "bar" });

      expect(mockFn).toHaveBeenCalledWith(
        expect.objectContaining({ params: { foo: "bar" } }),
      );
    });

    describe("derive handler", () => {
      it("should derive context", async () => {
        const mockFn = vi.fn(() => new Response());
        const route = new Route({
          method: "GET",
          path: "/test",
          handlers: [{ type: "derive", fn: () => ({ foo: "bar" }) }],
          fn: mockFn,
        });

        const request = new Request("http://localhost/test", {
          method: "GET",
        });
        await route.handleRequest(request, {});

        expect(mockFn).toHaveBeenCalledWith(
          expect.objectContaining({ foo: "bar" }),
        );
      });

      it("should derive context from an async function", async () => {
        const mockFn = vi.fn(() => new Response());
        const route = new Route({
          method: "GET",
          path: "/test",
          handlers: [{ type: "derive", fn: async () => ({ foo: "bar" }) }],
          fn: mockFn,
        });

        const request = new Request("http://localhost/test", {
          method: "GET",
        });
        await route.handleRequest(request, {});

        expect(mockFn).toHaveBeenCalledWith(
          expect.objectContaining({ foo: "bar" }),
        );
      });

      it("handle void return", async () => {
        const mockFn = vi.fn(() => new Response());
        const route = new Route({
          method: "GET",
          path: "/test",
          handlers: [{ type: "derive", fn: () => {} }],
          fn: mockFn,
        });

        const request = new Request("http://localhost/test", {
          method: "GET",
        });
        await route.handleRequest(request, {});

        expect(mockFn).toHaveBeenCalledWith(
          expect.objectContaining({ raw: expect.any(Request) }),
        );
      });

      it("overwrites existing context properties", async () => {
        const mockFn = vi.fn(() => new Response());
        const route = new Route({
          method: "GET",
          path: "/test",
          handlers: [
            { type: "derive", fn: () => ({ foo: "bar" }) },
            { type: "derive", fn: () => ({ foo: "baz" }) },
          ],
          fn: mockFn,
        });

        const request = new Request("http://localhost/test", {
          method: "GET",
        });
        await route.handleRequest(request, {});

        expect(mockFn).toHaveBeenCalledWith(
          expect.objectContaining({ foo: "baz" }),
        );
      });

      it("it keeps existing context properties", async () => {
        const mockFn = vi.fn(() => new Response());
        const route = new Route({
          method: "GET",
          path: "/test",
          handlers: [
            { type: "derive", fn: () => ({ foo: "bar" }) },
            { type: "derive", fn: () => ({ baz: "baz" }) },
          ],
          fn: mockFn,
        });

        const request = new Request("http://localhost/test", {
          method: "GET",
        });
        await route.handleRequest(request, {});

        expect(mockFn).toHaveBeenCalledWith(
          expect.objectContaining({ foo: "bar", baz: "baz" }),
        );
      });
    });

    describe("before handler", () => {
      it("should return a response", async () => {
        const mockFn = vi.fn(() => new Response());
        const route = new Route({
          method: "GET",
          path: "/test",
          handlers: [
            {
              type: "before",
              fn: () => new Response("test"),
            },
          ],
          fn: mockFn,
        });

        const request = new Request("http://localhost/test", {
          method: "GET",
        });
        const response = await route.handleRequest(request, {});

        expect(response).toBeInstanceOf(Response);

        const text = await (response as Response).text();
        expect(text).toBe("test");
        expect(mockFn).not.toHaveBeenCalled();
      });

      it("should continue if no response is returned", async () => {
        const mockFn = vi.fn(() => new Response());
        const route = new Route({
          method: "GET",
          path: "/test",
          handlers: [
            {
              type: "before",
              fn: () => {},
            },
          ],
          fn: mockFn,
        });

        const request = new Request("http://localhost/test", {
          method: "GET",
        });
        await route.handleRequest(request, {});

        expect(mockFn).toHaveBeenCalled();
      });
    });

    describe("validate handler", () => {
      describe("body", () => {
        it("should validate the body", async () => {
          const mockFn = vi.fn(() => new Response());
          const route = new Route({
            method: "POST",
            path: "/test",
            handlers: [
              {
                type: "validate",
                key: "body",
                schema: object({ test: string() }),
              },
            ],
            fn: mockFn,
          });

          const request = new Request("http://localhost/test", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ test: "foo" }),
          });

          await route.handleRequest(request, {});

          expect(mockFn).toHaveBeenCalledWith(
            expect.objectContaining({ body: { test: "foo" } }),
          );
        });
      });

      describe("query", () => {
        it("should validate the query", async () => {
          const mockFn = vi.fn(() => new Response());
          const route = new Route({
            method: "GET",
            path: "/test",
            handlers: [
              {
                type: "validate",
                key: "query",
                schema: object({ test: string() }),
              },
            ],
            fn: mockFn,
          });

          const request = new Request("http://localhost/test?test=foo", {
            method: "GET",
          });

          await route.handleRequest(request, {});

          expect(mockFn).toHaveBeenCalledWith(
            expect.objectContaining({ query: { test: "foo" } }),
          );
        });

        it("should return an error response if the query is invalid", async () => {
          const mockFn = vi.fn(() => new Response());
          const route = new Route({
            method: "GET",
            path: "/test",
            handlers: [
              {
                type: "validate",
                key: "query",
                schema: object({ abc: string() }),
              },
            ],
            fn: mockFn,
          });

          const request = new Request("http://localhost/test?test=123", {
            method: "GET",
          });

          const response = await route.handleRequest(request, {});

          expect(response).toBeInstanceOf(Response);
          expect(response.status).toBe(500);
        });
      });
    });

    describe("error handler", () => {
      it("should use the default error handler when no error handler is provided", async () => {
        const route = new Route({
          method: "GET",
          path: "/test",
          handlers: [],
          fn: () => {
            throw new Error("test");
          },
        });

        const request = new Request("http://localhost/test", {
          method: "GET",
        });

        const response = await route.handleRequest(request, {});

        expect(response).toBeInstanceOf(Response);
        expect(response.status).toBe(500);
      });

      it("should use the provided error handler", async () => {
        const error = new Error("test");
        const mockFn = vi.fn(() => new Response());
        const route = new Route({
          method: "GET",
          path: "/test",
          handlers: [],
          fn: () => {
            throw error;
          },
          errorHandler: mockFn,
        });

        const request = new Request("http://localhost/test", {
          method: "GET",
        });

        await route.handleRequest(request, {});

        expect(mockFn).toHaveBeenCalledWith(
          error,
          expect.objectContaining({ raw: expect.any(Request) }),
        );
      });

      it("handles a non error thrown", async () => {
        const route = new Route({
          method: "GET",
          path: "/test",
          handlers: [],
          fn: () => {
            throw "test";
          },
        });

        const request = new Request("http://localhost/test", {
          method: "GET",
        });

        const response = await route.handleRequest(request, {});

        expect(response).toBeInstanceOf(Response);
        expect(response.status).toBe(500);
        expect(await (response as Response).text()).toBe(
          "An unknown error occurred",
        );
      });
    });
  });
});
