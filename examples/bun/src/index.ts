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
      .get("/hello/:person", ({ res, greeting, params, getCookie }) => {
        console.log(getCookie("test"));

        res.setCookie("test", params.person, { httpOnly: true, path: "/" });

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
