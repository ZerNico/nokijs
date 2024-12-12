import { client } from "@nokijs/client";
import { Noki, RouteBuilder, groupRoutes } from "@nokijs/server";
import { object, string } from "valibot";

const baseRoute = new RouteBuilder();

const middleware = new RouteBuilder()
  .derive(() => {
    return { abc: "Hello, World!" };
  })
  .body(
    object({
      bar: string(),
    }),
  );

const route = baseRoute
  .body(
    object({
      foo: string(),
    }),
  )
  .use(middleware)
  .error((err, { res }) => {
    return res.json({ message: "An error occurred." }, { status: 500 });
  })
  .before(({ body, res }) => {
    return res.json({ test: "Hello, World!" }, { status: 500 });
  })
  .post("/api/:id", ({ res, query, abc }) => {
    return res.json({ message: "Hello, World!", abc });
  });

const routes = groupRoutes([route]);

const noki = new Noki(routes);

const server = Bun.serve({
  fetch: noki.fetch,
  port: 4000,
});

console.log(`Server running on ${server.url}`);

const api = client<typeof noki>("http://localhost:4000");

const response = await api.api[":id"].post({
  body: { bar: "bar", foo: "foo" },
  params: { id: "test" },
  credentials: "include",
});

if (response.ok) {
  console.log(response.data);
} else {
  console.log(response.data);
}
