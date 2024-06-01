'use server'

import { DbError } from '@/adapter/db'
import { runAction } from '@/adapter/effect'
import { Group } from '@/domain'
import { Schema } from '@effect/schema'
import { Effect } from 'effect'

export async function newGroup() {
	return Effect.gen(function* () {
		return yield* Group.newGroup
	}).pipe(
		runAction({
			schema: Schema.Exit({
				success: Schema.Struct({ id: Schema.String, name: Schema.String }),
				failure: DbError,
			}),
			redirect: ({ id }) => `/group/${id}`,
		}),
	)
}
