'use server'

import runtime from '@/adapter/effect/runtime'
import { TracingLive } from '@/adapter/tracing'
import { Console, Effect } from 'effect'

export async function newGroup() {
	return Effect.gen(function* () {
		yield* Console.log('clicked button')
		return 'Hi'
	}).pipe(
		Effect.withSpan('newGroup'),
		Effect.provide(TracingLive),
		runtime.runPromise,
	)
}
