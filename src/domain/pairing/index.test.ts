import assert from 'node:assert'
import { describe, test } from 'node:test'

import { Db } from '@/adapter/db'
import { Effect, Layer, Option } from 'effect'
import { Group, Pairing, Round } from '../index'
import { PersonId } from '../person'
import { type PairList, __tests__, pairPersons } from './index'

const { generateAllListsOfPairs, addWeightToPairLists } = __tests__

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function runTest(data: any) {
	return <A, I>(
		effect: Effect.Effect<A, I, Round.Repository | Pairing.Repository>,
	) => {
		const query = () => Effect.succeed(data)
		const DbTest = Layer.succeed(Db, Db.of(query))
		const repoLayer = Layer.mergeAll(
			Round.Repository.Live,
			Pairing.Repository.Live,
		)
		const RoundRepository = repoLayer.pipe(Layer.provide(DbTest))

		return effect.pipe(
			Effect.provide(RoundRepository),
			(a) => a,
			Effect.runPromise,
		)
	}
}

const allPairingsFor6: PairList[] = [
	[
		[1, 2],
		[3, 4],
		[5, 6],
	],
	[
		[1, 2],
		[3, 5],
		[4, 6],
	],
	[
		[1, 2],
		[3, 6],
		[4, 5],
	],
	[
		[1, 3],
		[2, 4],
		[5, 6],
	],
	[
		[1, 3],
		[2, 5],
		[4, 6],
	],
	[
		[1, 3],
		[2, 6],
		[4, 5],
	],
	[
		[1, 4],
		[2, 3],
		[5, 6],
	],
	[
		[1, 4],
		[2, 5],
		[3, 6],
	],
	[
		[1, 4],
		[2, 6],
		[3, 5],
	],
	[
		[1, 5],
		[2, 3],
		[4, 6],
	],
	[
		[1, 5],
		[2, 4],
		[3, 6],
	],
	[
		[1, 5],
		[2, 6],
		[3, 4],
	],
	[
		[1, 6],
		[2, 3],
		[4, 5],
	],
	[
		[1, 6],
		[2, 4],
		[3, 5],
	],
	[
		[1, 6],
		[2, 5],
		[3, 4],
	],
].map((list) => list.map(([p1, p2]) => [PersonId(p1), PersonId(p2)]))
const allPairingsFor4: PairList[] = [
	[
		[1, 2],
		[3, 4],
	],
	[
		[1, 3],
		[2, 4],
	],
	[
		[1, 4],
		[2, 3],
	],
].map((list) => list.map(([p1, p2]) => [PersonId(p1), PersonId(p2)]))
describe('Pairing', () => {
	describe('makeEvenAmountOfPersons', () => {
		test('remove hightest weighted person of 3', () => {})
	})
	describe('all lists of pairs', () => {
		test('returns all possible lists of pairings for 4 persons', () => {
			const actual = generateAllListsOfPairs([1, 2, 3, 4].map(PersonId))
			assert.deepStrictEqual(actual, allPairingsFor4)
		})
		test('returns all pairings in the ordered by value', () => {
			const actual = generateAllListsOfPairs([2, 1, 4, 3].map(PersonId))

			assert.deepStrictEqual(actual, [
				[
					[1, 2],
					[3, 4],
				],
				[
					[2, 4],
					[1, 3],
				],
				[
					[2, 3],
					[1, 4],
				],
			])
		})
		test('returns all possible lists of pairings for 6 persons', () => {
			const actual = generateAllListsOfPairs([1, 2, 3, 4, 5, 6].map(PersonId))
			assert.deepStrictEqual(actual, allPairingsFor6)
		})
	})

	test('add weight to pair lists for 4 persons', () => {
		const actual = addWeightToPairLists(allPairingsFor4, [
			{
				id: 1,
				at: '',
				group: '',
				pairings: [
					{ id: 1, person1: PersonId(1), person2: PersonId(2), round: 1 },
				],
			},
			{
				id: 4,
				at: '',
				group: '',
				pairings: [
					{ id: 2, person1: PersonId(2), person2: PersonId(3), round: 4 },
				],
			},
			{
				id: 7,
				at: '',
				group: '',
				pairings: [
					{ id: 2, person1: PersonId(1), person2: PersonId(2), round: 7 },
				],
			},
		])
		const expected = [
			{
				list: [
					[1, 2],
					[3, 4],
				],
				weight: 7,
			},
			{
				list: [
					[1, 3],
					[2, 4],
				],
				weight: 0,
			},
			{
				list: [
					[1, 4],
					[2, 3],
				],
				weight: 4,
			},
		]
		assert.deepStrictEqual(actual, expected)
	})
	test('add weight to pair lists for 6 persons', () => {
		const actual = addWeightToPairLists(allPairingsFor6, [
			{
				id: 1,
				at: '',
				group: '',
				pairings: [
					{ id: 1, person1: PersonId(1), person2: PersonId(2), round: 1 },
				],
			},
			{
				id: 1,
				at: '',
				group: '',
				pairings: [
					{ id: 2, person1: PersonId(3), person2: PersonId(4), round: 1 },
				],
			},
			{
				id: 1,
				at: '',
				group: '',
				pairings: [
					{ id: 3, person1: PersonId(5), person2: PersonId(6), round: 1 },
				],
			},
			{
				id: 2,
				at: '',
				group: '',
				pairings: [
					{ id: 11, person1: PersonId(1), person2: PersonId(3), round: 2 },
				],
			},
			{
				id: 2,
				at: '',
				group: '',
				pairings: [
					{ id: 13, person1: PersonId(2), person2: PersonId(4), round: 2 },
				],
			},
			{
				id: 2,
				at: '',
				group: '',
				pairings: [
					{ id: 14, person1: PersonId(5), person2: PersonId(6), round: 2 },
				],
			},
			{
				id: 4,
				at: '',
				group: '',
				pairings: [
					{ id: 22, person1: PersonId(1), person2: PersonId(4), round: 4 },
				],
			},
			{
				id: 4,
				at: '',
				group: '',
				pairings: [
					{ id: 23, person1: PersonId(2), person2: PersonId(5), round: 4 },
				],
			},
			{
				id: 7,
				at: '',
				group: '',
				pairings: [
					{ id: 32, person1: PersonId(1), person2: PersonId(2), round: 7 },
				],
			},
			{
				id: 7,
				at: '',
				group: '',
				pairings: [
					{ id: 33, person1: PersonId(4), person2: PersonId(6), round: 7 },
				],
			},
		])

		const expected = [
			{
				list: [
					[1, 2],
					[3, 4],
					[5, 6],
				],
				weight: 7,
			},
			{
				list: [
					[1, 2],
					[3, 5],
					[4, 6],
				],
				weight: 7,
			},
			{
				list: [
					[1, 2],
					[3, 6],
					[4, 5],
				],
				weight: 7,
			},
			{
				list: [
					[1, 3],
					[2, 4],
					[5, 6],
				],
				weight: 2,
			},
			{
				list: [
					[1, 3],
					[2, 5],
					[4, 6],
				],
				weight: 7,
			},
			{
				list: [
					[1, 3],
					[2, 6],
					[4, 5],
				],
				weight: 2,
			},
			{
				list: [
					[1, 4],
					[2, 3],
					[5, 6],
				],
				weight: 4,
			},
			{
				list: [
					[1, 4],
					[2, 5],
					[3, 6],
				],
				weight: 4,
			},
			{
				list: [
					[1, 4],
					[2, 6],
					[3, 5],
				],
				weight: 4,
			},
			{
				list: [
					[1, 5],
					[2, 3],
					[4, 6],
				],
				weight: 7,
			},
			{
				list: [
					[1, 5],
					[2, 4],
					[3, 6],
				],
				weight: 2,
			},
			{
				list: [
					[1, 5],
					[2, 6],
					[3, 4],
				],
				weight: 1,
			},
			{
				list: [
					[1, 6],
					[2, 3],
					[4, 5],
				],
				weight: 0,
			},
			{
				list: [
					[1, 6],
					[2, 4],
					[3, 5],
				],
				weight: 2,
			},
			{
				list: [
					[1, 6],
					[2, 5],
					[3, 4],
				],
				weight: 4,
			},
		]
		assert.deepStrictEqual(actual, expected)
	})
	describe('pairPersons', () => {
		type Data = {
			id: number
			group: string
			at: string
			pairings: {
				id: number
				round: number
				person1: PersonId
				person2: PersonId
			}[]
		}[]
		test('pairs none in empty group', () =>
			Effect.gen(function* () {
				const actual = yield* pairPersons(Group.GroupId('groupId'), [])

				assert.equal(Option.isNone(actual), true)
			}).pipe(
				Effect.repeatN(100),
				runTest([
					{
						id: 232,
						at: '2024-05-01T22:00:00.000Z',
						group: '1',
						pairings: [],
					},
					{
						id: 231,
						at: '2024-05-01T21:00:00.000Z',
						group: '1',
						pairings: [
							{ id: 1, person1: PersonId(2), person2: PersonId(3), round: 7 },
						],
					},
				] satisfies Data),
			))
		test('pairs none in group of 1', () =>
			Effect.gen(function* () {
				const actual = yield* pairPersons(
					Group.GroupId('groupId'),
					[1].map(PersonId),
				)

				assert.equal(Option.isNone(actual), true)
			}).pipe(
				Effect.repeatN(100),
				runTest([
					{
						id: 232,
						at: '2024-05-01T22:00:00.000Z',
						group: '1',
						pairings: [],
					},
					{
						id: 231,
						at: '2024-05-01T21:00:00.000Z',
						group: '1',
						pairings: [
							{ id: 1, person1: PersonId(2), person2: PersonId(3), round: 7 },
						],
					},
				] satisfies Data),
			))
		test('pairs group of 2 people with respect to historical data', () =>
			Effect.gen(function* () {
				const result = yield* pairPersons(
					Group.GroupId('groupId'),
					[1, 2].map(PersonId),
				)
				const actual = yield* result

				assert.deepStrictEqual(actual, [[1, 2]])

				assert.equal(actual.length, 1)
			}).pipe(
				Effect.repeatN(100),
				runTest([
					{
						id: 232,
						at: '2024-05-01T22:00:00.000Z',
						group: '1',
						pairings: [],
					},
					{
						id: 231,
						at: '2024-05-01T21:00:00.000Z',
						group: '1',
						pairings: [
							{ id: 1, person1: PersonId(2), person2: PersonId(3), round: 7 },
						],
					},
				] satisfies Data),
			))
		test('pairs group of 3 people with respect to historical data', () =>
			Effect.gen(function* () {
				const result = yield* pairPersons(
					Group.GroupId('groupId'),
					[1, 2, 3].map(PersonId),
				)
				const actual = yield* result

				assert.equal(
					actual.some(
						([p1, p2]) => (p1 === 2 && p2 === 3) || (p1 === 3 && p2 === 2),
					),
					false,
				)
				assert.equal(actual.length, 1)
			}).pipe(
				Effect.repeatN(100),
				runTest([
					{
						id: 232,
						at: '2024-05-01T22:00:00.000Z',
						group: '1',
						pairings: [],
					},
					{
						id: 231,
						at: '2024-05-01T21:00:00.000Z',
						group: '1',
						pairings: [
							{ id: 1, person1: PersonId(2), person2: PersonId(3), round: 7 },
						],
					},
				] satisfies Data),
			))
		test('pairs group of 4 people with respect to historical data', () =>
			Effect.gen(function* () {
				const result = yield* pairPersons(
					Group.GroupId('groupId'),
					[1, 2, 3, 4].map(PersonId),
				)
				const actual = yield* result

				assert.equal(
					actual.some(([p1, p2]) => p1 === 2 && p2 === 3),
					false,
				)
				assert.equal(actual.length, 2)
			}).pipe(
				Effect.repeatN(100),
				runTest([
					{
						id: 232,
						at: '2024-05-01T22:00:00.000Z',
						group: '1',
						pairings: [],
					},
					{
						id: 231,
						at: '2024-05-01T21:00:00.000Z',
						group: '1',
						pairings: [
							{ id: 1, person1: PersonId(2), person2: PersonId(3), round: 7 },
						],
					},
				] satisfies Data),
			))
		test('pairs group of 5 people with respect to historical data', () =>
			Effect.gen(function* () {
				const result = yield* pairPersons(
					Group.GroupId('groupId'),
					[1, 2, 3, 4, 5].map(PersonId),
				)
				const actual = yield* result

				assert.equal(
					actual.some(
						([p1, p2]) => (p1 === 2 && p2 === 3) || (p1 === 3 && p2 === 2),
					),
					false,
				)
				assert.equal(actual.length, 2)
			}).pipe(
				Effect.repeatN(100),
				runTest([
					{
						id: 232,
						at: '2024-05-01T22:00:00.000Z',
						group: '1',
						pairings: [],
					},
					{
						id: 231,
						at: '2024-05-01T21:00:00.000Z',
						group: '1',
						pairings: [
							{ id: 1, person1: PersonId(2), person2: PersonId(3), round: 7 },
						],
					},
				] satisfies Data),
			))
		test('pairs group of 6 people with respect to historical data', () =>
			Effect.gen(function* () {
				const result = yield* pairPersons(
					Group.GroupId('groupId'),
					[1, 2, 3, 4, 5, 6].map(PersonId),
				)
				const actual = yield* result

				assert.equal(
					actual.some(
						([p1, p2]) => (p1 === 2 && p2 === 3) || (p1 === 3 && p2 === 2),
					),
					false,
				)
				assert.equal(actual.length, 3)
			}).pipe(
				Effect.repeatN(100),
				runTest([
					{
						id: 232,
						at: '2024-05-01T22:00:00.000Z',
						group: '1',
						pairings: [],
					},
					{
						id: 231,
						at: '2024-05-01T21:00:00.000Z',
						group: '1',
						pairings: [
							{ id: 1, person1: PersonId(2), person2: PersonId(3), round: 7 },
						],
					},
				] satisfies Data),
			))
	})
})
