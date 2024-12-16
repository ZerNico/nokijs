import type { StandardSchemaV1 } from "@standard-schema/spec";

export class SchemaError extends Error {
  public readonly issues: ReadonlyArray<StandardSchemaV1.Issue>;
  constructor(issues: ReadonlyArray<StandardSchemaV1.Issue>) {
    super(issues[0]?.message);
    this.name = "SchemaError";
    this.issues = issues;
  }
}

export async function validateInput<TSchema extends StandardSchemaV1>(
  schema: TSchema,
  data: unknown,
): Promise<StandardSchemaV1.InferOutput<TSchema>> {
  const result = await schema["~standard"].validate(data);
  if (result.issues) {
    throw new SchemaError(result.issues);
  }
  return result.value;
}
