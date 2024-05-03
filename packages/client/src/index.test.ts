import { afterEach, describe, expect, it, vi } from "vitest";
import { client } from ".";

global.fetch = vi.fn();
const mockFetch = vi.mocked(global.fetch);

describe("client", () => {
  afterEach(() => {
    mockFetch.mockClear();
  });

  it("should create a client", () => {
    const c = client("http://localhost:3000");
    expect(c).toBeDefined();
  });

  it("should fetch a route", async () => {
    mockFetch.mockResolvedValue(new Response());

    const c = client("http://localhost:3000") as any;
    await c.api.hello.get();
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/hello",
      expect.objectContaining({ method: "get" }),
    );
  });

  it("should allow fetching the index route", async () => {
    mockFetch.mockResolvedValue(new Response());

    const c = client("http://localhost:3000") as any;
    await c.api.hello.index.get();
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/hello",
      expect.objectContaining({ method: "get" }),
    );
  });

  it("should fetch a route with body", async () => {
    mockFetch.mockResolvedValue(new Response());

    const c = client("http://localhost:3000") as any;
    await c.api.hello.post({ body: "test" });
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/hello",
      expect.objectContaining({ method: "post", body: "test" }),
    );
  });

  it("should fetch a route with query", async () => {
    mockFetch.mockResolvedValue(new Response());

    const c = client("http://localhost:3000") as any;
    await c.api.hello.get({ query: { test: "test" } });
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/hello?test=test",
      expect.objectContaining({ method: "get" }),
    );
  });

  it("should allow custom methods", async () => {
    mockFetch.mockResolvedValue(new Response());

    const c = client("http://localhost:3000") as any;
    await c.api.hello.qwerty();
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/hello",
      expect.objectContaining({ method: "qwerty" }),
    );
  });

  it("should allow fetching directly on client", async () => {
    mockFetch.mockResolvedValue(new Response());

    const c = client("http://localhost:3000") as any;
    await c.get();

    expect(mockFetch).toHaveBeenCalledWith("http://localhost:3000", expect.objectContaining({ method: "get" }));
  });

  it("should replace :params", async () => {
    mockFetch.mockResolvedValue(new Response());

    const c = client("http://localhost:3000") as any;
    await c.api.test[":id"].get({ params: { id: "213" } });

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/test/213",
      expect.objectContaining({ method: "get" }),
    );
  });

  it("should use the correct Content-Type", async () => {
    mockFetch.mockResolvedValue(new Response());

    const c = client("http://localhost:3000") as any;
    await c.api.hello.post({ body: { test: "test" } });
    await c.api.hello.post({ body: "test" });

    const jsonFetchArgs = mockFetch.mock.calls[0] as any;
    expect(jsonFetchArgs[1]?.headers?.get("Content-Type")).toBe("application/json");

    const textFetchArgs = mockFetch.mock.calls[1] as any;
    expect(textFetchArgs[1]?.headers?.get("Content-Type")).toBe("text/plain");
  });

  it("should use custom headers", async () => {
    mockFetch.mockResolvedValue(new Response());

    const c = client("http://localhost:3000") as any;
    await c.api.hello.get({ headers: { "X-Test": "test" } });

    const fetchArgs = mockFetch.mock.calls[0] as any;
    expect(fetchArgs[1]?.headers?.get("X-Test")).toBe("test");
  });

  it("should override Content-Type", async () => {
    mockFetch.mockResolvedValue(new Response());

    const c = client("http://localhost:3000") as any;
    await c.api.hello.post({ body: "test", headers: { "Content-Type": "application/json" } });

    const fetchArgs = mockFetch.mock.calls[0] as any;
    expect(fetchArgs[1]?.headers?.get("Content-Type")).toBe("application/json");
  });

  it("should return a TypedResponse", async () => {
    mockFetch.mockResolvedValue(new Response("Hello, World!"));

    const c = client("http://localhost:3000") as any;
    const res = await c.api.hello.get();

    expect(res.data).toBe("Hello, World!");
    expect(res.status).toBe(200);
    expect(res.headers).toBeInstanceOf(Headers);
    expect(res.response).toBeInstanceOf(Response);
  });

  it("should return a TypedResponse with JSON body", async () => {
    mockFetch.mockResolvedValue(
      new Response('{"test": "Hello, World!"}', { headers: { "Content-Type": "application/json" } }),
    );

    const c = client("http://localhost:3000") as any;
    const res = await c.api.hello.get();

    expect(res.data).toEqual({ test: "Hello, World!" });
  });

  it("should return a TypedResponse with status code", async () => {
    mockFetch.mockResolvedValue(new Response("Hello, World!", { status: 201 }));

    const c = client("http://localhost:3000") as any;
    const res = await c.api.hello.get();

    expect(res.status).toBe(201);
  });

  it("should throw a NokiClientError on non-2xx status", async () => {
    mockFetch.mockResolvedValue(new Response("Not Found", { status: 404 }));

    const c = client("http://localhost:3000") as any;
    await expect(c.api.hello.get()).rejects.toThrowError("Request failed with status code 404");
  });
});
