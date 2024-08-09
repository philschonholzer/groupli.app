'use server'

import { DbError } from '@/adapter/db'
import { runAction } from '@/adapter/effect'
import { Next } from '@/adapter/next'
import { Group, Person, Round } from '@/domain'
import { Schema } from '@effect/schema'
import { Effect } from 'effect'
import { NameRequired, SchemaError } from './errors'

type AddIdleTag<T> = Schema.Schema.Encoded<T> | { _tag: 'Idle' }
const AddPersonSchema = Schema.Exit({
	success: Schema.Undefined,
	failure: Schema.Union(DbError, NameRequired, Person.TooManyPersonsInGroup),
	defect: Schema.Void,
})

export async function addPerson(
	groupId: Group.GroupId,
	prevState: AddIdleTag<typeof AddPersonSchema>,
	formData: FormData,
) {
	return Effect.gen(function* () {
		const name = formData.get('name') as string
		if (!name) {
			return yield* new NameRequired({ message: 'The name is required... 😅' })
		}
		yield* Person.add(name, groupId)
		yield* Next.revalidatePath(`/group/${groupId}`)
	}).pipe(
		Effect.withSpan('addPerson'),
		runAction({
			schema: AddPersonSchema,
		}),
	)
}

export async function newRound(
	groupId: Group.GroupId,
	personIds: Person.PersonId[],
) {
	return Effect.gen(function* () {
		const { round } = yield* Round.newRound(groupId, personIds)
		yield* Next.revalidatePath(`/group/${groupId}`)
		return round
	}).pipe(
		Effect.withSpan('newRound'),
		runAction({
			schema: Schema.Exit({
				success: Schema.Struct({
					id: Schema.Number,
					at: Schema.String,
					group: Schema.String,
				}),
				failure: Schema.Union(DbError, Round.NotEnoughPersonsForRound),
				defect: Schema.Void,
			}),
		}),
	)
}

export async function shufflePairingsInRound(groupId: Group.GroupId) {
	return Effect.gen(function* () {
		const { round } = yield* Round.shufflePairings(groupId)
		yield* Next.revalidatePath(`/group/${groupId}`)
		return round
	}).pipe(
		Effect.withSpan('newRound'),
		runAction({
			schema: Schema.Exit({
				success: Schema.Struct({
					id: Schema.Number,
					at: Schema.String,
					group: Schema.String,
				}),
				failure: Schema.Union(DbError, Round.NoRoundFound),
				defect: Schema.Void,
			}),
		}),
	)
}

const UpdateNameSchema = Schema.Exit({
	success: Schema.Void,
	failure: Schema.Union(DbError, NameRequired),
	defect: Schema.Void,
})

export async function renameGroup(
	groupId: Group.GroupId,
	prevState: AddIdleTag<typeof UpdateNameSchema>,
	formData: FormData,
) {
	return Effect.gen(function* () {
		const newName = formData.get('name') as string | null
		yield* Group.rename(groupId, newName)
		yield* Next.revalidatePath(`/group/${groupId}`)
	}).pipe(
		Effect.withSpan('renameGroup'),
		runAction({
			schema: UpdateNameSchema,
		}),
	)
}

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

const FormDataSchema = <A, I extends Record<string, string>, R>(
	schema: Schema.Schema<A, I, R>,
) => Schema.compose(RecordFromFormData, schema, { strict: false })

const RenamePersonInputSchema = Schema.Struct({
	personId: Person.Person.fields.id,
	groupId: Group.Group.fields.id,
	formData: FormDataSchema(
		Schema.Struct({
			name: Schema.String.annotations({
				title: 'Member',
				message: () => 'not a string',
			}).pipe(Schema.minLength(2, { message: (s) => `${s.actual} is too short` })),
		}),
	),
}).annotations({ title: 'Rename Person' })

const RenamePersonOutputSchema = Schema.Exit({
	success: Schema.Void,
	failure: Schema.Union(DbError, NameRequired, SchemaError),
	defect: Schema.Void,
})

type ExitSuccessValue<
	A extends { _tag: 'Success'; value: O } | { _tag: 'Failure' },
	O = unknown,
> = Extract<A, { _tag: 'Success' }>['value']
type ExitFailCause<
	A extends
		| { _tag: 'Success' }
		| {
				_tag: 'Failure'
				cause: C
		  },
	C = unknown,
> = Extract<A, { _tag: 'Failure' }>['cause']

type CauseFail<
	A extends
		| { _tag: 'Fail'; error: E }
		| { _tag: 'Empty' }
		| { _tag: 'Die' }
		| { _tag: 'Interrupt' }
		| { _tag: 'Parallel' }
		| { _tag: 'Sequential' },
	E = unknown,
> = Extract<A, { _tag: 'Fail' }>['error']

const action =
	<
		SI extends Schema.Schema.Any,
		SO extends Schema.Schema.AnyNoContext,
		FA,
		FB,
		FC,
		FD,
		FE,
		I extends
			| [FA]
			| [FA, FB]
			| [FA, FB, FC]
			| [FA, FB, FC, FD]
			| [FA, FB, FC, FD, FE],
	>(args: {
		input: {
			schema: SI
			transformer?: (...input: I) => Schema.Schema.Encoded<SI>
		}
		logic: (
			input: Schema.Schema.Type<SI>,
		) => Effect.Effect<
			ExitSuccessValue<Schema.Schema.Type<SO>>,
			CauseFail<ExitFailCause<Schema.Schema.Type<SO>>>,
			any
		>
		output: SO
	}) =>
	async (...initialValue: I): Promise<AddIdleTag<SO>> => {
		const input = args.input.transformer
			? args.input.transformer(...initialValue)
			: initialValue

		const result = Schema.decode(args.input.schema)(input).pipe(
			Effect.flatMap(args.logic),
			runAction({
				schema: args.output,
			}),
		)
		return result
	}

const a = action({
	input: {
		schema: RenamePersonInputSchema,
		transformer: (
			personId: Person.PersonId,
			groupId: Group.GroupId,
			prevState: AddIdleTag<typeof RenamePersonOutputSchema>,
			formData: FormData,
		) => ({ personId, groupId, formData }),
	},
	logic: ({ personId, groupId, formData }) =>
		Effect.gen(function* () {
			yield* Person.rename(personId, formData.name)
			yield* Next.revalidatePath(`/group/${groupId}`)
		}),
	output: RenamePersonOutputSchema,
})
export const renamePerson = a

export const removePerson = async (
	personId: Person.PersonId,
	groupId: Group.GroupId,
) =>
	Effect.gen(function* () {
		yield* Person.removePerson(personId)
		yield* Next.revalidatePath(`/group/${groupId}`)
	}).pipe(
		Effect.withSpan('removePerson'),
		runAction({
			schema: Schema.Exit({
				success: Schema.Void,
				failure: Schema.Union(DbError),
				defect: Schema.Void,
			}),
		}),
	)

export async function removePersonFromRound(
	personId: Person.PersonId,
	roundId: Round.RoundId,
	groupId: Group.GroupId,
) {
	return Round.removePersonFromRound(personId, roundId, groupId).pipe(
		Effect.tap(() => Next.revalidatePath(`/group/${groupId}`)),
		Effect.withSpan('removePersonFromRound'),
		runAction({
			schema: Schema.Exit({
				success: Schema.Option(
					Schema.Array(Schema.Tuple(Schema.Number, Schema.Number)),
				),
				failure: Schema.Union(DbError, Round.NotEnoughPersonsForRound),
				defect: Schema.Void,
			}),
		}),
	)
}
