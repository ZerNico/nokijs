import type { BaseContext } from "./context";
import type { Handler, MaybePromise, Prettify, ValidationKeys } from "./types";

export class Middleware<
  TContext extends Record<string, any> = Prettify<BaseContext>,
> {
  constructor(
    public opts: {
      handlers: Handler[];
    } = {
      handlers: [],
    },
  ) {}

  public derive<TDerived extends Record<string, any> | void>(
    fn: (context: TContext) => MaybePromise<TDerived>,
  ): Middleware<Prettify<Omit<TContext, keyof TDerived> & TDerived>> {
    return new Middleware({
      handlers: [...this.opts.handlers, { type: "derive", fn }],
    });
  }

  public before(
    fn: (context: TContext) => MaybePromise<void>,
  ): Middleware<TContext> {
    return new Middleware({
      handlers: [...this.opts.handlers, { type: "before", fn }],
    });
  }
}
