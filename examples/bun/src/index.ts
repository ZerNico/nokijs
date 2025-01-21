import { client } from "@nokijs/client";
import { Noki, RouteBuilder, SchemaError, groupRoutes } from "@nokijs/server";
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
    console.log(err);
    
    if (err instanceof SchemaError) {
      return res.json({ issues: err.issues }, { status: 400 });
    }
    
    return res.json({ message: "An error occurred." }, { status: 500 });
  })
  .before(({ body, res }) => {
    if (body.bar === "foo") {
      return res.json({ message: "Bar cannot be foo." }, { status: 400 });
    }
  })
  .post("/api/:id", ({ res, query, abc, params }) => {
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
