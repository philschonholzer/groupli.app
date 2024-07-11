import { Clock, Effect, Layer } from 'effect'
import { InMemoryDb } from '../db/test-db'
import { Next } from '../next'
import { Uuid } from '../uuid'
import type { MainLive } from './main-layer'
import { RepositoryLive } from './repository-layer'
import { make } from './test-clock'

Clock.make()
export function runWithTestDb<A, I>(effect: Effect.Effect<A, I, MainLive>) {
	const ClockTest = Layer.setClock(make())
	const InfraTest = Layer.mergeAll(ClockTest, Uuid.Stub, Next.Nullable)
	const RepositoryTest = Layer.provide(RepositoryLive, InMemoryDb)
	const MainTest = Layer.provideMerge(RepositoryTest, InfraTest)
	return effect.pipe(Effect.provide(MainTest), (a) => a, Effect.runPromise)
}
