import { Schema } from '@effect/schema'
import { Effect, type Exit, Layer } from 'effect'
import { revalidatePath } from 'next/cache'
import { Db } from '../db'
import { TracingLayer } from '../tracing'
import { type RepositoryLayer, repositoryLayer } from './repository-layer'
export const run =
	<A>(db: D1Database) =>
	(effect: Effect.Effect<A, never, RepositoryLayer>) => {
		const mainLayer = Layer.provide(repositoryLayer, Db.Live(db))
		const mainLive = Layer.merge(mainLayer, TracingLayer)

		return effect.pipe(
			Effect.withSpan('run'),
			Effect.provide(mainLive),
			Effect.runPromise,
		)
	}

export const runAction =
	<A, E, SI extends object>(props: {
		db: D1Database
		schema: Schema.Schema<Exit.Exit<A, E>, SI, never>
		revalidatePath?: string
	}) =>
	(effect: Effect.Effect<A, E, RepositoryLayer>) => {
		const mainLayer = Layer.provide(repositoryLayer, Db.Live(props.db))
		const mainLive = Layer.merge(mainLayer, TracingLayer)

		return effect
			.pipe(
				Effect.withSpan('action'),
				Effect.provide(mainLive),
				Effect.runPromiseExit,
			)
			.then((result) => {
				const parsed = Schema.encodeUnknownSync(props.schema)(result)
				if (
					'_tag' in parsed &&
					parsed._tag === 'Success' &&
					props.revalidatePath
				) {
					revalidatePath(props.revalidatePath)
				}
				return parsed as typeof parsed | { readonly _tag: 'Idle' }
			})
	}
