'use server'

import { DbError } from '@/adapter/db'
import { runAction } from '@/adapter/effect'
import { Group, Person, Round } from '@/domain'
import type { PersonId } from '@/domain/person'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { Schema } from '@effect/schema'
import { Effect } from 'effect'
import { NameRequired } from './errors'

type AddIdleTag<T> = Schema.Schema.Encoded<T> | { _tag: 'Idle' }
const AddPersonSchema = Schema.Exit({
	success: Schema.Undefined,
	failure: Schema.Union(DbError, NameRequired),
})

type AddPersonState = AddIdleTag<typeof AddPersonSchema>

export async function addPerson(
	groupId: string,
	prevState: AddPersonState,
	formData: FormData,
): Promise<AddPersonState> {
	return Effect.gen(function* () {
		const name = formData.get('name') as string
		if (!name) {
			return yield* new NameRequired({ message: 'The name is required... 😅' })
		}
		yield* Person.addPerson(name, groupId)
	}).pipe(
		runAction({
			db: getRequestContext().env.DB,
			schema: AddPersonSchema,
			revalidatePath: `/group/${groupId}`,
		}),
	)
}

export async function newRound(groupId: string, personIds: PersonId[]) {
	return Effect.gen(function* () {
		console.log('start newRound', groupId, personIds)

		const { round } = yield* Round.newRound(groupId, personIds)

		return round
	}).pipe(
		runAction({
			db: getRequestContext().env.DB,
			revalidatePath: `/group/${groupId}`,
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
	success: Schema.Undefined,
	failure: Schema.Union(DbError, NameRequired),
})

type UpdateNameState = AddIdleTag<typeof UpdateNameSchema>

export async function updateName(
	groupId: string,
	prevState: UpdateNameState,
	formData: FormData,
): Promise<UpdateNameState> {
	return Effect.gen(function* () {
		const newName = formData.get('name') as string
		if (!newName) {
			return yield* new NameRequired({
				message: 'The group name can not be empty... 😅',
			})
		}
		yield* Group.Repository.updateName(groupId, newName)
	}).pipe(
		runAction({
			db: getRequestContext().env.DB,
			schema: UpdateNameSchema,
			revalidatePath: `/group/${groupId}`,
		}),
	)
}

export async function removePersonFromRound(
	personId: PersonId,
	roundId: number,
	groupId: string,
) {
	return Round.removePersonFromRound(personId, roundId, groupId).pipe(
		runAction({
			db: getRequestContext().env.DB,
			schema: Schema.Exit({
				success: Schema.Option(
					Schema.Array(Schema.Tuple(Schema.Number, Schema.Number)),
				),
				failure: Schema.Union(DbError, NameRequired),
			}),
			revalidatePath: `/group/${groupId}`,
		}),
	)
}
