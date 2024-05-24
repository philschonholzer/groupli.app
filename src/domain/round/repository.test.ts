import assert from 'node:assert'
import { describe, test } from 'node:test'

import { Db } from '@/adapter/db'
import { Effect, Layer } from 'effect'
import { Round } from '..'

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function runTest(data: any) {
	return <A, I>(effect: Effect.Effect<A, I, Round.Repository>) => {
		const query = () => Effect.succeed(data)
		const DbTest = Layer.succeed(Db, Db.of(query))
		const RoundRepository = Round.Repository.Live.pipe(Layer.provide(DbTest))

		return effect.pipe(
			Effect.provide(RoundRepository),
			(a) => a,
			Effect.runPromise,
		)
	}
}

describe('Round Repository', () => {
	test('get 10 Last Rounds By Group Id With Pairings', () =>
		Effect.gen(function* () {
			const actual =
				yield* Round.Repository.get10LastByGroupIdWithPairings('groupId')
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
			runTest([
				{
					id: 82,
					at: '2024-05-24T06:58:46.933Z',
					group: '4HWfqZAd',
					pairings: [],
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
