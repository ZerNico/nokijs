import { Noki, RouteBuilder } from "@nokijs/server";
import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { client } from "../src";

describe("client", () => {
  afterEach(() => {
    fetchMock.resetMocks();
  });

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
  });

  it("allows passing additional request options", async () => {
    fetchMock.mockResponse("Hello, World!");

    const testApp = new Noki([
      new RouteBuilder().handle("GET", "/test", ({ res }) =>
        res.json({ message: "Hello, World!" }),
      ),
    ]);
    const testClient = client<typeof testApp>("http://localhost:3000");

    const response = await testClient.test.get({
      query: {
        abc: "def",
      },
      headers: {
        "x-custom-header": "value",
      },
      credentials: "include",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/test?abc=def",
      expect.objectContaining({

        credentials: "include",
      }),
    );

    expect(testClient.test.get).toBeTypeOf("function");
    expectTypeOf(testClient.test.get).toBeCallableWith({
      query: {
        abc: "def",
      },
      credentials: "include",
    });
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

  it("should call onResponse callback with correct parameters", async () => {
    fetchMock.mockResponse("Hello, World!");
    const onResponse = vi.fn((data) => data.response);

    const testApp = new Noki([
      new RouteBuilder().handle("GET", "/test", ({ res }) =>
        res.json({ message: "Hello, World!" }),
      ),
    ]);
    const testClient = client<typeof testApp>("http://localhost:3000", {
      onResponse,
    });

    await testClient.test.get();

    expect(onResponse).toHaveBeenCalledWith({
      response: expect.any(Response),
      url: "http://localhost:3000/test",
      options: expect.objectContaining({
        method: "GET",
      }),
    });
  });

  it("should allow modifying the response in onResponse", async () => {
    fetchMock.mockResponse("Original");
    const onResponse = vi.fn((data) => {
      return new Response("Modified", {
        status: 201,
      });
    });

    const testApp = new Noki([
      new RouteBuilder().handle("GET", "/test", ({ res }) =>
        res.json({ message: "Hello, World!" }),
      ),
    ]);
    const testClient = client<typeof testApp>("http://localhost:3000", {
      onResponse,
    });

    const response = await testClient.test.get();

    expect(response.data).toBe("Modified");
    expect(response.status).toBe(201);
  });

  it("should call onResponse for each request", async () => {
    fetchMock.mockResponse("Test");
    const onResponse = vi.fn((data) => data.response);

    const testApp = new Noki([
      new RouteBuilder().handle("GET", "/test", ({ res }) =>
        res.json({ message: "Hello, World!" }),
      ),
    ]);
    const testClient = client<typeof testApp>("http://localhost:3000", {
      onResponse,
    });

    await testClient.test.get();
    await testClient.test.get();
    await testClient.test.get();

    expect(onResponse).toHaveBeenCalledTimes(3);
  });
});
