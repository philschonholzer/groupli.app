'use server'

import { Effect, Schema } from 'effect'
import { DbError } from '@/adapter/db'
import { runAction } from '@/adapter/effect'
import { Next } from '@/adapter/next'
import { Group, Person, Round } from '@/domain'
import { NameRequired } from './errors'

type AddIdleTag<T extends { readonly Iso: unknown }> =
	| T['Iso']
	| { _tag: 'Idle' }
const AddPersonSchema = Schema.Exit(
	Schema.Undefined,
	Schema.Union([DbError, NameRequired, Person.TooManyPersonsInGroup]),
	Schema.Void,
)

export async function addPerson(
	groupId: Group.GroupId,
	_prevState: AddIdleTag<typeof AddPersonSchema>,
	formData: FormData,
) {
	return runAction({ schema: AddPersonSchema })(
		Effect.gen(function* () {
			const name = formData.get('name') as string
			if (!name) {
				return yield* new NameRequired({
					message: 'The name is required... 😅',
				})
			}
			yield* Person.add(name, groupId)
			yield* Next.revalidatePath(`/group/${groupId}`)
		}).pipe(Effect.withSpan('addPerson')),
	)
}

export async function newRound(
	groupId: Group.GroupId,
	personIds: Person.PersonId[],
) {
	return runAction({
		schema: Schema.Exit(
			Schema.Struct({
				id: Schema.Number,
				at: Schema.String,
				group: Schema.String,
			}),
			Schema.Union([DbError, Round.NotEnoughPersonsForRound]),
			Schema.Void,
		),
	})(
		Effect.gen(function* () {
			const { round } = yield* Round.newRound(groupId, personIds)
			yield* Next.revalidatePath(`/group/${groupId}`)
			return round
		}).pipe(Effect.withSpan('newRound')),
	)
}

export async function shufflePairingsInRound(groupId: Group.GroupId) {
	return runAction({
		schema: Schema.Exit(
			Schema.Struct({
				id: Schema.Number,
				at: Schema.String,
				group: Schema.String,
			}),
			Schema.Union([DbError, Round.NoRoundFound]),
			Schema.Void,
		),
		returnVoid: true,
	})(
		Effect.gen(function* () {
			const { round } = yield* Round.shufflePairings(groupId)
			yield* Next.revalidatePath(`/group/${groupId}`)
			return round
		}).pipe(Effect.withSpan('newRound')),
	)
}

const UpdateNameSchema = Schema.Exit(
	Schema.Void,
	Schema.Union([DbError, NameRequired]),
	Schema.Void,
)

export async function renameGroup(
	groupId: Group.GroupId,
	_prevState: AddIdleTag<typeof UpdateNameSchema>,
	formData: FormData,
) {
	return runAction({ schema: UpdateNameSchema })(
		Effect.gen(function* () {
			const newName = formData.get('name') as string | null
			yield* Group.rename(groupId, newName)
			yield* Next.revalidatePath(`/group/${groupId}`)
		}).pipe(Effect.withSpan('renameGroup')),
	)
}

const RenamePersonSchema = Schema.Exit(
	Schema.Void,
	Schema.Union([DbError, NameRequired]),
	Schema.Void,
)
export const renamePerson = async (
	personId: Person.PersonId,
	groupId: Group.GroupId,
	_prevState: AddIdleTag<typeof RenamePersonSchema>,
	formData: FormData,
) =>
	runAction({ schema: RenamePersonSchema })(
		Effect.gen(function* () {
			const newName = formData.get('name') as string | null
			yield* Person.rename(personId, newName)
			yield* Next.revalidatePath(`/group/${groupId}`)
		}).pipe(Effect.withSpan('renamePerson')),
	)

export const removePerson = async (
	personId: Person.PersonId,
	groupId: Group.GroupId,
) =>
	runAction({
		schema: Schema.Exit(Schema.Void, Schema.Union([DbError]), Schema.Void),
		returnVoid: true,
	})(
		Effect.gen(function* () {
			yield* Person.removePerson(personId)
			yield* Next.revalidatePath(`/group/${groupId}`)
		}).pipe(Effect.withSpan('removePerson')),
	)

export async function removePersonFromRound(
	personId: Person.PersonId,
	roundId: Round.RoundId,
	groupId: Group.GroupId,
) {
	return runAction({
		schema: Schema.Exit(
			Schema.Option(Schema.Array(Schema.Tuple([Schema.Number, Schema.Number]))),
			Schema.Union([DbError, Round.NotEnoughPersonsForRound]),
			Schema.Void,
		),
	})(
		Round.removePersonFromRound(personId, roundId, groupId).pipe(
			Effect.tap(() => Next.revalidatePath(`/group/${groupId}`)),
			Effect.withSpan('removePersonFromRound'),
		),
	)
}
