import { type AnyRoute, Route } from "../route";

export function groupRoutes<
  const TRoutes extends ReadonlyArray<AnyRoute>,
  const TPrefix extends string | undefined = undefined,
>(
  routes: TRoutes,
  opts?: { prefix: TPrefix },
): TPrefix extends string ? PrefixedRoutes<TRoutes, TPrefix> : TRoutes {
  if (!opts?.prefix) {
    return routes as any;
  }

  return routes.map((route) => {
    return new Route({
      method: route.method,
      handlers: route.handlers,
      fn: route.fn,
      path: `${opts.prefix}${route.path}`,
    });
  }) as any;
}

type PrefixedRoutes<
  TRoutes extends ReadonlyArray<AnyRoute>,
  TPrefix extends string,
> = {
  [K in keyof TRoutes]: TRoutes[K] extends Route<
    infer TMethod,
    infer TPath,
    infer TResponse,
    infer TInputs
  >
    ? Route<TMethod, `${TPrefix}${TPath}`, TResponse, TInputs>
    : never;
};
