import { object, string } from "valibot";
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import type { BaseContext } from "../src/context.js";
import { Middleware } from "../src/middleware.js";
import { RouteBuilder } from "../src/route-builder.js";
import { Route } from "../src/route.js";
import type { BeforeHandler, SomeResponse } from "../src/types.js";

describe("RouteBuilder", () => {
  it("should allow creating a route builder without options", () => {
    const routeBuilder = new RouteBuilder();

    expect(routeBuilder).toBeInstanceOf(RouteBuilder);
    expectTypeOf(routeBuilder).toMatchTypeOf<RouteBuilder>();
  });

  describe("derive", () => {
    it("should allow deriving a new context", () => {
      const routeBuilder = new RouteBuilder();
      const derivedRouteBuilder = routeBuilder.derive(() => ({ foo: "bar" }));

      expect(derivedRouteBuilder).toBeInstanceOf(RouteBuilder);
      expectTypeOf(derivedRouteBuilder).toMatchTypeOf<
        RouteBuilder<{ foo: string } & BaseContext>
      >();
    });

    it("should override existing context properties", () => {
      const routeBuilder = new RouteBuilder();
      const derivedRouteBuilder = routeBuilder.derive(() => ({
        test: "test",
      }));

      expectTypeOf(derivedRouteBuilder).toMatchTypeOf<
        RouteBuilder<{ test: string } & BaseContext>
      >();

      const finalRouteBuilder = derivedRouteBuilder.derive(() => ({
        test: 1,
      }));
      expectTypeOf(finalRouteBuilder).toMatchTypeOf<
        RouteBuilder<{ test: number } & BaseContext>
      >();
      expectTypeOf(finalRouteBuilder).not.toMatchTypeOf<
        RouteBuilder<{ test: string } & BaseContext>
      >();
    });

    it("allows using an async function", () => {
      const routeBuilder = new RouteBuilder();
      const derivedRouteBuilder = routeBuilder.derive(async () => ({
        foo: "bar",
      }));

      expect(derivedRouteBuilder).toBeInstanceOf(RouteBuilder);
      expectTypeOf(derivedRouteBuilder).toMatchTypeOf<
        RouteBuilder<{ foo: string } & BaseContext>
      >();
    });

    it("should allow returning void", () => {
      const routeBuilder = new RouteBuilder();
      const derivedRouteBuilder = routeBuilder.derive(() => {});

      expect(derivedRouteBuilder).toBeInstanceOf(RouteBuilder);
      expectTypeOf(derivedRouteBuilder).toMatchTypeOf<
        RouteBuilder<BaseContext>
      >();
    });
  });

  describe("before", () => {
    type InferResponses<T> = T extends RouteBuilder<any, any, any, infer R>
      ? R
      : never;

    it("should allow adding a before handler", () => {
      const routeBuilder = new RouteBuilder();
      const beforeHandler = () => new Response();
      const beforeRouteBuilder = routeBuilder.before(beforeHandler);

      expect(beforeRouteBuilder.opts.handlers[0]?.type).toBe("before");
      expect((beforeRouteBuilder.opts.handlers[0] as BeforeHandler).fn).toBe(
        beforeHandler,
      );

      expect(beforeRouteBuilder).toBeInstanceOf(RouteBuilder);
      expectTypeOf<
        InferResponses<typeof beforeRouteBuilder>
      >().toMatchTypeOf<SomeResponse>();
    });

    it("should allow adding a before handler with a response", () => {
      const routeBuilder = new RouteBuilder();
      const beforeHandler = () => new Response();
      const beforeRouteBuilder = routeBuilder.before(beforeHandler);

      expect(beforeRouteBuilder.opts.handlers[0]?.type).toBe("before");
      expect((beforeRouteBuilder.opts.handlers[0] as BeforeHandler).fn).toBe(
        beforeHandler,
      );

      expect(beforeRouteBuilder).toBeInstanceOf(RouteBuilder);
      expectTypeOf<
        InferResponses<typeof beforeRouteBuilder>
      >().toMatchTypeOf<SomeResponse>();
    });

    it("should allow adding a before handler with a void return", () => {
      const routeBuilder = new RouteBuilder();
      const beforeHandler = () => {};
      const beforeRouteBuilder = routeBuilder.before(beforeHandler);

      expect(beforeRouteBuilder.opts.handlers[0]?.type).toBe("before");
      expect((beforeRouteBuilder.opts.handlers[0] as BeforeHandler).fn).toBe(
        beforeHandler,
      );

      expect(beforeRouteBuilder).toBeInstanceOf(RouteBuilder);
      expectTypeOf<
        InferResponses<typeof beforeRouteBuilder>
      >().toMatchTypeOf<never>();
    });
  });

  describe("body", () => {
    it("should allow validating the body", () => {
      const routeBuilder = new RouteBuilder();
      const schema = object({
        test: string(),
      });
      const bodyRouteBuilder = routeBuilder.body(schema);

      expect(bodyRouteBuilder.opts.handlers[0]?.type).toBe("validate");
      expect((bodyRouteBuilder.opts.handlers[0] as any).key).toBe("body");
      expect((bodyRouteBuilder.opts.handlers[0] as any).schema).toBe(schema);

      expect(bodyRouteBuilder).toBeInstanceOf(RouteBuilder);
      expectTypeOf(bodyRouteBuilder).toMatchTypeOf<
        RouteBuilder<{ body: { test: string } }, { body: { test: string } }>
      >();
    });

    it("should override existing body validation", () => {
      const routeBuilder = new RouteBuilder();
      const schema = object({
        test: string(),
      });
      const bodyRouteBuilder = routeBuilder.body(schema);

      expect((bodyRouteBuilder.opts.handlers[0] as any).schema).toBe(schema);
      expectTypeOf(bodyRouteBuilder).toMatchTypeOf<
        RouteBuilder<{ body: { test: string } }, { body: { test: string } }>
      >();

      const newSchema = object({
        foo: string(),
      });
      const finalRouteBuilder = bodyRouteBuilder.body(newSchema);

      expect((finalRouteBuilder.opts.handlers[0] as any).schema).toBe(
        newSchema,
      );
      expect((finalRouteBuilder.opts.handlers[0] as any).schema).not.toBe(
        schema,
      );
      expectTypeOf(finalRouteBuilder).toMatchTypeOf<
        RouteBuilder<{ body: { foo: string } }, { body: { foo: string } }>
      >();
      expectTypeOf(finalRouteBuilder).not.toMatchTypeOf<
        RouteBuilder<{ body: { test: string } }, { body: { test: string } }>
      >();
    });
  });

  describe("query", () => {
    it("should allow validating the query", () => {
      const routeBuilder = new RouteBuilder();
      const schema = object({
        test: string(),
      });
      const queryRouteBuilder = routeBuilder.query(schema);

      expect(queryRouteBuilder.opts.handlers[0]?.type).toBe("validate");
      expect((queryRouteBuilder.opts.handlers[0] as any).key).toBe("query");
      expect((queryRouteBuilder.opts.handlers[0] as any).schema).toBe(schema);

      expect(queryRouteBuilder).toBeInstanceOf(RouteBuilder);
      expectTypeOf(queryRouteBuilder).toMatchTypeOf<
        RouteBuilder<{ query: { test: string } }, { query: { test: string } }>
      >();
    });

    it("should override existing query validation", () => {
      const routeBuilder = new RouteBuilder();
      const schema = object({
        test: string(),
      });
      const queryRouteBuilder = routeBuilder.query(schema);

      expect((queryRouteBuilder.opts.handlers[0] as any).schema).toBe(schema);
      expectTypeOf(queryRouteBuilder).toMatchTypeOf<
        RouteBuilder<{ query: { test: string } }, { query: { test: string } }>
      >();

      const newSchema = object({
        foo: string(),
      });
      const finalRouteBuilder = queryRouteBuilder.query(newSchema);

      expect((finalRouteBuilder.opts.handlers[0] as any).schema).toBe(
        newSchema,
      );
      expect((finalRouteBuilder.opts.handlers[0] as any).schema).not.toBe(
        schema,
      );
      expectTypeOf(finalRouteBuilder).toMatchTypeOf<
        RouteBuilder<{ query: { foo: string } }, { query: { foo: string } }>
      >();
      expectTypeOf(finalRouteBuilder).not.toMatchTypeOf<
        RouteBuilder<{ query: { test: string } }, { query: { test: string } }>
      >();
    });
  });

  describe("handle", () => {
    it("should allow creating a route with method and path", () => {
      const routeBuilder = new RouteBuilder();
      const route = routeBuilder.handle("GET", "/test", () => new Response());

      expect(route).toBeInstanceOf(Route);
      expect(route.method).toBe("GET");
      expect(route.path).toBe("/test");
      expectTypeOf(route).toMatchTypeOf<
        Route<"GET", "/test", SomeResponse, any>
      >();
    });

    it("it should allow creating a route with an async function", () => {
      const routeBuilder = new RouteBuilder();
      const route = routeBuilder.handle(
        "GET",
        "/test",
        async () => new Response(),
      );

      expect(route).toBeInstanceOf(Route);
      expect(route.method).toBe("GET");
      expect(route.path).toBe("/test");
      expectTypeOf(route).toMatchTypeOf<
        Route<"GET", "/test", SomeResponse, any>
      >();
    });

    it("passes all required options to the route", () => {
      const errorHandler = vi.fn();
      const routeBuilder = new RouteBuilder().error(errorHandler).derive(() => ({}));
      const route = routeBuilder.handle("GET", "/test", () => new Response());

      expect(route.handlers).toHaveLength(1);
      expect(route.errorHandler).toBe(errorHandler);
    });
  });

  describe("get", () => {
    it("should allow creating a GET route", () => {
      const routeBuilder = new RouteBuilder();
      const route = routeBuilder.get("/test", () => new Response());

      expect(route).toBeInstanceOf(Route);
      expect(route.method).toBe("GET");
      expect(route.path).toBe("/test");
      expectTypeOf(route).toMatchTypeOf<
        Route<"GET", "/test", SomeResponse, any>
      >();
    });
  });

  describe("post", () => {
    it("should allow creating a POST route", () => {
      const routeBuilder = new RouteBuilder();
      const route = routeBuilder.post("/test", () => new Response());

      expect(route).toBeInstanceOf(Route);
      expect(route.method).toBe("POST");
      expect(route.path).toBe("/test");
      expectTypeOf(route).toMatchTypeOf<
        Route<"POST", "/test", SomeResponse, any>
      >();
    });
  });

  describe("put", () => {
    it("should allow creating a PUT route", () => {
      const routeBuilder = new RouteBuilder();
      const route = routeBuilder.put("/test", () => new Response());

      expect(route).toBeInstanceOf(Route);
      expect(route.method).toBe("PUT");
      expect(route.path).toBe("/test");
      expectTypeOf(route).toMatchTypeOf<
        Route<"PUT", "/test", SomeResponse, any>
      >();
    });
  });

  describe("head", () => {
    it("should allow creating a HEAD route", () => {
      const routeBuilder = new RouteBuilder();
      const route = routeBuilder.head("/test", () => new Response());

      expect(route).toBeInstanceOf(Route);
      expect(route.method).toBe("HEAD");
      expect(route.path).toBe("/test");
      expectTypeOf(route).toMatchTypeOf<
        Route<"HEAD", "/test", SomeResponse, any>
      >();
    });
  });

  describe("delete", () => {
    it("should allow creating a DELETE route", () => {
      const routeBuilder = new RouteBuilder();
      const route = routeBuilder.delete("/test", () => new Response());

      expect(route).toBeInstanceOf(Route);
      expect(route.method).toBe("DELETE");
      expect(route.path).toBe("/test");
      expectTypeOf(route).toMatchTypeOf<
        Route<"DELETE", "/test", SomeResponse, any>
      >();
    });
  });

  describe("patch", () => {
    it("should allow creating a PATCH route", () => {
      const routeBuilder = new RouteBuilder();
      const route = routeBuilder.patch("/test", () => new Response());

      expect(route).toBeInstanceOf(Route);
      expect(route.method).toBe("PATCH");
      expect(route.path).toBe("/test");
      expectTypeOf(route).toMatchTypeOf<
        Route<"PATCH", "/test", SomeResponse, any>
      >();
    });
  });

  describe("options", () => {
    it("should allow creating an OPTIONS route", () => {
      const routeBuilder = new RouteBuilder();
      const route = routeBuilder.options("/test", () => new Response());

      expect(route).toBeInstanceOf(Route);
      expect(route.method).toBe("OPTIONS");
      expect(route.path).toBe("/test");
      expectTypeOf(route).toMatchTypeOf<
        Route<"OPTIONS", "/test", SomeResponse, any>
      >();
    });
  });

  describe("trace", () => {
    it("should allow creating a TRACE route", () => {
      const routeBuilder = new RouteBuilder();
      const route = routeBuilder.trace("/test", () => new Response());

      expect(route).toBeInstanceOf(Route);
      expect(route.method).toBe("TRACE");
      expect(route.path).toBe("/test");
      expectTypeOf(route).toMatchTypeOf<
        Route<"TRACE", "/test", SomeResponse, any>
      >();
    });
  });

  describe("error", () => {
    it("should allow setting an error handler", () => {
      const routeBuilder = new RouteBuilder();
      const errorHandler = () => new Response();
      const errorRouteBuilder = routeBuilder.error(errorHandler);

      expect(errorRouteBuilder.opts.errorHandler).toBe(errorHandler);
      expect(errorRouteBuilder).toBeInstanceOf(RouteBuilder);
      expectTypeOf(errorRouteBuilder).toMatchTypeOf<
        RouteBuilder<any, any, Response>
      >();
    });
  });

  describe("use", () => {
    it("should allow using a middleware", () => {
      const routeBuilder = new RouteBuilder();
      const middleware = new Middleware().derive(() => ({ foo: "bar" }));
      const withMiddleware = routeBuilder.use(middleware);

      expect(withMiddleware).toBeInstanceOf(RouteBuilder);
      expectTypeOf(withMiddleware).toMatchTypeOf<
        RouteBuilder<{ foo: string } & BaseContext>
      >();
      expect(withMiddleware.opts.handlers).toHaveLength(1);
    });

    it("should merge multiple middleware handlers", () => {
      const routeBuilder = new RouteBuilder();
      const middleware = new Middleware()
        .derive(() => ({ foo: "bar" }))
        .before(() => {});
      const withMiddleware = routeBuilder.use(middleware);

      expect(withMiddleware.opts.handlers).toHaveLength(2);
    });
  });
});
