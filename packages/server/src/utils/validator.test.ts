import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { validate } from "./validator";

describe("validate", () => {
  it("returns the data on valid input", async () => {
    const result = await validate(
      v.object({
        test: v.string(),
      }),
      { test: "test" },
    );

    expect(result).toEqual({ test: "test" });
  });

  it("throws an error on invalid input", async () => {
    expect(() =>
      validate(
        v.object({
          test: v.string(),
        }),
        { test: 123 },
      ),
    ).rejects.toThrow();
  });
});
