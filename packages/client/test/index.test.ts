import { Noki, RouteBuilder } from "@nokijs/server";
import { instance, object, string } from "valibot";
import {
  afterEach,
  beforeAll,
  describe,
  expect,
  expectTypeOf,
  it,
  vi,
} from "vitest";
import { client } from "../src";

beforeAll(() => {
  global.File = class File {
    name: string;
    content: Blob;
    constructor(bits: BlobPart[], name: string) {
      this.content = new Blob(bits);
      this.name = name;
    }
  } as any;
});

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

  it("should automatically convert to form data when body contains files", async () => {
    fetchMock.mockResponse(JSON.stringify({ success: true }));

    const testApp = new Noki([
      new RouteBuilder()
        .body(object({ file: instance(File), name: string() }))
        .handle("POST", "/upload", ({ res }) => res.json({ success: true })),
    ]);
    const testClient = client<typeof testApp>("http://localhost:3000");

    const file = new File(["test"], "test.txt");
    const response = await testClient.upload.post({
      body: {
        file,
        name: "Test File",
      },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/upload",
      expect.objectContaining({
        method: "POST",
        body: expect.any(FormData),
        headers: expect.objectContaining({}),
      }),
    );

    const requestBody = fetchMock.mock.calls[0]?.[1]?.body as FormData;
    expect(requestBody.get("name")).toBe('"Test File"');
  });

  it("should use custom fetch implementation when provided", async () => {
    const customFetch = vi.fn(() => Promise.resolve(new Response("Custom Response")));
    
    const testApp = new Noki([
      new RouteBuilder().handle("GET", "/test", ({ res }) =>
        res.json({ message: "Hello, World!" }),
      ),
    ]);
    const testClient = client<typeof testApp>("http://localhost:3000", {
      fetch: customFetch,
    });

    const response = await testClient.test.get();

    expect(customFetch).toHaveBeenCalledWith(
      "http://localhost:3000/test",
      expect.objectContaining({
        method: "GET",
      }),
    );
    expect(response.data).toBe("Custom Response");
  });

  it("should apply default fetchOptions to all requests", async () => {
    fetchMock.mockResponse("Test Response");
    
    const testApp = new Noki([
      new RouteBuilder().handle("GET", "/test", ({ res }) =>
        res.json({ message: "Hello, World!" }),
      ),
    ]);
    const testClient = client<typeof testApp>("http://localhost:3000", {
      fetchOptions: {
        credentials: "include",
        mode: "cors",
        cache: "no-cache",
      },
    });

    await testClient.test.get();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/test",
      expect.objectContaining({
        method: "GET",
        credentials: "include",
        mode: "cors",
        cache: "no-cache",
      }),
    );
  });

  it("should allow request-specific options to override default fetchOptions", async () => {
    fetchMock.mockResponse("Test Response");
    
    const testApp = new Noki([
      new RouteBuilder().handle("GET", "/test", ({ res }) =>
        res.json({ message: "Hello, World!" }),
      ),
    ]);
    const testClient = client<typeof testApp>("http://localhost:3000", {
      fetchOptions: {
        credentials: "include",
        mode: "cors",
        cache: "no-cache",
      },
    });

    await testClient.test.get({
      credentials: "omit",
      cache: "force-cache",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/test",
      expect.objectContaining({
        method: "GET",
        credentials: "omit",
        mode: "cors",
        cache: "force-cache",
      }),
    );
  });
});
