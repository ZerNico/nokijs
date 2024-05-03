import { describe, expect, it, vi } from "vitest";
import { parseCookie } from "./cookie";

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
