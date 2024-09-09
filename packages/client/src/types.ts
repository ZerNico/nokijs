import type { AnyRoute, GetPathParameters, Noki, Route } from "@nokijs/server";
import type { QueryObject } from "ufo";
import type { NokiClientError } from "./error";

export type Client<TNoki extends Noki<any>, TBasePath extends string = ""> = TNoki extends Noki<infer TRoutes>
  ? UnionToIntersection<
      {
        [I in keyof TRoutes]: PathToChain<StripPrefix<TRoutes[I]["path"], TBasePath>, TRoutes[I]>;
      }[number]
    >
  : never;

type PathToChain<
  TPath extends string,
  TRoute extends AnyRoute,
  TOriginal extends string = "",
> = TPath extends `/${infer P}`
  ? PathToChain<P, TRoute, TPath>
  : TPath extends `${infer P}/${infer R}`
    ? { [K in P]: PathToChain<R, TRoute, TOriginal> }
    : {
        [K in TPath extends "" ? "index" : TPath]: ClientRequest<TRoute>;
      };

type StripPrefix<Path extends string, Prefix extends string> = Path extends `${Prefix}${infer Rest}` ? Rest : Path;

type ClientRequest<TRoute extends AnyRoute> = Prettify<
  {
    [K in Lowercase<TRoute["method"]>]: (
      opts: Prettify<
        OmitNever<
          {
            query?: QueryObject;
            params: GetPathParameters<TRoute["path"]>;
          } & InferInputs<TRoute>
        >
      >,
    ) => Promise<Prettify<TypedResponse<InferResponse<TRoute>>>>;
  } & {
    isNokiError: (error: unknown) => error is NokiClientError<TypedResponse<InferErrorResponse<TRoute>>>;
  }
>;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
type OmitNever<T> = Pick<T, { [K in keyof T]: T[K] extends never ? never : K }[keyof T]>;
type Prettify<T> = { [K in keyof T]: T[K] } & {};
type InferResponse<T extends AnyRoute> = T extends Route<any, any, any, infer TResponse, any> ? TResponse : never;
type InferErrorResponse<T extends AnyRoute> = T extends Route<any, any, any, any, infer TErrorResponse>
  ? TErrorResponse
  : never;

type InferInputs<T extends AnyRoute> = T extends Route<any, any, infer TInputs, any, any> ? TInputs : never;

export type TypedResponse<TBody extends string | Record<string, any>> = {
  data: TBody;
  response: Response;
  status: number;
  headers: Headers;
};
