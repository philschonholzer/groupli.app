import { Schema } from '@effect/schema'
import { Effect, type Exit } from 'effect'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { MainLive } from './main-layer'
import type { RepositoryLive } from './repository-layer'

export const run = <A>(effect: Effect.Effect<A, never, RepositoryLive>) => {
	return effect.pipe(
		Effect.withSpan('run'),
		Effect.provide(MainLive),
		Effect.runPromise,
	)
}

export const runAction =
	<A, E, SI extends object>(props: {
		schema: Schema.Schema<Exit.Exit<A, E>, SI, never>
		revalidatePath?: (result: A) => string
		redirect?: (result: A) => string
	}) =>
	(effect: Effect.Effect<A, E, RepositoryLive>) => {
		return effect
			.pipe(
				Effect.withSpan('action'),
				Effect.provide(MainLive),
				Effect.runPromiseExit,
			)
			.then((result) => {
				const parsed = Schema.encodeUnknownSync(props.schema)(result)
				if (
					'_tag' in parsed &&
					parsed._tag === 'Success' &&
					'value' in result
				) {
					if (props.redirect) {
						redirect(props.redirect(result.value))
					}
					if (props.revalidatePath) {
						revalidatePath(props.revalidatePath(result.value))
					}
				}
				return parsed as typeof parsed | { readonly _tag: 'Idle' }
			})
	}
