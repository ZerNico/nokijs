import { object, string } from "valibot";
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import type { BaseContext } from "../src/context.js";
import { RouteBuilder } from "../src/route-builder.js";
import { Route } from "../src/route.js";
import type { BeforeHandler, SomeResponse, ValidationKeys } from "../src/types.js";

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
      const routeBuilder = new RouteBuilder()
        .error(errorHandler)
        .derive(() => ({}));
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
    it("should allow using another route builder", () => {
      const routeBuilder = new RouteBuilder();
      const otherBuilder = new RouteBuilder().derive(() => ({ foo: "bar" }));
      const combined = routeBuilder.use(otherBuilder);

      expect(combined).toBeInstanceOf(RouteBuilder);
      expectTypeOf(combined).toMatchTypeOf<
        RouteBuilder<{ foo: string } & BaseContext>
      >();
      expect(combined.opts.handlers).toHaveLength(1);
    });

    it("should merge multiple handlers", () => {
      const routeBuilder = new RouteBuilder();
      const otherBuilder = new RouteBuilder()
        .derive(() => ({ foo: "bar" }))
        .before(() => {});
      const combined = routeBuilder.use(otherBuilder);

      expect(combined.opts.handlers).toHaveLength(2);
    });

    it("should correctly merge handler contexts and inputs", () => {
      const routeBuilder = new RouteBuilder()
        .derive(() => ({ foo: "bar" }))
        .body(object({ name: string() }));

      const otherBuilder = new RouteBuilder()
        .derive(() => ({ baz: 123 }))
        .query(object({ id: string() }));

      const combined = routeBuilder.use(otherBuilder);

      expectTypeOf(combined).toMatchTypeOf<
        RouteBuilder<
          { foo: string; baz: number } & BaseContext,
          { body: { name: string }; query: { id: string } }
        >
      >();
    });

    it("should merge error handlers", () => {
      const errorHandler = () => new Response("error");
      const routeBuilder = new RouteBuilder().error(errorHandler);
      const otherBuilder = new RouteBuilder();
      const combined = routeBuilder.use(otherBuilder);

      expect(combined.opts.errorHandler).toBe(errorHandler);
    });

    type InferContext<T> = T extends RouteBuilder<infer C, any, any, any>
      ? C
      : never;
    type InferInputs<T> = T extends RouteBuilder<any, infer I, any, any>
      ? I
      : never;
    type InferResponses<T> = T extends RouteBuilder<any, any, any, infer R>
      ? R
      : never;
    type InferError<T> = T extends RouteBuilder<any, any, infer E, any>
      ? E
      : never;

    it("should merge multiple derive handlers in correct order", () => {
      const first = new RouteBuilder().derive(() => ({ foo: "bar" }));
      const second = new RouteBuilder().derive(() => ({ baz: 123 }));
      const third = new RouteBuilder().derive(() => ({ qux: true }));

      const combined = first.use(second).use(third);

      expect(combined.opts.handlers).toHaveLength(3);
      expect(combined.opts.handlers[0]).toEqual({
        type: "derive",
        fn: expect.any(Function),
      });

      expectTypeOf<InferContext<typeof combined>>().toMatchTypeOf<
        {
          foo: string;
          baz: number;
          qux: boolean;
        } & BaseContext
      >();
    });

    it("should merge multiple before handlers in correct order", () => {
      const first = new RouteBuilder().before(() => new Response("1"));
      const second = new RouteBuilder().before(() => new Response("2"));

      const combined = first.use(second);

      expect(combined.opts.handlers).toHaveLength(2);
      expectTypeOf<InferResponses<typeof combined>>().toEqualTypeOf<Response>();
    });

    it("should merge multiple body validators", () => {
      const first = new RouteBuilder().body(object({ name: string() }));
      const second = new RouteBuilder().body(object({ age: string() }));

      const combined = first.use(second);

      expect(combined.opts.handlers).toHaveLength(2);
      expectTypeOf<InferInputs<typeof combined>>().toMatchTypeOf<{
        body: { name: string } & { age: string };
      }>();
    });

    it("should merge multiple query validators", () => {
      const first = new RouteBuilder().query(object({ sort: string() }));
      const second = new RouteBuilder().query(object({ filter: string() }));

      const combined = first.use(second);

      expect(combined.opts.handlers).toHaveLength(2);
      expectTypeOf<InferInputs<typeof combined>>().toMatchTypeOf<{
        query: { sort: string } & { filter: string };
      }>();
    });

    it("should keep the first error handler when merging", () => {
      const firstError = () => new Response("first");
      const secondError = () => new Response("second");

      const first = new RouteBuilder().error(firstError);
      const second = new RouteBuilder().error(secondError);

      const combined = first.use(second);

      expect(combined.opts.errorHandler).toBe(firstError);
      expectTypeOf<InferError<typeof combined>>().toEqualTypeOf<Response>();
    });

    it("should handle complex nested merges", () => {
      const auth = new RouteBuilder()
        .derive(() => ({ user: { id: 1 } }))
        .before(() => {});

      const validation = new RouteBuilder()
        .body(object({ data: string() }))
        .query(object({ version: string() }));

      const logging = new RouteBuilder()
        .before(() => console.log("request"))
        .error(() => new Response("error"));

      const combined = auth.use(validation).use(logging);

      expect(combined.opts.handlers).toHaveLength(5);
      expectTypeOf<InferContext<typeof combined>>().toMatchTypeOf<
        {
          user: { id: number };
          body: { data: string };
          query: { version: string };
        } & BaseContext
      >();
      expectTypeOf<InferInputs<typeof combined>>().toMatchTypeOf<{
        body: { data: string };
        query: { version: string };
      }>();
    });

    it("should preserve void responses in before handlers", () => {
      const first = new RouteBuilder().before(() => {});
      const second = new RouteBuilder().before(() => {});

      const combined = first.use(second);

      expectTypeOf<InferResponses<typeof combined>>().toEqualTypeOf<never>();
    });

    it("should merge different response types from before handlers", () => {
      const first = new RouteBuilder().before(() => new Response("1"));
      const second = new RouteBuilder().before(() => new Response("2"));
      const third = new RouteBuilder().before(() => {});

      const combined = first.use(second).use(third);

      expectTypeOf<InferResponses<typeof combined>>().toEqualTypeOf<Response>();
    });

    it("should handle empty builders", () => {
      const first = new RouteBuilder();
      const second = new RouteBuilder();

      const combined = first.use(second);

      expect(combined.opts.handlers).toHaveLength(0);
      expect(combined.opts.errorHandler).toBeUndefined();
      expectTypeOf<
        InferContext<typeof combined>
      >().toEqualTypeOf<BaseContext>();
      expectTypeOf<InferInputs<typeof combined>>().toMatchTypeOf<
        Record<ValidationKeys, never>
      >();
    });

    it("should work with the handle method after merging", () => {
      const auth = new RouteBuilder().derive(() => ({ user: { id: 1 } }));
      const validation = new RouteBuilder().body(object({ data: string() }));

      const combined = auth.use(validation);
      const route = combined.handle("GET", "/test", (ctx) => {
        expectTypeOf(ctx.user.id).toBeNumber();
        expectTypeOf(ctx.body.data).toBeString();
        return new Response();
      });

      expect(route).toBeInstanceOf(Route);
      expect(route.handlers).toHaveLength(2);
    });
  });
});
