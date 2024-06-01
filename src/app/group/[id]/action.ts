'use server'

import { DbError } from '@/adapter/db'
import { runAction } from '@/adapter/effect'
import { Group, Person, Round } from '@/domain'
import { TooManyPersonsInGroup, type PersonId } from '@/domain/person'
import { Schema } from '@effect/schema'
import { Effect } from 'effect'
import { NameRequired } from './errors'

type AddIdleTag<T> = Schema.Schema.Encoded<T> | { _tag: 'Idle' }
const AddPersonSchema = Schema.Exit({
	success: Schema.Undefined,
	failure: Schema.Union(DbError, NameRequired, TooManyPersonsInGroup),
})

export async function addPerson(
	groupId: string,
	prevState: AddIdleTag<typeof AddPersonSchema>,
	formData: FormData,
) {
	return Effect.gen(function* () {
		const name = formData.get('name') as string
		if (!name) {
			return yield* new NameRequired({ message: 'The name is required... 😅' })
		}
		yield* Person.add(name, groupId)
	}).pipe(
		Effect.withSpan('addPerson'),
		runAction({
			schema: AddPersonSchema,
			revalidatePath: () => `/group/${groupId}`,
		}),
	)
}

export async function newRound(groupId: string, personIds: PersonId[]) {
	return Effect.gen(function* () {
		const { round } = yield* Round.newRound(groupId, personIds)
		return round
	}).pipe(
		Effect.withSpan('newRound'),
		runAction({
			revalidatePath: () => `/group/${groupId}`,
			schema: Schema.Exit({
				success: Schema.Struct({
					id: Schema.Number,
					at: Schema.String,
					group: Schema.String,
				}),
				failure: DbError,
			}),
		}),
	)
}

const UpdateNameSchema = Schema.Exit({
	success: Schema.Void,
	failure: Schema.Union(DbError, NameRequired),
})

export async function renameGroup(
	groupId: string,
	prevState: AddIdleTag<typeof UpdateNameSchema>,
	formData: FormData,
) {
	return Effect.gen(function* () {
		const newName = formData.get('name') as string | null
		yield* Group.rename(groupId, newName)
	}).pipe(
		Effect.withSpan('renameGroup'),
		runAction({
			schema: UpdateNameSchema,
			revalidatePath: () => `/group/${groupId}`,
		}),
	)
}

const RenamePersonSchema = Schema.Exit({
	success: Schema.Void,
	failure: Schema.Union(DbError, NameRequired),
})
export const renamePerson = async (
	personId: PersonId,
	groupId: string,
	prevState: AddIdleTag<typeof RenamePersonSchema>,
	formData: FormData,
) =>
	Effect.gen(function* () {
		const newName = formData.get('name') as string | null
		yield* Person.rename(personId, newName)
	}).pipe(
		Effect.withSpan('renamePerson'),
		runAction({
			schema: RenamePersonSchema,
			revalidatePath: () => `/group/${groupId}`,
		}),
	)

export const removePerson = async (personId: PersonId, groupId: string) =>
	Effect.gen(function* () {
		yield* Person.removePerson(personId)
	}).pipe(
		Effect.withSpan('removePerson'),
		runAction({
			schema: Schema.Exit({
				success: Schema.Void,
				failure: Schema.Union(DbError),
			}),
			revalidatePath: () => `/group/${groupId}`,
		}),
	)

export async function removePersonFromRound(
	personId: PersonId,
	roundId: number,
	groupId: string,
) {
	return Round.removePersonFromRound(personId, roundId, groupId).pipe(
		Effect.withSpan('removePersonFromRound'),
		runAction({
			schema: Schema.Exit({
				success: Schema.Option(
					Schema.Array(Schema.Tuple(Schema.Number, Schema.Number)),
				),
				failure: Schema.Union(DbError, NameRequired),
			}),
			revalidatePath: () => `/group/${groupId}`,
		}),
	)
}
