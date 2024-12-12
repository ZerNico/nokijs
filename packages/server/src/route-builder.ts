import type { InferInput, InferOutput } from "valibot";
import type { BaseContext } from "./context";
import type { TypedResponse } from "./response";
import { Route } from "./route";
import type {
  AnySchema,
  Handler,
  MaybePromise,
  Prettify,
  ResolvePath,
  SomeResponse,
  ValidationKeys,
} from "./types";

export class RouteBuilder<
  TContext extends Record<string, any> = Prettify<BaseContext>,
  TInputs extends Partial<Record<ValidationKeys, unknown>> = Record<
    ValidationKeys,
    never
  >,
  TErrorResponse extends SomeResponse = TypedResponse<string, 500>,
  TResponses extends SomeResponse = never,
> {
  constructor(
    public opts: {
      handlers: Handler[];
      errorHandler?: (
        error: unknown,
        context: any,
      ) => MaybePromise<TErrorResponse>;
    } = {
      handlers: [],
    },
  ) {}

  public derive<TDerived extends Record<string, any> | void>(
    fn: (context: TContext) => MaybePromise<TDerived>,
  ): RouteBuilder<
    Prettify<Omit<TContext, keyof TDerived> & TDerived>,
    TInputs,
    TErrorResponse,
    TResponses
  > {
    return new RouteBuilder({
      ...this.opts,
      handlers: [...this.opts.handlers, { type: "derive", fn }],
    });
  }

  public before<const TResponse extends SomeResponse | void>(
    fn: (context: TContext) => MaybePromise<TResponse>,
  ): RouteBuilder<
    TContext,
    TInputs,
    TErrorResponse,
    TResponse extends SomeResponse ? TResponse | TResponses : TResponses
  > {
    return new RouteBuilder({
      ...this.opts,
      handlers: [...this.opts.handlers, { type: "before", fn }],
    });
  }

  public body<TSchema extends AnySchema>(
    schema: TSchema,
  ): RouteBuilder<
    Prettify<Omit<TContext, "body"> & { body: InferOutput<TSchema> }>,
    Prettify<TInputs & { body: InferInput<TSchema> }>,
    TErrorResponse,
    TResponses
  > {
    return new RouteBuilder({
      ...this.opts,
      handlers: [
        ...this.opts.handlers,
        { type: "validate", schema, key: "body" },
      ],
    });
  }

  public query<TSchema extends AnySchema>(
    schema: TSchema,
  ): RouteBuilder<
    Prettify<Omit<TContext, "query"> & { query: InferOutput<TSchema> }>,
    Prettify<TInputs & { query: InferInput<TSchema> }>,
    TErrorResponse,
    TResponses
  > {
    return new RouteBuilder({
      ...this.opts,
      handlers: [
        ...this.opts.handlers,
        { type: "validate", schema, key: "query" },
      ],
    });
  }

  public error<const TResponse extends SomeResponse>(
    fn: (error: unknown, context: TContext) => MaybePromise<TResponse>,
  ): RouteBuilder<TContext, TInputs, TResponse, TResponses> {
    return new RouteBuilder({
      ...this.opts,
      errorHandler: fn,
    });
  }

  public get<const TPath extends string, const TResponse extends SomeResponse>(
    path: TPath,
    fn: (context: TContext) => MaybePromise<TResponse>,
  ): Route<"GET", TPath, TResponse | TErrorResponse | TResponses, TInputs> {
    return this.handle("GET", path, fn);
  }

  public post<const TPath extends string, const TResponse extends SomeResponse>(
    path: TPath,
    fn: (context: TContext) => MaybePromise<TResponse>,
  ): Route<"POST", TPath, TResponse | TErrorResponse | TResponses, TInputs> {
    return this.handle("POST", path, fn);
  }

  public head<const TPath extends string, const TResponse extends SomeResponse>(
    path: TPath,
    fn: (context: TContext) => MaybePromise<TResponse>,
  ): Route<"HEAD", TPath, TResponse | TErrorResponse | TResponses, TInputs> {
    return this.handle("HEAD", path, fn);
  }

  public put<const TPath extends string, const TResponse extends SomeResponse>(
    path: TPath,
    fn: (context: TContext) => MaybePromise<TResponse>,
  ): Route<"PUT", TPath, TResponse | TErrorResponse | TResponses, TInputs> {
    return this.handle("PUT", path, fn);
  }

  public delete<
    const TPath extends string,
    const TResponse extends SomeResponse,
  >(
    path: TPath,
    fn: (context: TContext) => MaybePromise<TResponse>,
  ): Route<"DELETE", TPath, TResponse | TErrorResponse | TResponses, TInputs> {
    return this.handle("DELETE", path, fn);
  }

  public patch<
    const TPath extends string,
    const TResponse extends SomeResponse,
  >(
    path: TPath,
    fn: (context: TContext) => MaybePromise<TResponse>,
  ): Route<"PATCH", TPath, TResponse | TErrorResponse | TResponses, TInputs> {
    return this.handle("PATCH", path, fn);
  }

  public options<
    const TPath extends string,
    const TResponse extends SomeResponse,
  >(
    path: TPath,
    fn: (context: TContext) => MaybePromise<TResponse>,
  ): Route<"OPTIONS", TPath, TResponse | TErrorResponse | TResponses, TInputs> {
    return this.handle("OPTIONS", path, fn);
  }

  public trace<
    const TPath extends string,
    const TResponse extends SomeResponse,
  >(
    path: TPath,
    fn: (context: TContext) => MaybePromise<TResponse>,
  ): Route<"TRACE", TPath, TResponse | TErrorResponse | TResponses, TInputs> {
    return this.handle("TRACE", path, fn);
  }

  public handle<
    const TMethod extends string,
    const TPath extends string,
    const TResponse extends SomeResponse,
  >(
    method: TMethod,
    path: TPath,
    fn: (
      context: TContext & { params: ResolvePath<TPath> },
    ) => MaybePromise<TResponse>,
  ): Route<TMethod, TPath, TResponse | TErrorResponse | TResponses, TInputs> {
    return new Route({
      method,
      path,
      handlers: this.opts.handlers,
      errorHandler: this.opts.errorHandler,
      fn,
    });
  }

  public use<
    TOtherContext extends Record<string, any>,
    TOtherInputs extends Partial<Record<ValidationKeys, unknown>>,
    TOtherError extends SomeResponse,
    TOtherResponses extends SomeResponse,
  >(
    otherBuilder: RouteBuilder<
      TOtherContext,
      TOtherInputs,
      TOtherError,
      TOtherResponses
    >,
  ): RouteBuilder<
    Prettify<TContext & TOtherContext>,
    Prettify<TInputs & TOtherInputs>,
    TErrorResponse,
    TResponses | TOtherResponses
  > {
    return new RouteBuilder({
      ...this.opts,
      handlers: [...this.opts.handlers, ...otherBuilder.opts.handlers],
      errorHandler: this.opts.errorHandler,
    });
  }
}
