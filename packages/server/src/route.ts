import { getQuery } from "ufo";
import type { MaybePromise } from "valibot";
import type { Handler, Inputs, PossibleResponse, ResponseTypes, ValidationSchemas } from "./types";
import { parseBody } from "./utils/body";
import { buildOptions } from "./utils/options";
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
  public fn: (options: any) => MaybePromise<PossibleResponse>;
  public validationSchemas?: ValidationSchemas;
  public handler?: Handler[];
  public errorHandler: (error: unknown, options: any) => MaybePromise<PossibleResponse>;

  constructor(opts: {
    path: TPath;
    method: TMethod;
    handler?: Handler[];
    fn: (opts: any) => MaybePromise<PossibleResponse>;
    validationSchemas?: ValidationSchemas;
    errorHandler?: (error: unknown, options: any) => MaybePromise<PossibleResponse>;
  }) {
    this.path = opts.path;
    this.method = opts.method;
    this.fn = opts.fn;
    this.handler = opts.handler;
    this.validationSchemas = opts.validationSchemas;
    this.errorHandler = opts.errorHandler || defaultErrorHandler;
  }

  public async handle(request: Request, params: Record<string, string | undefined>) {
    try {
      let options: Record<string, any> = { ...buildOptions(request), params };

      for (const handler of this.handler || []) {
        if (handler.type === "derive") {
          options = { ...options, ...handler.fn(options) };
        } else if (handler.type === "before") {
          const response = await handler.fn(options);
          if (response) {
            return response;
          }
        } else if (handler.type === "validate") {
          if (handler.key === "body" && this.validationSchemas?.body) {
            const body = await parseBody(request);

            options = { ...options, body: await validate(this.validationSchemas.body, body) };
          } else if (handler.key === "query" && this.validationSchemas?.query) {
            const query = getQuery(request.url);
            options = { ...options, query: await validate(this.validationSchemas.query, query) };
          }
        }
      }

      let response = await this.fn(options);

      for (const handler of this.handler || []) {
        if (handler.type === "after") {
          const modifiedResponse = await handler.fn(response, options);
          if (modifiedResponse) {
            response = modifiedResponse;
          }
        }
      }

      return response;
    } catch (error) {
      return this.errorHandler(error, {});
    }
  }
}

function defaultErrorHandler(error: unknown) {
  return new Response(error instanceof Error ? error.message : "An unknown error occurred", { status: 500 });
}
