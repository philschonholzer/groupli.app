import { Schema } from '@effect/schema'
import { Effect, Layer, type Exit } from 'effect'
import { revalidatePath } from 'next/cache'
import { Db } from '../db'
import { repositoryLayer, type RepositoryLayer } from './repository-layer'

export const run =
	<A>(db: D1Database) =>
	(effect: Effect.Effect<A, never, RepositoryLayer>) => {
		const mainLayer = Layer.provide(repositoryLayer, Db.Live(db))
		return effect.pipe(Effect.provide(mainLayer), Effect.runPromise)
	}

export const runAction =
	<A, E, SI extends object>(props: {
		db: D1Database
		schema: Schema.Schema<Exit.Exit<A, E>, SI, never>
		revalidatePath?: string
	}) =>
	(effect: Effect.Effect<A, E, RepositoryLayer>) => {
		const mainLayer = Layer.provide(repositoryLayer, Db.Live(props.db))
		return effect
			.pipe(Effect.provide(mainLayer), Effect.runPromiseExit)
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
