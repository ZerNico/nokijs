import { type Static, TSchema } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

export interface BaseValidator {
  transform?(schema: unknown): unknown;
  validate(schema: unknown, data: unknown): Promise<unknown>;
}

export type InferValidationSchema<Validator extends BaseValidator> = Parameters<Validator["validate"]>[0];
export type InferValidationValue<Validator extends BaseValidator> = Awaited<ReturnType<Validator["validate"]>>;

// TODO: Implement type compiler
export class TypeBoxValidator implements BaseValidator {
  transform(schema: TSchema): TSchema {
    return schema;
  }

  validate<Schema extends TSchema>(schema: TSchema, value: unknown): Promise<Static<Schema>> {
    if (Value.Check(schema, value)) {
      return Promise.resolve(value);
    }
    throw new Error("Invalid value");
  }
}
