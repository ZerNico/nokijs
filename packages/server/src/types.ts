import type { GenericSchema, GenericSchemaAsync, InferInput, InferOutput, SafeParseResult } from "valibot";
import type { TypedResponse } from "./response";
import type { Route } from "./route";

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type IsPathParameter<Part extends string> = Part extends `:${infer Parameter}`
  ? Parameter
  : Part extends `*`
    ? "*"
    : never;

export type GetPathParameterUnion<Path extends string> = Path extends `${infer A}/${infer B}`
  ? IsPathParameter<A> | GetPathParameterUnion<B>
  : IsPathParameter<Path>;

export type GetPathParameters<Path extends string> = Prettify<
  Path extends `${string}/${":" | "*"}${string}` ? Record<GetPathParameterUnion<Path>, string> : never
>;

export type MaybePromise<T> = T | Promise<T>;

export type PossibleResponse = Response | TypedResponse<any>;

export type Handler =
  | { type: "derive"; fn: (context: any) => any }
  | {
      type: "before";
      fn: (context: any) => MaybePromise<PossibleResponse | void>;
    }
  | {
      type: "after";
      fn: (response: PossibleResponse, context: any) => MaybePromise<PossibleResponse | void>;
    }
  | {
      type: "validate";
      key: ValidationKeys;
    };

export type InferResponse<T extends Response | TypedResponse<any> | void> = T extends TypedResponse<infer Body>
  ? Body
  : T extends Response
    ? unknown
    : void;

export type ValidationKeys = "body" | "query";
export type Inputs = Record<ValidationKeys, any>;
export type DefaultInputs = Record<ValidationKeys, never>;
export type ValidationSchemas = Partial<Record<ValidationKeys, AnySchema | ((context: any) => AnySchema)>>;

export type AnyRoute = Route<any, any, any, any, any>;

export type AnySchema = GenericSchema | GenericSchemaAsync;

export type ValidationSchemasToOutput<T extends ValidationSchemas> = {
  [K in keyof T]: T[K] extends AnySchema ? InferOutput<T[K]> : never;
};

export type ResponseTypes = string | Record<string, any>;
