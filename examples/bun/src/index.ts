import { client } from "@nokijs/client";
import { Noki, RouteBuilder, groupRoutes } from "@nokijs/server";
import { object, string } from "valibot";

const baseRoute = new RouteBuilder();

const route = baseRoute
  .body(
    object({
      foo: string(),
    }),
  )
  .error((err, { res }) => {
    return res.json({ message: "An error occurred." }, { status: 500 });
  })
  .before(({ body, res }) => {
    return res.json({ test: "Hello, World!" }, { status: 500 });
  })
  .post("/api/:id", ({ res, query }) => {
    return res.json({ message: "Hello, World!" });
  });

const routes = groupRoutes([route]);

const noki = new Noki(routes);

const server = Bun.serve({
  fetch: noki.fetch,
});

console.log(`Server running on ${server.url}`);

const api = client<typeof noki>("http://localhost:3000");

const response = await api.api[":id"].post({
  body: { foo: "bar" },
  params: { id: "test" },
});

if (response.ok) {
  console.log(response.data);
} else {
  console.log(response.data);
}
