import { type Output, parseAsync } from "valibot";
import type { AnySchema } from "../types";

export async function validate<Schema extends AnySchema>(schema: Schema, data: unknown): Promise<Output<Schema>> {
  return await parseAsync(schema, data);
}
