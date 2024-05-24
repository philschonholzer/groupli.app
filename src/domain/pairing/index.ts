import { Chunk, Effect, Random } from 'effect'
import { Pairing, Round } from '..'

export * from './repository'

type PairWithPosition = {
	person1: number
	person2: number
	position: number
}
export const pairPersons = (
	groupId: string,
	roundId: number,
	personIds: number[],
) =>
	Effect.gen(function* () {
		const randomPersonIds = yield* Random.shuffle(personIds).pipe(
			Effect.map(Chunk.toArray),
		)

		const allPossiblePairsFromPersons = makeAllPossiblePairs(randomPersonIds)

		const sortedPassedRounds =
			yield* Round.Repository.get10LastByGroupIdWithPairings(groupId)	

		for (const round of sortedPassedRounds) {
			for (const pairing of round.pairings) {			
				const passedPairing = allPossiblePairsFromPersons.get(
					`${pairing.person1}-${pairing.person2}`,
				)
				if (passedPairing) {

					allPossiblePairsFromPersons.set(
						`${pairing.person1}-${pairing.person2}`,
						{
							person1: pairing.person1,
							person2: pairing.person2,
							position: pairing.round,
						},
					)
				}
			}
		}


		const {pairs: allPossiblePairsFromEvenPersons, numberOfPersons} = makeEvenAmountOfPersons(Array.from(allPossiblePairsFromPersons.values()), personIds.length)
		
		const pairsWithWeight = generateAllPossibleListsOfPairings(
			allPossiblePairsFromEvenPersons,
			numberOfPersons,
		)	

		const pairs = pairsWithWeight
			.reduce((pairWithLowestWeight, currentPair) => {
				if (pairWithLowestWeight.weight < currentPair.weight) {
					return pairWithLowestWeight
				}
				return currentPair
			}, pairsWithWeight[0])
			.list.map((pair) => ([pair.person1, pair.person2]) as const)

			yield* Pairing.Repository.insert(roundId, pairs)
			return pairs
	})

function makeEvenAmountOfPersons(pairs: PairWithPosition[], numberOfPersons: number) {
	if (numberOfPersons % 2 === 0) {
		return {pairs, numberOfPersons}
	}
	const personsWithPosition = pairs.reduce((persons, currentPair) =>{
		const person1 = persons.findIndex((person) => person.person === currentPair.person1)
		const person2 = persons.findIndex((person) => person.person === currentPair.person2)
		if (person1 > -1) {		
			persons[person1].position += currentPair.position
		} else {
			persons.push({ person: currentPair.person1, position: currentPair.position })
		}
		if (person2 > -1) {
			persons[person2].position += currentPair.position
		} else {
			persons.push({ person: currentPair.person2, position: currentPair.position })
		}
		return persons
	}, [] as { person: number, position: number }[])

	const personWithHighestPosition = personsWithPosition.toSorted((a, b) => a.position - b.position).at(-1)

	if (!personWithHighestPosition) {
		throw new Error('No person with highest position found')
	}

	const personsWithoutHighestPosition = pairs.filter((person) => person.person1 !== personWithHighestPosition.person && person.person2 !== personWithHighestPosition.person)

	return {pairs: personsWithoutHighestPosition, numberOfPersons: numberOfPersons - 1}
}

export function generateAllPossibleListsOfPairings(
	elements: PairWithPosition[],
	numberOfPersons: number,
): { list: PairWithPosition[]; weight: number }[] {
	const sortedElements = elements.toSorted((a, b) => a.position - b.position)
	const numberOfPairs = numberOfPersons / 2

	const allLists: { list: PairWithPosition[]; weight: number }[] = []

	for (let index = 0; index < numberOfPairs * 2; index++) {
		const candidateList = generateOnePossibleListOfPairings(
			sortedElements.slice(index),
			numberOfPairs,
		)
		if (candidateList.length === numberOfPairs) {
			const weight = Math.max(...candidateList.map((pair) => pair.position))
			allLists.push({ list: candidateList, weight })
		}
	}
	return allLists
}
export function generateOnePossibleListOfPairings(
	elements: PairWithPosition[],
	numberOfPairs: number,
): PairWithPosition[] {
	const firstPair = elements[0]
	const otherPairs = elements
		.slice(1)
		.filter(
			(pair) =>
				firstPair.person1 !== pair.person1 &&
				firstPair.person1 !== pair.person2 &&
				firstPair.person2 !== pair.person1 &&
				firstPair.person2 !== pair.person2,
		)

	if (otherPairs.length + 1 < numberOfPairs) {
		return []
	}
	if (otherPairs.length + 1 === numberOfPairs) {
		return [firstPair, ...otherPairs]
	}

	return [
		firstPair,
		...generateOnePossibleListOfPairings(otherPairs, numberOfPairs - 1),
	]
}

const makeAllPossiblePairs = (persons: number[]) => {
	const pairs = new Map<string, PairWithPosition>()
	for (let index1 = 0; index1 < persons.length; index1++) {
		for (let index2 = index1 + 1; index2 < persons.length; index2++) {
			const person1 = Math.min(persons[index1], persons[index2])
			const person2 = Math.max(persons[index1], persons[index2])
			pairs.set(`${person1}-${person2}`, {
				person1: person1,
				person2: person2,
				position: 0,
			})
		}
	}
	return pairs
}

const randomizeOrder = (persons: number[]) =>
	Effect.gen(function* () {
		return yield* Random.shuffle(persons)
	})

export const __tests__ = {
	makeAllPossiblePairs,
	makeEvenAmountOfPersons,
}
