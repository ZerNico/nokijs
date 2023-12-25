import { BaseValidator } from ".";
import { Context } from "./context";
import { Route } from "./route";
import Memoirist from "./router";
import { getPath } from "./utils/url";

export class Noki<C extends Context<BaseValidator>, const Routes extends readonly Route<any, any, any>[]> {
  private router = new Memoirist<Route<any, any, any>>();
  readonly context: C;

  constructor({
    context,
    routes,
  }: {
    context: C;
    routes: Routes;
  }) {
    this.context = context;

    for (const route of routes) {
      this.router.add(route.method, route.path, route);
    }
  }

  public fetch = async (req: Request) => {
    const path = getPath(req);

    const result = this.router.find(req.method, path);

    if (!result) {
      return new Response("Not found", { status: 404 });
    }

    return result.store.handle(req, {
      params: result.params,
      path,
    });
  };
}

export type Paths<Routes extends readonly Route<any, any, any>[]> = {
  [K in keyof Routes]: Routes[K] extends Route<any, infer Path, any> ? Path : never;
};
