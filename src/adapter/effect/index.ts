import { Effect, Layer } from 'effect'
import { Db } from '../db'
import { repositoryLayer, type RepositoryLayer } from './repository-layer'

export const run =
	<A>(db: D1Database) =>
	(effect: Effect.Effect<A, never, RepositoryLayer>) => {
		const mainLayer = Layer.provide(repositoryLayer, Db.Live(db))
		return effect.pipe(Effect.provide(mainLayer), Effect.runPromise)
	}
