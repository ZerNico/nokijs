import { Memoirist } from "memoirist";

import type { AnyRoute } from "./types";

export class Noki<TRoutes extends readonly AnyRoute[]> {
  private router: Memoirist<AnyRoute>;

  constructor(options: { routes: TRoutes }) {
    const router = new Memoirist<AnyRoute>();

    for (const route of options.routes) {
      router.add(route.method, route.path, route);
    }

    this.router = router;
  }

  fetch = async (request: Request): Promise<Response> => {
    try {
      const { pathname } = new URL(request.url);
      const route = this.router.find(request.method, pathname);

      if (!route) {
        return new Response("Not found", { status: 404 });
      }

      const response = await route.store.handle(request, route.params);

      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      return new Response(message, { status: 500 });
    }
  };
}
