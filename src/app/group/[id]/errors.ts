import { Schema } from 'effect'

export class NameRequired extends Schema.TaggedError<NameRequired>()(
	'NameRequiredError',
	{
		message: Schema.String,
	},
) {}
