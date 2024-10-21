import type {
  Noki,
  ResolvePath,
  Route,
  SomeResponse,
  TypedResponse,
} from "@nokijs/server";
import type { QueryObject } from "ufo";

export type NokiClient<TNoki extends Noki<any>> = TNoki extends Noki<
  infer TRoutes
>
  ? Prettify<
      UnionToIntersection<
        {
          [K in keyof TRoutes]: PathToObject<
            TRoutes[K]["path"],
            Prettify<Action<TRoutes[K]>>
          >;
        }[number]
      >
    >
  : never;

type Action<TRoute extends AnyRoute> = {
  [K in Lowercase<TRoute["method"]>]: AllOptional<
    InferRequestOptions<TRoute>
  > extends true
    ? (
        opts?: InferRequestOptions<TRoute>,
      ) => Promise<Prettify<NokiClientResponse<TRoute>>>
    : (
        opts: InferRequestOptions<TRoute>,
      ) => Promise<Prettify<NokiClientResponse<TRoute>>>;
};

type InferRequestOptions<TRoute extends AnyRoute> = Prettify<
  OmitEmptyRecord<{
    query?: QueryObject;
    params: ResolvePath<TRoute["path"]>;
    body: InferInputs<TRoute>["body"];
  }>
>;

type NokiClientResponse<TRoute extends AnyRoute> = NokiResult<
  InferResponse<TRoute>
>;

type NokiResult<T> = T extends TypedResponse<any, any>
  ? {
      data: InferResponseData<T>;
      status: InferResponseStatus<T>;
      ok: InferResponseStatus<T> extends Status2xx ? true : false;
      raw: Response;
    }
  : {
      data: unknown;
      status: number;
      ok: boolean;
      raw: Response;
    };

type PathToObject<TPath extends string, TProperty> = TPath extends `/${infer P}`
  ? PathToObject<P, TProperty>
  : TPath extends `${infer P}/${infer R}`
    ? { [K in P]: PathToObject<R, TProperty> }
    : {
        [K in TPath extends "" ? "index" : TPath]: TProperty;
      };

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type AnyRoute = Route<any, any, any, any>;
type InferResponse<TRoute extends AnyRoute> = TRoute extends Route<
  any,
  any,
  infer TResponse,
  any
>
  ? TResponse
  : never;
type InferInputs<TRoute extends AnyRoute> = TRoute extends Route<
  any,
  any,
  any,
  infer TInputs
>
  ? TInputs
  : never;

type InferResponseData<TResponse extends SomeResponse> =
  TResponse extends TypedResponse<infer TData, number> ? TData : unknown;
type InferResponseStatus<TResponse extends SomeResponse> =
  TResponse extends TypedResponse<any, infer TStatus> ? TStatus : unknown;
type Status2xx =
  | 200
  | 201
  | 202
  | 203
  | 204
  | 205
  | 206
  | 207
  | 208
  | 208
  | 214
  | 226;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;
type OmitEmptyRecord<T> = {
  [K in keyof T as T[K] extends Record<any, never> ? never : K]: T[K];
};
type AllOptional<T> = T extends Record<string, never>
  ? true
  : {
        [K in keyof T]-?: undefined extends T[K] ? true : false;
      }[keyof T] extends true
    ? true
    : false;
