import Memoirist from "memoirist";
import { TypedResponse } from "./response";
import type { AnyRoute } from "./route";

export class Noki<const TRoutes extends AnyRoute[]> {
  public routes: TRoutes;
  private router: Memoirist<AnyRoute>;

  constructor(routes: TRoutes) {
    this.routes = routes;

    const router = new Memoirist<AnyRoute>();
    for (const route of routes) {
      router.add(route.method, route.path, route);
    }
    this.router = router;
  }

  fetch = async (request: Request): Promise<Response> => {
    const { pathname } = new URL(request.url);
    const route = this.router.find(request.method, pathname);

    if (!route) {
      return new Response("Not Found", { status: 404 });
    }

    const response = await route.store.handleRequest(request, route.params);

    if (response instanceof TypedResponse) {
      return response.toResponse();
    }

    return response;
  };
}

export { RouteBuilder } from "./route-builder";
export { Route } from "./route";
export { TypedResponse } from "./response";
export { groupRoutes } from "./utils/routes";
export type { SomeResponse, ResolvePath } from "./types";
