import { Effect, Layer } from 'effect'
import { Db } from '../db'
import { type RepositoryLayer, repositoryLayer } from './repository-layer'

export const run =
	<A>(db: D1Database) =>
	(effect: Effect.Effect<A, never, RepositoryLayer>) => {
		const mainLayer = Layer.provide(repositoryLayer, Db.Live(db))
		return effect.pipe(Effect.provide(mainLayer), Effect.runPromise)
	}
