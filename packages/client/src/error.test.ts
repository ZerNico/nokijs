import { describe, expect, it } from "vitest";
import type { an } from "vitest/dist/reporters-LqC_WI4d.js";
import { NokiClientError } from "./error";
import type { TypedResponse } from "./types";

describe("NokiClientError", () => {
  it("should create an instance of NokiClientError", () => {
    const response = {
      status: 404,
      data: "test",
    } as TypedResponse<any>;

    const error = new NokiClientError({ response, path: "" });

    expect(error).toBeInstanceOf(NokiClientError);
  });

  it("should return the response data", () => {
    const response = {
      status: 404,
      data: "test",
    } as TypedResponse<any>;

    const error = new NokiClientError({ response, path: "" });

    expect(error.data).toBe("test");
  });
});
