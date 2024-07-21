'use server'

import { DbError } from '@/adapter/db'
import { runAction } from '@/adapter/effect'
import { Next } from '@/adapter/next'
import { Group, Person, Round } from '@/domain'
import { Schema } from '@effect/schema'
import { Effect } from 'effect'
import { NameRequired } from './errors'

type AddIdleTag<T> = Schema.Schema.Encoded<T> | { _tag: 'Idle' }
const AddPersonSchema = Schema.Exit({
	success: Schema.Undefined,
	failure: Schema.Union(DbError, NameRequired, Person.TooManyPersonsInGroup),
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
			}),
		}),
	)
}

const UpdateNameSchema = Schema.Exit({
	success: Schema.Void,
	failure: Schema.Union(DbError, NameRequired),
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

const RenamePersonSchema = Schema.Exit({
	success: Schema.Void,
	failure: Schema.Union(DbError, NameRequired),
})
export const renamePerson = async (
	personId: Person.PersonId,
	groupId: Group.GroupId,
	prevState: AddIdleTag<typeof RenamePersonSchema>,
	formData: FormData,
) =>
	Effect.gen(function* () {
		const newName = formData.get('name') as string | null
		yield* Person.rename(personId, newName)
		yield* Next.revalidatePath(`/group/${groupId}`)
	}).pipe(
		Effect.withSpan('renamePerson'),
		runAction({
			schema: RenamePersonSchema,
		}),
	)

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
			}),
		}),
	)
}
