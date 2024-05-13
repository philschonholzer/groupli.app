'use server'

import { run } from '@/adapter/effect'
import { Group, Person } from '@/domain'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { Effect } from 'effect'
import { revalidatePath } from 'next/cache'

export async function addPerson(name: string, groupId: string) {
	return Effect.gen(function* () {
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
				return result
			}
			revalidatePath(`/group/${groupId}`)
		})
}

export async function updateName(name: string, groupId: string) {
	return Effect.gen(function* () {
		yield* Group.Repository.updateName(groupId, name)
	})
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