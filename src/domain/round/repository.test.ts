import assert from 'node:assert'
import { Effect, Layer } from 'effect'
import { describe, it } from 'vitest'
import { Db } from '@/adapter/db'
import { Group, Round } from '..'

// biome-ignore lint/suspicious/noExplicitAny: Test helper accepts dynamic mock data
function runWithStubDb(data: any) {
	return <A, I>(effect: Effect.Effect<A, I, Round.Repository>) => {
		const query = () => Effect.succeed(data)
		const DbStub = Layer.succeed(Db, Db.of(query))
		const RoundRepository = Round.Repository.Layer.pipe(Layer.provide(DbStub))

		return effect.pipe(Effect.provide(RoundRepository), Effect.runPromise)
	}
}

describe('Round Repository', () => {
	it('should return last rounds but not the current one', () =>
		Effect.gen(function* () {
			const actual = yield* Round.Repository.get10LastByGroupIdWithPairings(
				Group.GroupId('groupId'),
			)
			const expected = [
				{
					id: 80,
					at: '2024-05-19T06:56:37.302Z',
					group: '4HWfqZAd',
					pairings: [
						{ id: 207, person1: 30, person2: 31, round: 80 },
						{ id: 208, person1: 6, person2: 27, round: 80 },
						{ id: 209, person1: 5, person2: 32, round: 80 },
						{ id: 210, person1: 25, person2: 28, round: 80 },
						{ id: 211, person1: 26, person2: 29, round: 80 },
					],
				},
				{
					id: 81,
					at: '2024-05-19T06:56:38.355Z',
					group: '4HWfqZAd',
					pairings: [
						{ id: 212, person1: 26, person2: 27, round: 81 },
						{ id: 213, person1: 6, person2: 31, round: 81 },
						{ id: 214, person1: 28, person2: 30, round: 81 },
						{ id: 215, person1: 29, person2: 32, round: 81 },
						{ id: 216, person1: 5, person2: 25, round: 81 },
					],
				},
			]
			assert.deepStrictEqual(actual, expected)
		}).pipe(
			runWithStubDb([
				// this should NOT be returned
				{
					id: 82,
					at: '2024-05-24T06:58:46.933Z',
					group: '4HWfqZAd',
					pairings: [],
				},
				// this should be returned
				{
					id: 81,
					at: '2024-05-19T06:56:38.355Z',
					group: '4HWfqZAd',
					pairings: [
						{ id: 212, person1: 26, person2: 27, round: 81 },
						{ id: 213, person1: 6, person2: 31, round: 81 },
						{ id: 214, person1: 28, person2: 30, round: 81 },
						{ id: 215, person1: 29, person2: 32, round: 81 },
						{ id: 216, person1: 5, person2: 25, round: 81 },
					],
				},
				{
					id: 80,
					at: '2024-05-19T06:56:37.302Z',
					group: '4HWfqZAd',
					pairings: [
						{ id: 207, person1: 30, person2: 31, round: 80 },
						{ id: 208, person1: 6, person2: 27, round: 80 },
						{ id: 209, person1: 5, person2: 32, round: 80 },
						{ id: 210, person1: 25, person2: 28, round: 80 },
						{ id: 211, person1: 26, person2: 29, round: 80 },
					],
				},
			]),
		))
})
