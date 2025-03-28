import { Effect, Layer, TestContext } from 'effect'
import { Db } from '../db'
import { OrmClient } from '../db/orm-client'
import { Next } from '../next'
import { Uuid } from '../uuid'
import type { MainLive } from './main-layer'
import { RepositoryLayer } from './repository-layer'

export function runWithInMemoryDb<A, I>(effect: Effect.Effect<A, I, MainLive>) {
	const InfraNullable = Layer.mergeAll(
		TestContext.TestContext,
		Uuid.Nullable,
		Next.Nullable,
	)
	const InMemoryDb = Layer.provide(Db.Layer, OrmClient.InMemory)
	const RepositoryInMemory = Layer.provide(RepositoryLayer, InMemoryDb)
	const MainTest = Layer.provideMerge(RepositoryInMemory, InfraNullable)
	return effect.pipe(Effect.provide(MainTest), (a) => a, Effect.runPromise)
}
