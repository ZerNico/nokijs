import { describe, expect, it } from "vitest";
import { parseCookies, serializeCookie } from "../../src/utils/cookies";

describe("parseCookies", () => {
  it("should parse cookies string into an object", () => {
    const cookies = "name=John; age=30";
    const result = parseCookies(cookies);
    expect(result).toEqual({ name: "John", age: "30" });
  });

  it("should handle empty cookie string", () => {
    const cookies = "";
    const result = parseCookies(cookies);
    expect(result).toEqual({});
  });

  it("should trim spaces around keys and values", () => {
    const cookies = " name = John ; age = 30 ";
    const result = parseCookies(cookies);
    expect(result).toEqual({ name: "John", age: "30" });
  });

  it("should ignore cookies without values", () => {
    const cookies = "name=John; age=; gender";
    const result = parseCookies(cookies);
    expect(result).toEqual({ name: "John" });
  });

  it("should parse quoted values", () => {
    const cookies = 'name="John Doe"; age=30';
    const result = parseCookies(cookies);
    expect(result).toEqual({ name: "John Doe", age: "30" });
  });

  it("should handle multiple cookies with same name", () => {
    const cookies = "name=John; name=Jane";
    const result = parseCookies(cookies);
    expect(result).toEqual({ name: "Jane" });
  });

  it("should handle values with spaces", () => {
    const cookies = "name=John Doe";
    const result = parseCookies(cookies);
    expect(result).toEqual({ name: "John Doe" });
  });
});

describe("serializeCookie", () => {
  it("should serialize basic cookie without options", () => {
    const result = serializeCookie("name", "John");
    expect(result).toBe("name=John");
  });

  it("should include domain when provided", () => {
    const result = serializeCookie("name", "John", { domain: "example.com" });
    expect(result).toBe("name=John; Domain=example.com");
  });

  it("should include expires when provided", () => {
    const date = new Date("2024-01-01");
    const result = serializeCookie("name", "John", { expires: date });
    expect(result).toBe(`name=John; Expires=${date.toUTCString()}`);
  });

  it("should include httpOnly flag", () => {
    const result = serializeCookie("name", "John", { httpOnly: true });
    expect(result).toBe("name=John; HttpOnly");
  });

  it("should include maxAge when provided", () => {
    const result = serializeCookie("name", "John", { maxAge: 3600 });
    expect(result).toBe("name=John; Max-Age=3600");
  });

  it("should include path when provided", () => {
    const result = serializeCookie("name", "John", { path: "/" });
    expect(result).toBe("name=John; Path=/");
  });

  it("should include secure flag", () => {
    const result = serializeCookie("name", "John", { secure: true });
    expect(result).toBe("name=John; Secure");
  });

  it("should include sameSite when provided", () => {
    const result = serializeCookie("name", "John", { sameSite: "Strict" });
    expect(result).toBe("name=John; SameSite=Strict");
  });

  it("should handle multiple options", () => {
    const result = serializeCookie("name", "John", {
      secure: true,
      httpOnly: true,
      path: "/",
      sameSite: "Strict"
    });
    expect(result).toBe("name=John; HttpOnly; Path=/; Secure; SameSite=Strict");
  });

  it("should handle values with spaces", () => {
    const result = serializeCookie("name", "John Doe");
    expect(result).toBe("name=John Doe");
  });
});
