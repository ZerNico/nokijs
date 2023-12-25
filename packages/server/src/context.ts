import { Handler, Route } from "./route";
import { BaseValidator, InferValidationSchema } from "./validator";

export class RouteContext<
  C extends Context<BaseValidator>,
  InputSchema extends InferValidationSchema<InferValidator<C>>,
> {
  readonly context: C;
  readonly inputSchema: InferValidationSchema<InferValidator<C>>;

  constructor({ context, inputSchema }: { context: C; inputSchema?: InputSchema }) {
    this.context = context;
    this.inputSchema = inputSchema;
  }

  public input<Schema extends InferValidationSchema<InferValidator<C>>>(schema: Schema) {
    return new RouteContext({ context: this.context, inputSchema: schema });
  }

  public get<const Path extends string>(path: Path, handler: Handler<Path>) {
    return new Route({ routeContext: this, path, method: "GET", handler });
  }
}

export class Context<Validator extends BaseValidator> {
  private validator: Validator;

  constructor({ validator }: { validator: Validator }) {
    this.validator = validator;
  }

  public route() {
    return new RouteContext({ context: this });
  }
}

type InferValidator<C extends Context<BaseValidator>> = C extends Context<infer Validator> ? Validator : never;
