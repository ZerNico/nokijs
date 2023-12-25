import type { Noki, Route } from "@nokijs/server";

export type InferRoutes<N extends Noki<any, any>> = N extends Noki<any, infer Routes> ? Routes : never;

export type InferPath<Routes extends Route<any, any, any>[]> = Routes extends Route<any, infer Path, any>[]
  ? Path
  : never;

export type Paths<Routes extends Route<any, any, any>[]> = {
  [K in keyof Routes]: Routes[K] extends Route<any, infer Path, any> ? Path : never;
};

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Fetch<Routes extends Route<any, any, any>[]> = <Path extends Routes[number]["path"]>(
  path: Prettify<Path>,
) => Promise<{}>;
