import { Chunk, Effect, Option, Random } from 'effect'
import { Round } from '..'

export * from './repository'

export type Pair = [person1: number, person2: number]
export type PairList = Pair[]
type PairListWithWeight = {
	list: PairList
	weight: number
}

export const pairPersons = (groupId: string, personIds: number[]) =>
	Effect.gen(function* () {
		const sortedPassedRounds =
			yield* Round.Repository.get10LastByGroupIdWithPairings(groupId)

		const randomPersonIds = yield* Random.shuffle(personIds).pipe(
			Effect.map(Chunk.toArray),
		)
		const allPossiblePairsFromPersons = generateAllListsOfPairs(randomPersonIds)

		const pairsWithWeight = addWeightToPairLists(
			allPossiblePairsFromPersons,
			sortedPassedRounds,
		)

		const pairs = pairsWithWeight.reduce(
			(pairWithLowestWeight, currentPair) => {
				if (pairWithLowestWeight.weight < currentPair.weight) {
					return pairWithLowestWeight
				}
				return currentPair
			},
			pairsWithWeight[0],
		)

		return pairs.list.length > 0 ? Option.some(pairs.list) : Option.none()
	})

function generateAllListsOfPairs(persons: number[]): PairList[] {
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
		pairings: { id: number; round: number; person1: number; person2: number }[]
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

export const __tests__ = {
	generateAllListsOfPairs,
	addWeightToPairLists,
}
