import { Chunk, Effect, Option, pipe, Random } from 'effect'
import type * as Group from '../group'
import type * as Person from '../person'
import * as Round from '../round'
import { Repository } from './repository'
import type { Pair, PairList } from './schema'

export * from './schema'
export { Repository }

type PairListWithWeight = {
	list: PairList
	weight: number
}

export const pairPersons = (
	groupId: Group.GroupId,
	personIds: Person.PersonId[],
) =>
	Effect.gen(function* () {
		const sortedPassedRounds =
			yield* Round.Repository.get10LastByGroupIdWithPairings(groupId)

		const randomPersonIds = yield* Random.shuffle(personIds).pipe(
			Effect.map(Chunk.toArray),
		)
		const allPossiblePairsFromPersons = generateAllListsOfPairs(randomPersonIds)

		return pipe(
			addWeightToPairLists(allPossiblePairsFromPersons, sortedPassedRounds),
			getBestList,
			(pairs) => pairs.list,
			getArrayOption,
		)
	}).pipe(Effect.withSpan('pairPersons'))

function getBestList(pairsWithWeight: PairListWithWeight[]) {
	return pairsWithWeight.reduce((pairWithLowestWeight, currentPair) => {
		if (pairWithLowestWeight.weight < currentPair.weight) {
			return pairWithLowestWeight
		}
		return currentPair
	}, pairsWithWeight[0])
}

function generateAllListsOfPairs(persons: Person.PersonId[]): PairList[] {
	if (persons.length < 2) {
		return [[]]
	}

	const result: PairList[] = []
	const firstPerson = persons[0]

	for (let i = 1; i < persons.length; i++) {
		const [p1, p2] = [firstPerson, persons[i]].toSorted((a, b) => a - b)
		const pair: Pair = [p1, p2]
		const remainingPersons = persons.slice(1, i).concat(persons.slice(i + 1))
		for (const sublist of generateAllListsOfPairs(remainingPersons)) {
			result.push([pair, ...sublist])
		}
	}

	return result
}

function addWeightToPairLists(
	pairLists: PairList[],
	sortedPassedRounds: {
		id: number
		group: string
		at: string
		pairings: {
			id: number
			round: number
			person1: Person.PersonId
			person2: Person.PersonId
		}[]
	}[],
): PairListWithWeight[] {
	const allHistoricalPairsWithWeight = sortedPassedRounds
		.flatMap((round) => round.pairings)
		.toSorted((a, b) => a.round - b.round)
		.map(
			(pairings) =>
				[`${pairings.person1}-${pairings.person2}`, pairings.round] as const,
		)

	const dedupedPairsWithWeight = new Map(allHistoricalPairsWithWeight)

	const pairListsWithWeight = pairLists.map((pairList) => {
		const weight = pairList.reduce(
			(acc, pair) =>
				Math.max(acc, dedupedPairsWithWeight.get(`${pair[0]}-${pair[1]}`) ?? 0),
			0,
		)
		return { list: pairList, weight }
	})
	return pairListsWithWeight
}

const getArrayOption = Option.liftPredicate(
	(pairList: PairList) => pairList.length > 0,
)

export const __tests__ = {
	generateAllListsOfPairs,
	addWeightToPairLists,
}
