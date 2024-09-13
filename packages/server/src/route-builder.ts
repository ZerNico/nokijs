import type { InferInput, InferOutput } from "valibot";
import type { BaseContext } from "./context";
import { Route } from "./route";
import type {
  AnySchema,
  DefaultInputs,
  GetPathParameters,
  Handler,
  InferResponse,
  Inputs,
  MaybePromise,
  PossibleResponse,
  Prettify,
  ResponseTypes,
  ValidationSchemas,
} from "./types";

export class RouteBuilder<
  TContext extends BaseContext = BaseContext,
  TInputs extends Inputs = DefaultInputs,
  TErrorResponse extends ResponseTypes = string,
> {
  constructor(
    public opts?: {
      handler?: Handler[];
      validationSchemas?: ValidationSchemas;
      errorHandler?: (error: unknown, context: any) => MaybePromise<PossibleResponse>;
    },
  ) {}

  public derive<Derived extends Record<string, any>>(fn: (context: Prettify<TContext>) => MaybePromise<Derived>) {
    type OverwrittenContext = Omit<TContext, keyof Awaited<Derived>> & Awaited<Derived> & BaseContext;

    return new RouteBuilder<OverwrittenContext, TInputs, TErrorResponse>({
      ...this.opts,
      handler: [...(this.opts?.handler || []), { type: "derive", fn }],
    });
  }

  public body<TSchema extends AnySchema>(schema: TSchema | ((context: Prettify<TContext>) => TSchema)) {
    const filteredHandler =
      this.opts?.handler?.filter((handler) => !(handler.type === "validate" && handler.key === "body")) ?? [];

    filteredHandler.push({ type: "validate", key: "body" });

    return new RouteBuilder<
      Prettify<Omit<TContext, "body"> & { body: InferOutput<TSchema> }>,
      Prettify<Omit<TInputs, "body"> & { body: InferInput<TSchema> }>,
      TErrorResponse
    >({
      ...this.opts,
      handler: filteredHandler,
      validationSchemas: { ...(this.opts?.validationSchemas || {}), body: schema },
    });
  }

  public query<TSchema extends AnySchema>(schema: TSchema | ((context: Prettify<TContext>) => TSchema)) {
    const filteredHandler =
      this.opts?.handler?.filter((handler) => !(handler.type === "validate" && handler.key === "query")) ?? [];

    filteredHandler.push({ type: "validate", key: "query" });

    return new RouteBuilder<
      Prettify<Omit<TContext, "query"> & { query: InferOutput<TSchema> }>,
      Prettify<Omit<TInputs, "query"> & { query: InferInput<TSchema> }>,
      TErrorResponse
    >({
      ...this.opts,
      handler: filteredHandler,
      validationSchemas: { ...(this.opts?.validationSchemas || {}), query: schema } as any,
    });
  }

  public before<const Return extends MaybePromise<PossibleResponse | void>>(
    fn: (context: Prettify<TContext>) => Return,
  ) {
    return new RouteBuilder<TContext, TInputs, TErrorResponse>({
      ...this.opts,
      handler: [...(this.opts?.handler || []), { type: "before", fn }],
    });
  }

  public after<const Return extends MaybePromise<PossibleResponse | void>>(
    fn: (response: PossibleResponse, context: Prettify<TContext>) => Return,
  ) {
    return new RouteBuilder<TContext, TInputs, TErrorResponse>({
      ...this.opts,
      handler: [...(this.opts?.handler || []), { type: "after", fn }],
    });
  }

  public error<const Return extends MaybePromise<PossibleResponse>>(
    fn: (error: unknown, context: Prettify<TContext>) => Return,
  ) {
    return new RouteBuilder<TContext, TInputs, InferResponse<Awaited<Return>>>({
      ...this.opts,
      errorHandler: fn,
    });
  }

  public get<const TPath extends string, const TReturn extends MaybePromise<PossibleResponse>>(
    path: TPath,
    fn: (context: Prettify<TContext & { params: GetPathParameters<TPath> }>) => TReturn,
  ) {
    return this.handle("GET", path, fn);
  }

  public post<const TPath extends string, const TReturn extends MaybePromise<PossibleResponse>>(
    path: TPath,
    fn: (context: Prettify<TContext & { params: GetPathParameters<TPath> }>) => TReturn,
  ) {
    return this.handle("POST", path, fn);
  }

  public head<const TPath extends string, const TReturn extends MaybePromise<PossibleResponse>>(
    path: TPath,
    fn: (context: Prettify<TContext & { params: GetPathParameters<TPath> }>) => TReturn,
  ) {
    return this.handle("HEAD", path, fn);
  }

  public put<const TPath extends string, const TReturn extends MaybePromise<PossibleResponse>>(
    path: TPath,
    fn: (context: Prettify<TContext & { params: GetPathParameters<TPath> }>) => TReturn,
  ) {
    return this.handle("PUT", path, fn);
  }

  public delete<const TPath extends string, const TReturn extends MaybePromise<PossibleResponse>>(
    path: TPath,
    fn: (context: Prettify<TContext & { params: GetPathParameters<TPath> }>) => TReturn,
  ) {
    return this.handle("DELETE", path, fn);
  }

  public options<const TPath extends string, const TReturn extends MaybePromise<PossibleResponse>>(
    path: TPath,
    fn: (context: Prettify<TContext & { params: GetPathParameters<TPath> }>) => TReturn,
  ) {
    return this.handle("OPTIONS", path, fn);
  }

  public handle<
    const TMethod extends string,
    const TPath extends string,
    TReturn extends MaybePromise<PossibleResponse>,
  >(method: TMethod, path: TPath, fn: (context: Prettify<TContext & { params: GetPathParameters<TPath> }>) => TReturn) {
    return new Route<TMethod, TPath, TInputs, InferResponse<Awaited<TReturn>>, TErrorResponse>({
      path,
      method,
      errorHandler: this.opts?.errorHandler,
      fn,
      handler: this.opts?.handler,
      validationSchemas: this.opts?.validationSchemas,
    });
  }
}
