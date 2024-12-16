import { object, string } from "valibot";
import { describe, expect, it } from "vitest";
import { SchemaError, validateInput } from "../../src/utils/validate";

describe("validate utils", () => {
  describe("SchemaError", () => {
    it("should create an error with issues", () => {
      const issues = [{ message: "Test error", path: ["test"] }];
      const error = new SchemaError(issues);

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("SchemaError");
      expect(error.message).toBe("Test error");
      expect(error.issues).toBe(issues);
    });
  });

  describe("validateInput", () => {
    it("should validate valid input", async () => {
      const schema = object({ name: string() });
      const data = { name: "test" };

      const result = await validateInput(schema, data);
      expect(result).toEqual(data);
    });

    it("should throw SchemaError for invalid input", async () => {
      const schema = object({ name: string() });
      const data = { name: 123 };

      await expect(validateInput(schema, data)).rejects.toThrow(SchemaError);
    });

    it("should throw SchemaError with correct issues", async () => {
      const schema = object({ name: string() });
      const data = { name: 123 };

      try {
        await validateInput(schema, data);
      } catch (error) {
        expect(error).toBeInstanceOf(SchemaError);
        const err = error as SchemaError;
        expect(err.issues).toBeDefined();
        expect(err.issues.length).toBeGreaterThan(0);
      }
    });
  });
});
