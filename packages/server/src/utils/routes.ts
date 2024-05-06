import { joinURL } from "ufo";
import { Route } from "../route";
import type { AnyRoute } from "../types";

export function groupRoutes<const TRoutes extends AnyRoute[], const TPrefix extends string | undefined = undefined>(
  routes: TRoutes,
  opts?: { prefix: TPrefix },
): TPrefix extends string ? PrefixedRoutes<TRoutes, TPrefix> : TRoutes {
  if (opts?.prefix) {
    const prefixedRoutes = [] as AnyRoute[];

    for (const route of routes) {
      prefixedRoutes.push(
        new Route({
          path: joinURL(opts.prefix, route.path),
          method: route.method,
          fn: route.fn,
          handler: route.handler,
          validationSchemas: route.validationSchemas,
        }),
      );
    }

    return prefixedRoutes as any;
  }

  return routes as any;
}

type PrefixedRoutes<TRoutes extends AnyRoute[], TPrefix extends string> = {
  [K in keyof TRoutes]: TRoutes[K] extends Route<
    infer TMethod,
    infer TPath,
    infer TSchema,
    infer TResponse,
    infer TErrorResponse
  >
    ? Route<TMethod, `${TPrefix}${TPath}`, TSchema, TResponse, TErrorResponse>
    : never;
};
