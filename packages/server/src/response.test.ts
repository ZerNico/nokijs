import { describe, expect, it } from "vitest";
import { ResponseBuilder, TypedResponse } from "./response";

describe("ResponseBuilder", () => {
  it("should return a TypedResponse with text/plain content type", () => {
    const response = new ResponseBuilder().text("Hello, World!");
    expect(response).toBeInstanceOf(TypedResponse);

    expect(response.headers.get("content-type")).toBe("text/plain");
    expect(response.text()).resolves.toBe("Hello, World!");
  });

  it("should return a TypedResponse with application/json content type", () => {
    const response = new ResponseBuilder().json({ test: "test" });
    expect(response).toBeInstanceOf(TypedResponse);

    expect(response.headers.get("content-type")).toBe("application/json");
    expect(response.json()).resolves.toEqual({ test: "test" });
  });

  it("should return a TypedResponse with custom options", () => {
    const response = new ResponseBuilder().text("Hello, World!", {
      status: 404,
      statusText: "Not Found",
      headers: { "x-test": "test" },
    });
    expect(response.status).toBe(404);
    expect(response.statusText).toBe("Not Found");

    expect(response.headers.get("x-test")).toBe("test");
    expect(response.headers.get("content-type")).toBe("text/plain");
  });

  it("should use the pre defined options", () => {
    const builder = new ResponseBuilder();
    builder.status = 404;
    builder.statusText = "Not Found";
    builder.headers = new Headers({ "x-test": "test" });

    const response = builder.text("Hello, World!");
    expect(response.status).toBe(404);
    expect(response.statusText).toBe("Not Found");

    const headers = new Headers(response.headers);
    expect(headers.get("x-test")).toBe("test");
    expect(headers.get("content-type")).toBe("text/plain");
  });

  it("should set a cookie", () => {
    const response = new ResponseBuilder();
    response.setCookie("key", "value");

    expect(response.headers.get("set-cookie")).toBe("key=value");
  });

  it("should set a cookie with options", () => {
    const response = new ResponseBuilder();
    response.setCookie("key", "value", { maxAge: 60 });

    expect(response.headers.get("set-cookie")).toBe("key=value; Max-Age=60");
  });

  it("should delete a cookie", () => {
    const response = new ResponseBuilder();
    response.deleteCookie("key");

    expect(response.headers.get("set-cookie")).toBe("key=; Max-Age=-1");
  });
});

describe("TypedResponse", () => {
  it("should return a response with a string body", () => {
    const response = new TypedResponse("Hello, World!");
    expect(response.text()).resolves.toBe("Hello, World!");
  });

  it("should return a response with a JSON body", () => {
    const response = new TypedResponse({ test: "test" });
    expect(response.json()).resolves.toEqual({ test: "test" });
  });
});
