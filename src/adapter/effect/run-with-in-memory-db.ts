import { Effect, Layer, TestContext } from 'effect'
import { InMemoryDb } from '../db/test-db'
import { Next } from '../next'
import { Uuid } from '../uuid'
import type { MainLive } from './main-layer'
import { RepositoryLive } from './repository-layer'

export function runWithInMemoryDb<A, I>(effect: Effect.Effect<A, I, MainLive>) {
	const InfraNullable = Layer.mergeAll(
		TestContext.TestContext,
		Uuid.Nullable,
		Next.Nullable,
	)
	const RepositoryInMemory = Layer.provide(RepositoryLive, InMemoryDb)
	const MainTest = Layer.provideMerge(RepositoryInMemory, InfraNullable)
	return effect.pipe(Effect.provide(MainTest), (a) => a, Effect.runPromise)
}
