type IsPathParameter<Part extends string> = Part extends `:${infer Parameter}`
  ? Parameter
  : Part extends `*`
    ? "*"
    : never;

export type GetPathParameterUnion<Path extends string> = Path extends `${infer A}/${infer B}`
  ? IsPathParameter<A> | GetPathParameterUnion<B>
  : IsPathParameter<Path>;

export type GetPathParameters<Path extends string> = StringLiteralUnionToObject<GetPathParameterUnion<Path>>;

export type MaybeAsync<T> = T | Promise<T>;

export type Prettify<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;

export type StringLiteralUnionToObject<T extends string> = {
  [K in T]: string;
};
