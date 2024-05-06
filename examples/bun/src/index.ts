import { client } from "@nokijs/client";
import { Noki, RouteBuilder, groupRoutes } from "@nokijs/server";

const baseRoute = new RouteBuilder().error((e, { res }) => {
  return res.json({ error: "Test" }, { status: 500 });
});

const routes = groupRoutes(
  [
    baseRoute
      .derive(() => {
        return { greeting: "Hello there," };
      })
      .get("/hello/:person", ({ res, greeting, params }) => {
        return res.json({ greeting: `${greeting} ${params.person}` });
      }),
  ],
  {
    prefix: "api",
  },
);

const noki = new Noki({ routes });

const server = Bun.serve({
  fetch: noki.fetch,
});

console.log(`Listening on ${server.url}`);

const app = client<typeof noki>("https://localhost:3000");

try {
  const response = await app.api.hello[":person"].get({ params: { person: "world" } });
} catch (e) {
  if (app.api.hello[":person"].isNokiError(e)) {
    const error = e.data;
  }
}
