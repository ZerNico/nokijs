import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { TypedResponse } from "./response";

export type MaybePromise<T> = T | Promise<T>;
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type ValidationKeys = "body" | "query" | "params";

export type DeriveHandler = {
  type: "derive";
  fn: (context: any) => MaybePromise<Record<string, any> | void>;
};
export type ValidateHandler = {
  type: "validate";
  schema: StandardSchemaV1;
  key: ValidationKeys;
};
export type BeforeHandler = {
  type: "before";
  fn: (context: any) => MaybePromise<SomeResponse | void>;
};
export type Handler = DeriveHandler | ValidateHandler | BeforeHandler;

export type SomeResponse = Response | TypedResponse<any, any>;

/* Thanks @SaltyAom <3 */
type IsPathParameter<Part extends string> = Part extends `:${infer Parameter}`
  ? Parameter
  : Part extends `*`
    ? "*"
    : never;
export type GetPathParameter<Path extends string> =
  Path extends `${infer A}/${infer B}`
    ? IsPathParameter<A> | GetPathParameter<B>
    : IsPathParameter<Path>;

export type ResolvePath<Path extends string> = Prettify<
  {
    [Param in GetPathParameter<Path> as Param extends `${string}?`
      ? never
      : Param]: string;
  } & {
    [Param in GetPathParameter<Path> as Param extends `${infer OptionalParam}?`
      ? OptionalParam
      : never]?: string;
  }
>;
