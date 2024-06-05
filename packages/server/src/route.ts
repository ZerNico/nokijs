import { getQuery } from "ufo";
import type { MaybePromise } from "valibot";
import { buildContext } from "./context";
import type { Handler, Inputs, PossibleResponse, ResponseTypes, ValidationSchemas } from "./types";
import { parseBody } from "./utils/body";
import { validate } from "./utils/validator";

export class Route<
  const TMethod extends string,
  const TPath extends string,
  const TInputs extends Inputs,
  const TResponse extends string | Record<string, any>,
  const TErrorResponse extends ResponseTypes,
> {
  public path: TPath;
  public method: TMethod;
  public fn: (context: any) => MaybePromise<PossibleResponse>;
  public validationSchemas?: ValidationSchemas;
  public handler?: Handler[];
  public errorHandler: (error: unknown, context: any) => MaybePromise<PossibleResponse>;

  constructor(opts: {
    path: TPath;
    method: TMethod;
    handler?: Handler[];
    fn: (context: any) => MaybePromise<PossibleResponse>;
    validationSchemas?: ValidationSchemas;
    errorHandler?: (error: unknown, context: any) => MaybePromise<PossibleResponse>;
  }) {
    this.path = opts.path;
    this.method = opts.method;
    this.fn = opts.fn;
    this.handler = opts.handler;
    this.validationSchemas = opts.validationSchemas;
    this.errorHandler = opts.errorHandler || defaultErrorHandler;
  }

  public async handle(request: Request, params: Record<string, string | undefined>) {
    let context: Record<string, any> = { ...buildContext(request), params };
    try {
      for (const handler of this.handler || []) {
        if (handler.type === "derive") {
          context = { ...context, ...(await handler.fn(context)) };
        } else if (handler.type === "before") {
          const response = await handler.fn(context);
          if (response) {
            return response;
          }
        } else if (handler.type === "validate") {
          if (handler.key === "body" && this.validationSchemas?.body) {
            const body = await parseBody(request);

            context = { ...context, body: await validate(this.validationSchemas.body, body) };
          } else if (handler.key === "query" && this.validationSchemas?.query) {
            const query = getQuery(request.url);
            context = { ...context, query: await validate(this.validationSchemas.query, query) };
          }
        }
      }

      let response = await this.fn(context);

      for (const handler of this.handler || []) {
        if (handler.type === "after") {
          const modifiedResponse = await handler.fn(response, context);
          if (modifiedResponse) {
            response = modifiedResponse;
          }
        }
      }

      return response;
    } catch (error) {
      return this.errorHandler(error, context);
    }
  }
}

function defaultErrorHandler(error: unknown) {
  return new Response(error instanceof Error ? error.message : "An unknown error occurred", { status: 500 });
}
