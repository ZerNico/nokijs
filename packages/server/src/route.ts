import { getQuery, parseQuery } from "ufo";
import { parseAsync } from "valibot";
import { createContextFromRequest } from "./context";
import type {
  Handler,
  MaybePromise,
  SomeResponse,
  ValidationKeys,
} from "./types";
import { parseBody } from "./utils/body";

export class Route<
  const TMethods extends string,
  const TPath extends string,
  const TResponse extends SomeResponse,
  const TInputs extends Partial<Record<ValidationKeys, unknown>>,
> {
  public method: TMethods;
  public path: TPath;
  public handlers: Handler[];
  public fn: (context: any) => MaybePromise<TResponse>;
  public errorHandler: (
    error: unknown,
    context: any,
  ) => MaybePromise<SomeResponse>;

  constructor(opts: {
    method: TMethods;
    path: TPath;
    handlers: Handler[];
    fn: (context: any) => MaybePromise<TResponse>;
    errorHandler?: (error: unknown, context: any) => MaybePromise<SomeResponse>;
  }) {
    this.method = opts.method;
    this.path = opts.path;
    this.handlers = opts.handlers;
    this.fn = opts.fn;
    this.errorHandler = opts.errorHandler ?? defaultErrorHandler;
  }

  public async handleRequest(
    request: Request,
    params: Record<string, any>,
  ): Promise<SomeResponse> {
    let context: Record<string, any> = {};

    try {
      context = createContextFromRequest(request);
      context.params = params;

      for (const handler of this.handlers) {
        if (handler.type === "derive") {
          Object.assign(context, await handler.fn(context));
        } else if (handler.type === "before") {
          const response = await handler.fn(context);
          if (response) {
            return response;
          }
        } else if (handler.type === "validate") {
          if (handler.key === "body") {
            const unknownBody = await parseBody(request);
            const body = await parseAsync(handler.schema, unknownBody);
            context.body = body;
          }

          if (handler.key === "query") {
            const unknownQuery = getQuery(request.url);
            const query = await parseAsync(handler.schema, unknownQuery);
            context.query = query;
          }
        }
      }

      const response = await this.fn(context);
      return response;
    } catch (error) {
      return this.errorHandler(error, context);
    }
  }
}

export type AnyRoute = Route<any, any, any, any>;

function defaultErrorHandler(error: unknown) {
  return new Response(
    error instanceof Error ? error.message : "An unknown error occurred",
    { status: 500 },
  );
}
