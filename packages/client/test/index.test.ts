import { Noki, RouteBuilder } from "@nokijs/server";
import type { QueryObject } from "ufo";
import { describe, expect, expectTypeOf, it } from "vitest";
import { client } from "../src";

describe("client", () => {
  it("should create a client with the correct structure", () => {
    const testApp = new Noki([
      new RouteBuilder().handle("GET", "/test", ({ res }) =>
        res.json({ message: "Hello, World!" }),
      ),
    ]);
    const testClient = client<typeof testApp>("http://localhost:3000");

    expect(testClient.test.get).toBeTypeOf("function");
    expectTypeOf(testClient.test.get).toBeCallableWith({
      query: {
        abc: "def",
      },
    });
    expectTypeOf(testClient.test.get).toBeCallableWith();
    expectTypeOf(testClient.test.get)
      .returns.resolves.extract<{ ok: true }>()
      .toMatchTypeOf<{
        raw: Response;
        data: {
          message: string;
        };
        status: 200;
        ok: true;
      }>();
  });

  it("allows parameters in the path", () => {
    const testApp = new Noki([
      new RouteBuilder().handle("GET", "/test/:id", ({ res }) =>
        res.json({ message: "Hello, World!" }),
      ),
    ]);
    const testClient = client<typeof testApp>("http://localhost:3000");

    expect(testClient.test[":id"].get).toBeTypeOf("function");
    expectTypeOf(testClient.test[":id"].get).toBeCallableWith({
      query: {
        abc: "def",
      },
      params: {
        id: "123",
      },
    });
    expectTypeOf(testClient.test[":id"].get).parameter(0).toEqualTypeOf<{
      query?: QueryObject | undefined;
      params: {
        id: string;
      };
    }>();
  });

  it("should make the correct request", async () => {
    fetchMock.mockResponse("Hello, World!");

    const testApp = new Noki([
      new RouteBuilder().handle("GET", "/test", ({ res }) =>
        res.json({ message: "Hello, World!" }),
      ),
    ]);
    const testClient = client<typeof testApp>("http://localhost:3000");

    const response = await testClient.test.get();

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
    expect(response.data).toBe("Hello, World!");
  });
});
