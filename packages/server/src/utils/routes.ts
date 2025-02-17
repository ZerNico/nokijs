import { type AnyRoute, Route } from "../route";
import { joinURL } from "ufo";

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
    const path =
      opts.prefix === undefined ? route.path : joinURL(opts.prefix, route.path);

    return new Route({
      method: route.method,
      handlers: route.handlers,
      fn: route.fn,
      path,
      errorHandler: route.errorHandler,
    });
  }) as any;
}

type RemoveLeadingSlash<T extends string> = T extends `/${infer Rest}`
  ? Rest
  : T;
type RemoveTrailingSlash<T extends string> = T extends `${infer Rest}/`
  ? Rest
  : T;

type JoinURL<TPrefix extends string, TPath extends string> = TPrefix extends ""
  ? TPath
  : TPath extends ""
    ? TPrefix
    : TPath extends "/"
      ? TPrefix
      : `${RemoveTrailingSlash<TPrefix>}/${RemoveLeadingSlash<TPath>}`;

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
    ? Route<TMethod, JoinURL<TPrefix, TPath>, TResponse, TInputs>
    : never;
};
