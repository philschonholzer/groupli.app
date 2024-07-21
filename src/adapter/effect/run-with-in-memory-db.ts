import { Clock, Effect, Layer } from 'effect'
import { InMemoryDb } from '../db/test-db'
import { Next } from '../next'
import { Uuid } from '../uuid'
import type { MainLive } from './main-layer'
import { RepositoryLive } from './repository-layer'
import { make } from './test-clock'

Clock.make()
export function runWithInMemoryDb<A, I>(effect: Effect.Effect<A, I, MainLive>) {
	const ClockTest = Layer.setClock(make())
	const InfraNullable = Layer.mergeAll(ClockTest, Uuid.Nullable, Next.Nullable)
	const RepositoryInMemory = Layer.provide(RepositoryLive, InMemoryDb)
	const MainTest = Layer.provideMerge(RepositoryInMemory, InfraNullable)
	return effect.pipe(Effect.provide(MainTest), (a) => a, Effect.runPromise)
}
