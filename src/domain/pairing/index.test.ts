import assert from 'node:assert'
import { describe, test } from 'node:test'

import { Db } from '@/adapter/db'
import { Effect, Layer } from 'effect'
import { Pairing, Round } from '../index'
import {
	__tests__,
	generateAllPossibleListsOfPairings,
	generateOnePossibleListOfPairings,
	pairPersons,
} from './index'

const { makeAllPossiblePairs, makeEvenAmountOfPersons, allListsOfPairs } = __tests__

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function runTest(data: any) {
	return <A, I>(effect: Effect.Effect<A, I, Round.Repository | Pairing.Repository>) => {
		const query = () => Effect.succeed(data)
		const DbTest = Layer.succeed(Db, Db.of(query))
		const repoLayer = Layer.mergeAll(Round.Repository.Live, Pairing.Repository.Live)
		const RoundRepository = repoLayer.pipe(Layer.provide(DbTest))

		return effect.pipe(
			Effect.provide(RoundRepository),
			(a) => a,
			Effect.runPromise,
		)
	}
}

describe('Pairing', () => {
	test('all possible lists of pairings for 4 persons', () => {
		const actual = generateAllPossibleListsOfPairings(
			[
				{ person1: 1, person2: 2, position: 0 },
				{ person1: 1, person2: 3, position: 0 },
				{ person1: 1, person2: 4, position: 0 },
				{ person1: 2, person2: 3, position: 5 },
				{ person1: 2, person2: 4, position: 0 },
				{ person1: 3, person2: 4, position: 0 },
			],
			4,
		)
		assert.deepStrictEqual(actual, [
			{
				list: [
					{ person1: 1, person2: 2, position: 0 },
					{ person1: 3, person2: 4, position: 0 },
				],
				weight: 0,
			},
			{
				list: [
					{ person1: 1, person2: 3, position: 0 },
					{ person1: 2, person2: 4, position: 0 },
				],
				weight: 0,
			},
			{
				list: [
					{ person1: 1, person2: 4, position: 0 },
					{ person1: 2, person2: 3, position: 5 },
				],
				weight: 5,
			},
		])
	})
	test('all possible lists of pairings for 6 persons', () => {
		const actual = generateAllPossibleListsOfPairings(
			[
				{ person1: 1, person2: 2, position: 0 },
				{ person1: 1, person2: 3, position: 0 },
				{ person1: 1, person2: 4, position: 0 },
				{ person1: 1, person2: 5, position: 0 },
				{ person1: 1, person2: 6, position: 0 },
				{ person1: 2, person2: 3, position: 5 },
				{ person1: 2, person2: 4, position: 0 },
				{ person1: 2, person2: 5, position: 0 },
				{ person1: 2, person2: 6, position: 0 },
				{ person1: 3, person2: 4, position: 0 },
				{ person1: 3, person2: 5, position: 0 },
				{ person1: 3, person2: 6, position: 0 },
				{ person1: 4, person2: 5, position: 0 },
				{ person1: 4, person2: 6, position: 0 },
				{ person1: 5, person2: 6, position: 0 },
			],
			6,
		)
		assert.deepStrictEqual(actual, [
			{
				list: [
					{ person1: 1, person2: 2, position: 0 },
					{ person1: 3, person2: 4, position: 0 },
					{ person1: 5, person2: 6, position: 0 },
				],
				weight: 0,
			},
			{
				list: [
					{ person1: 1, person2: 3, position: 0 },
					{ person1: 2, person2: 4, position: 0 },
					{ person1: 5, person2: 6, position: 0 },
				],
				weight: 0,
			},
			{
				list: [
					{ person1: 1, person2: 4, position: 0 },
					{ person1: 2, person2: 5, position: 0 },
					{ person1: 3, person2: 6, position: 0 },
				],
				weight: 0,
			},
			{
				list: [
					{ person1: 1, person2: 5, position: 0 },
					{ person1: 2, person2: 4, position: 0 },
					{ person1: 3, person2: 6, position: 0 },
				],
				weight: 0,
			},
			{
				list: [
					{ person1: 1, person2: 6, position: 0 },
					{ person1: 2, person2: 4, position: 0 },
					{ person1: 3, person2: 5, position: 0 },
				],
				weight: 0,
			},
		])
	})
	test('one possible lists of pairings', () => {
		const actual = generateOnePossibleListOfPairings(
			[
				{ person1: 1, person2: 2, position: 0 },
				{ person1: 1, person2: 3, position: 0 },
				{ person1: 1, person2: 4, position: 0 },
				{ person1: 2, person2: 3, position: 5 },
				{ person1: 2, person2: 4, position: 0 },
				{ person1: 3, person2: 4, position: 0 },
			],
			2,
		)
		assert.deepStrictEqual(actual, [
			{ person1: 1, person2: 2, position: 0 },
			{ person1: 3, person2: 4, position: 0 },
		])
	})

	describe('makeEvenAmountOfPersons', () => {
		test('remove hightest weighted person of 3', () => {
			const actual = makeEvenAmountOfPersons([{ person1: 1, person2: 2, position: 0 }, { person1: 1, person2: 3, position: 5 }, {person1: 2, person2: 3, position: 2} ], 3)
			const expect = [{ person1: 1, person2: 2, position: 0 }]
			assert.deepStrictEqual(actual, {pairs: expect, numberOfPersons: 2})
		})
	})
	describe('pairPersons', () => {
		type Data = {
			id: number
			group: string
			at: string
			pairings: {
				id: number
				round: number
				person1: number
				person2: number
			}[]
		}[]
		test('pairs even group of people with respect to historical data', () =>
			Effect.gen(function* () {
				const actual = yield* pairPersons('groupId', 1, [1, 2, 3, 4])

				assert.doesNotMatch(
					actual.map(([n1, n2]) => `${n1}${n2}`).join(','),
					/23/,
				)
			}).pipe(
				runTest([
					{
						id: 232,
						at: '',
						group: '',
						pairings: [{ id: 1, person1: 2, person2: 3, round: 7 }],
					},
				] satisfies Data),
			))
		test('pairs odd group of people with respect to historical data', () =>
			Effect.gen(function* () {
				const actual = yield* pairPersons('groupId', 1, [1, 2, 3, 4, 5])

				assert.doesNotMatch(
					actual.map(([n1, n2]) => `${n1}${n2}`).join(','),
					/23/,
				)
			}).pipe(
				runTest([
					{
						id: 232,
						at: '',
						group: '',
						pairings: [{ id: 1, person1: 2, person2: 3, round: 7 }],
					},
				] satisfies Data),
			))
	})

	describe('makeAllPossiblePairs', () => {
		test('returns empty array when input is empty', () => {
			const actual = makeAllPossiblePairs([])
			assert.deepStrictEqual(actual, new Map())
		})

		test('returns empty array when input has only one element', () => {
			const actual = makeAllPossiblePairs([1])
			assert.deepStrictEqual(actual, new Map())
		})

		test('returns all possible pairs when input has more than one element', () => {
			const actual = makeAllPossiblePairs([1, 2, 3])
			assert.deepStrictEqual(
				actual,
				new Map([
					['1-2', { person1: 1, person2: 2, position: 0 }],
					['1-3', { person1: 1, person2: 3, position: 0 }],
					['2-3', { person1: 2, person2: 3, position: 0 }],
				]),
			)
		})

		test('returns all possible pairs when input has more than one element', () => {
			const actual = makeAllPossiblePairs([1, 2, 3, 4])
			assert.deepStrictEqual(
				actual,
				new Map([
					['1-2', { person1: 1, person2: 2, position: 0 }],
					['1-3', { person1: 1, person2: 3, position: 0 }],
					['1-4', { person1: 1, person2: 4, position: 0 }],
					['2-3', { person1: 2, person2: 3, position: 0 }],
					['2-4', { person1: 2, person2: 4, position: 0 }],
					['3-4', { person1: 3, person2: 4, position: 0 }],
				]),
			)
		})

		test('returns all possible pairs in the right order', () => {
			const actual = makeAllPossiblePairs([57, 99, 23, 4])
			assert.deepStrictEqual(
				actual,
				new Map([
					['57-99', { person1: 57, person2: 99, position: 0 }],
					['23-57', { person1: 23, person2: 57, position: 0 }],
					['4-57', { person1: 4, person2: 57, position: 0 }],
					['23-99', { person1: 23, person2: 99, position: 0 }],
					['4-99', { person1: 4, person2: 99, position: 0 }],
					['4-23', { person1: 4, person2: 23, position: 0 }],
				]),
			)
		})
	})
})
