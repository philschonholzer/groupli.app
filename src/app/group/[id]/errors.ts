import { Schema } from '@effect/schema'

export class NameRequired extends Schema.TaggedError<NameRequired>()(
	'NameRequiredError',
	{
		message: Schema.String,
	},
) {}

export class SchemaError extends Schema.TaggedError<SchemaError>()(
	'SchemaError',
	{
		message: Schema.String,
	},
) {}
