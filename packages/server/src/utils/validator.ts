import { type InferOutput, parseAsync } from "valibot";
import type { AnySchema } from "../types";

export async function validate<Schema extends AnySchema>(schema: Schema, data: unknown): Promise<InferOutput<Schema>> {
  return await parseAsync(schema, data);
}
