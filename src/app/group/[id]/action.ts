'use server'

import { run } from '@/adapter/effect'
import { Group, Person, Round } from '@/domain'
import type { PersonId } from '@/domain/person'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { Effect } from 'effect'
import { revalidatePath } from 'next/cache'

export type State =
	| {
			kind: 'error'
			error: string
	  }
	| {
			kind: 'idle' | 'success'
	  }

export async function addPerson(
	groupId: string,
	prevState: State,
	formData: FormData,
): Promise<State> {
	return Effect.gen(function* () {
		const name = formData.get('name') as string
		if (!name) {
			return 'The name is required... 😅'
		}
		yield* Person.addPerson(name, groupId)
	})
		.pipe(
			Effect.catchAll((e) =>
				Effect.succeed(`Error ${JSON.stringify(e.cause)}`),
			),
			run(getRequestContext().env.DB),
		)
		.then((result) => {
			if (typeof result === 'string') {
				console.error('Error', result)
				return { kind: 'error', error: result }
			}
			revalidatePath(`/group/${groupId}`)
			return { kind: 'success' }
		})
}

export async function newRound(groupId: string, personIds: PersonId[]) {
	return Effect.gen(function* () {
		const { round } = yield* Round.newRound(groupId, personIds)
		return round
	})
		.pipe(
			Effect.catchAll((e) =>
				Effect.succeed(`Error ${JSON.stringify(e.cause)}`),
			),
			run(getRequestContext().env.DB),
		)
		.then((result) => {
			if (typeof result === 'string') {
				console.error('Error', result)
				return result
			}
			revalidatePath(`/group/${groupId}`)
		})
}

export async function updateName(
	groupId: string,
	prevState: State,
	formData: FormData,
): Promise<State> {
	return Effect.gen(function* () {
		const newName = formData.get('name') as string
		if (!newName) {
			return 'The group name can not be empty... 😅'
		}
		yield* Group.Repository.updateName(groupId, newName)
	})
		.pipe(
			Effect.catchAll((e) => Effect.succeed(`Error ${JSON.stringify(e)}`)),
			run(getRequestContext().env.DB),
		)
		.then((result) => {
			if (typeof result === 'string') {
				return { kind: 'error', error: result }
			}
			revalidatePath(`/group/${groupId}`)
			return { kind: 'success' }
		})
}

export async function removePersonFromRound(
	personId: PersonId,
	roundId: number,
	groupId: string,
) {
	return Round.removePersonFromRound(personId, roundId, groupId)
		.pipe(
			Effect.catchAll((e) => Effect.succeed(`Error ${JSON.stringify(e)}`)),
			run(getRequestContext().env.DB),
		)
		.then((result) => {
			if (typeof result === 'string') {
				return result
			}
			revalidatePath(`/group/${groupId}`)
		})
}
