'use server'

import { Effect, Schema } from 'effect'
import { DbError } from '@/adapter/db'
import { runAction } from '@/adapter/effect'
import { Next } from '@/adapter/next'
import { Group } from '@/domain'

export async function newGroup() {
	return Effect.gen(function* () {
		const group = yield* Group.newGroup
		yield* Next.redirect(`/group/${group.id}`)
		return group
	}).pipe(
		runAction({
			schema: Schema.Exit({
				success: Schema.Struct({ id: Schema.String, name: Schema.String }),
				failure: DbError,
				defect: Schema.Void,
			}),
		}),
	)
}
