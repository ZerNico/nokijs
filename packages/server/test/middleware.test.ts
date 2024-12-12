import { describe, expect, expectTypeOf, it } from "vitest";
import type { BaseContext } from "../src/context";
import { Middleware } from "../src/middleware";
import type { BeforeHandler } from "../src/types";

describe("Middleware", () => {
  it("should allow creating a middleware without options", () => {
    const middleware = new Middleware();

    expect(middleware).toBeInstanceOf(Middleware);
    expectTypeOf(middleware).toMatchTypeOf<Middleware>();
  });

  describe("derive", () => {
    it("should allow deriving a new context", () => {
      const middleware = new Middleware();
      const derivedMiddleware = middleware.derive(() => ({ foo: "bar" }));

      expect(derivedMiddleware).toBeInstanceOf(Middleware);
      expectTypeOf(derivedMiddleware).toMatchTypeOf<
        Middleware<{ foo: string } & BaseContext>
      >();
      expect(derivedMiddleware.opts.handlers[0]?.type).toBe("derive");
    });

    it("should override existing context properties", () => {
      const middleware = new Middleware();
      const derivedMiddleware = middleware.derive(() => ({
        test: "test",
      }));

      expectTypeOf(derivedMiddleware).toMatchTypeOf<
        Middleware<{ test: string } & BaseContext>
      >();

      const finalMiddleware = derivedMiddleware.derive(() => ({
        test: 1,
      }));
      expectTypeOf(finalMiddleware).toMatchTypeOf<
        Middleware<{ test: number } & BaseContext>
      >();
      expectTypeOf(finalMiddleware).not.toMatchTypeOf<
        Middleware<{ test: string } & BaseContext>
      >();
    });

    it("allows using an async function", () => {
      const middleware = new Middleware();
      const derivedMiddleware = middleware.derive(async () => ({
        foo: "bar",
      }));

      expect(derivedMiddleware).toBeInstanceOf(Middleware);
      expectTypeOf(derivedMiddleware).toMatchTypeOf<
        Middleware<{ foo: string } & BaseContext>
      >();
    });

    it("should allow returning void", () => {
      const middleware = new Middleware();
      const derivedMiddleware = middleware.derive(() => {});

      expect(derivedMiddleware).toBeInstanceOf(Middleware);
      expectTypeOf(derivedMiddleware).toMatchTypeOf<Middleware<BaseContext>>();
    });
  });

  describe("before", () => {
    it("should allow adding a before handler", () => {
      const middleware = new Middleware();
      const beforeHandler = () => {};
      const beforeMiddleware = middleware.before(beforeHandler);

      expect(beforeMiddleware.opts.handlers[0]?.type).toBe("before");
      expect((beforeMiddleware.opts.handlers[0] as BeforeHandler).fn).toBe(
        beforeHandler,
      );
      expect(beforeMiddleware).toBeInstanceOf(Middleware);
    });

    it("should allow adding an async before handler", () => {
      const middleware = new Middleware();
      const beforeHandler = async () => {};
      const beforeMiddleware = middleware.before(beforeHandler);

      expect(beforeMiddleware.opts.handlers[0]?.type).toBe("before");
      expect((beforeMiddleware.opts.handlers[0] as BeforeHandler).fn).toBe(
        beforeHandler,
      );
      expect(beforeMiddleware).toBeInstanceOf(Middleware);
    });
  });
});
