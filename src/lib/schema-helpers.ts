import { Schema } from '@effect/schema'

const FormDataFromSelf = Schema.instanceOf(FormData).annotations({
	identifier: 'FormDataFromSelf',
})

const RecordFromFormData = Schema.transform(
	FormDataFromSelf,
	Schema.Record({ key: Schema.String, value: Schema.String }),
	{
		strict: false,
		decode: (formData) => Object.fromEntries(formData.entries()),
		encode: (data) => {
			const formData = new FormData()
			for (const [key, value] of Object.entries(data)) {
				formData.append(key, value)
			}
			return formData
		},
	},
).annotations({ identifier: 'RecordFromFormData' })

export const FormDataSchema = <A, I extends Record<string, string>, R>(
	schema: Schema.Schema<A, I, R>,
) => Schema.compose(RecordFromFormData, schema, { strict: false })
