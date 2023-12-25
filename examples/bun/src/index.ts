import { NokiClient } from "@nokijs/client";
import { Context, Noki, TypeBoxValidator } from "@nokijs/server";
import { Type } from "@sinclair/typebox";

const context = new Context({
  validator: new TypeBoxValidator(),
});

const route = context.route().input(
  Type.Object({
    name: Type.String(),
  }),
);

const routes = [
  route.get("/hello/:id", async ({ params }) => {
    return new Response(JSON.stringify(params));
  }),
] as const;

const noki = new Noki({ context, routes });

const server = Bun.serve({
  fetch: noki.fetch,
});

console.log(`Listening on ${server.url}`);

const client = new NokiClient<typeof noki>({ url: "http://localhost:3000" });

client.fetch("/hello/:id");
