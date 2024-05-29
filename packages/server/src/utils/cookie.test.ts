import { describe, expect, it } from "vitest";
import { type CookieOptions, parseCookie, serializeCookie } from "./cookie";

describe("parseCookie", () => {
  it("should return an empty object when input is an empty string", () => {
    expect(parseCookie("")).toEqual({});
  });

  it("should parse a single cookie", () => {
    const cookie = "name=value";
    expect(parseCookie(cookie)).toEqual({ name: "value" });
  });

  it("should parse multiple cookies", () => {
    const cookie = "name=value; name2=value2";
    expect(parseCookie(cookie)).toEqual({ name: "value", name2: "value2" });
  });

  it("should handle cookies with whitespace around delimiter", () => {
    const cookie = "name1 = value1; name2 = value2";
    expect(parseCookie(cookie)).toEqual({ name1: "value1", name2: "value2" });
  });

  it("should handle cookies with special characters in values", () => {
    const cookie = "name=value%20with%20special%20characters";
    expect(parseCookie(cookie)).toEqual({
      name: "value with special characters",
    });
  });

  it("should handle cookies with empty values", () => {
    const cookie = "name1=; name2=; name3=";
    expect(parseCookie(cookie)).toEqual({ name1: "", name2: "", name3: "" });
  });

  it("should handle cookies with empty key", () => {
    const cookie = "=value1;";
    expect(parseCookie(cookie)).toEqual({ "": "value1" });
  });
});

describe("serializeCookie", () => {
  it("should serialize a cookie with only name and value", () => {
    const result = serializeCookie("test", "value");
    expect(result).toBe("test=value");
  });

  it("should serialize a cookie with an expiration date", () => {
    const date = new Date("2024-12-31T23:59:59Z");
    const result = serializeCookie("test", "value", { expires: date });
    expect(result).toBe(`test=value; Expires=${date.toUTCString()}`);
  });

  it("should serialize a cookie with max age", () => {
    const result = serializeCookie("test", "value", { maxAge: 3600 });
    expect(result).toBe("test=value; Max-Age=3600");
  });

  it("should serialize a cookie with a domain", () => {
    const result = serializeCookie("test", "value", { domain: "example.com" });
    expect(result).toBe("test=value; Domain=example.com");
  });

  it("should serialize a cookie with a path", () => {
    const result = serializeCookie("test", "value", { path: "/some/path" });
    expect(result).toBe("test=value; Path=/some/path");
  });

  it("should serialize a cookie with secure flag", () => {
    const result = serializeCookie("test", "value", { secure: true });
    expect(result).toBe("test=value; Secure");
  });

  it("should serialize a cookie with HttpOnly flag", () => {
    const result = serializeCookie("test", "value", { httpOnly: true });
    expect(result).toBe("test=value; HttpOnly");
  });

  it("should serialize a cookie with SameSite attribute", () => {
    const result = serializeCookie("test", "value", { sameSite: "Strict" });
    expect(result).toBe("test=value; SameSite=Strict");
  });

  it("should serialize a cookie with multiple options", () => {
    const date = new Date("2024-12-31T23:59:59Z");
    const options: CookieOptions = {
      expires: date,
      maxAge: 3600,
      domain: "example.com",
      path: "/some/path",
      secure: true,
      httpOnly: true,
      sameSite: "Lax",
    };
    const result = serializeCookie("test", "value", options);
    expect(result).toBe(
      `test=value; Expires=${date.toUTCString()}; Max-Age=3600; Domain=example.com; Path=/some/path; Secure; HttpOnly; SameSite=Lax`,
    );
  });
});
