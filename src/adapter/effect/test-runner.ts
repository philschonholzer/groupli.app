import { Clock, Effect, Layer } from 'effect'
import { DbTest } from '../db/test-db'
import { Uuid } from '../uuid'
import type { MainLive } from './main-layer'
import { RepositoryLive } from './repository-layer'
import { make } from './test-clock'

Clock.make()
export function runWithTestDb<A, I>(effect: Effect.Effect<A, I, MainLive>) {
	const ClockTest = Layer.setClock(make())
	const InfraTest = Layer.mergeAll(ClockTest, Uuid.Test)
	const RepositoryTest = Layer.provide(RepositoryLive, DbTest)
	const MainTest = Layer.provideMerge(RepositoryTest, InfraTest)
	return effect.pipe(Effect.provide(MainTest), (a) => a, Effect.runPromise)
}
