import { describe, expect, expectTypeOf, it } from "vitest";
import { ResponseBuilder, TypedResponse } from "../src/response";

describe("ResponseBuilder", () => {
  it("should create a TypedResponse instance", () => {
    const builder = new ResponseBuilder();
    const body = { message: "Hello, world!" };
    const response = builder.json(body);

    expect(response).toBeInstanceOf(TypedResponse);
  });

  describe("json response", () => {
    it("should create a TypedResponse with JSON body", () => {
      const builder = new ResponseBuilder();
      const body = { message: "Hello, world!" };
      const response = builder.json(body);

      expect(response.headers.get("content-type")).toBe("application/json");
      expect(response.status).toBe(200);
      expect(response.toResponse().json()).resolves.toEqual(body);
      expectTypeOf(response).toMatchTypeOf<
        TypedResponse<{ message: string }, 200>
      >();
    });

    it("should create a TypedResponse a custom status", () => {
      const builder = new ResponseBuilder();
      const body = { message: "Hello, world!" };
      const response = builder.json(body, { status: 201 });

      expect(response.status).toBe(201);
      expectTypeOf(response).toMatchTypeOf<
        TypedResponse<{ message: string }, 201>
      >();
    });

    it("should create a TypedResponse with custom headers", () => {
      const builder = new ResponseBuilder();
      const body = { message: "Hello, world!" };
      const response = builder.json(body, {
        headers: { "x-custom-header": "custom-value" },
      });

      expect(response.headers.get("content-type")).toBe("application/json");
      expect(response.headers.get("x-custom-header")).toBe("custom-value");
      expectTypeOf(response).toMatchTypeOf<
        TypedResponse<{ message: string }, 200>
      >();
    });
  });

  describe("text response", () => {
    it("should create a TypedResponse with string body", () => {
      const builder = new ResponseBuilder();
      const body = "Hello, world!";
      const response = builder.text(body);

      expect(response.headers.get("content-type")).toBe("text/plain");
      expect(response.status).toBe(200);
      expect(response.toResponse().text()).resolves.toBe(body);
      expectTypeOf(response).toMatchTypeOf<TypedResponse<string, 200>>();
    });

    it("should create a TypedResponse a custom status", () => {
      const builder = new ResponseBuilder();
      const body = "Hello, world!";
      const response = builder.text(body, { status: 201 });

      expect(response.status).toBe(201);
      expectTypeOf(response).toMatchTypeOf<TypedResponse<string, 201>>();
    });

    it("should create a TypedResponse with custom headers", () => {
      const builder = new ResponseBuilder();
      const body = "Hello, world!";
      const response = builder.text(body, {
        headers: { "x-custom-header": "custom-value" },
      });

      expect(response.headers.get("content-type")).toBe("text/plain");
      expect(response.headers.get("x-custom-header")).toBe("custom-value");
      expectTypeOf(response).toMatchTypeOf<TypedResponse<string, 200>>();
    });
  });
});

describe("TypedResponse", () => {
  it("should create a Response instance", () => {
    const response = new TypedResponse("Hello, world!");

    expect(response).toBeInstanceOf(TypedResponse);
  });

  it("should create a Response instance with custom status", () => {
    const response = new TypedResponse("Hello, world!", { status: 201 });

    expect(response.status).toBe(201);
  });

  it("should create a Response instance with custom headers", () => {
    const response = new TypedResponse("Hello, world!", {
      headers: { "x-custom-header": "custom-value" },
    });

    expect(response.headers.get("x-custom-header")).toBe("custom-value");
  });

  it("should create a Response instance with custom status and headers", () => {
    const response = new TypedResponse("Hello, world!", {
      status: 201,
      headers: { "x-custom-header": "custom-value" },
    });

    expect(response.status).toBe(201);
    expect(response.headers.get("x-custom-header")).toBe("custom-value");
  });

  it("should allow converting to a Response instance", () => {
    const response = new TypedResponse("Hello, world!");

    expect(response.toResponse()).toBeInstanceOf(Response);
    expect(response.toResponse().text()).resolves.toBe("Hello, world!");
  });

  it("should allow converting to a Response instance with JSON body", () => {
    const response = new TypedResponse({ message: "Hello, world!" });

    expect(response.toResponse()).toBeInstanceOf(Response);
    expect(response.toResponse().json()).resolves.toEqual({
      message: "Hello, world!",
    });
  });

  it("should allow converting to a Response instance with custom status", () => {
    const response = new TypedResponse("Hello, world!", { status: 201 });

    expect(response.toResponse().status).toBe(201);
  });

  it("should allow converting to a Response instance with custom headers", () => {
    const response = new TypedResponse("Hello, world!", {
      headers: { "x-custom-header": "custom-value" },
    });

    expect(response.toResponse().headers.get("x-custom-header")).toBe(
      "custom-value",
    );
  });
});
