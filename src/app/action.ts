'use server'

import { run } from '@/adapter/effect'
import { Group } from '@/domain'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { Effect } from 'effect'
import { redirect } from 'next/navigation'

export async function newGroup() {
	return Effect.gen(function* () {
		return yield* Group.newGroup
	})
		.pipe(
			Effect.catchAll((e) => Effect.succeed(`Error ${JSON.stringify(e)}`)),
			run(getRequestContext().env.DB),
		)
		.then((result) => {
			if (typeof result === 'string') {
				return result
			}
			console.log('result', result)
			redirect(`/group/${result.id}`)
		})
}
