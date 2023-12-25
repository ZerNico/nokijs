import { RouteContext } from "./context";
import { GetPathParameters, MaybeAsync } from "./utils/types";

export class Route<RC extends RouteContext<any, any>, const Path extends string, const Method extends string> {
  readonly path: Path;
  readonly method: Method;
  private routeContext: RC;
  readonly handler: Handler<Path>;

  constructor({
    path,
    method,
    routeContext,
    handler,
  }: {
    path: Path;
    method: Method;
    routeContext: RC;
    handler: Handler<Path>;
  }) {
    this.path = path;
    this.method = method;
    this.routeContext = routeContext;
    this.handler = handler;
  }

  private buildHandlerContext = async (
    req: Request,
    options: { params: GetPathParameters<Path>; path: string },
  ): Promise<HandlerContext<GetPathParameters<Path>>> => {
    return {
      req,
      path: options.path,
      params: options.params,
    };
  };

  public handle = async (req: Request, options: { params: GetPathParameters<Path>; path: string }) => {
    const handlerContext = await this.buildHandlerContext(req, options);

    return await this.handler(handlerContext);
  };
}

type HandlerContext<Params extends Record<string, string>> = {
  req: Request;
  path: string;
  params: Params;
};

export type Handler<Path extends string> = (ctx: HandlerContext<GetPathParameters<Path>>) => MaybeAsync<Response>;
