import { Effect, Option } from 'effect'
import { Pairing } from '..'
import { Repository } from './repository'

export * from './repository'

export const newRound = (groupId: string, personIds: number[]) =>
	Effect.gen(function* () {
		const { round } = yield* Repository.newRound(groupId, personIds)
		const pairings = yield* Pairing.pairPersons(groupId, personIds)
		yield* Pairing.Repository.insert(round.id, pairings)

		return { round, pairings }
	})

export const getCurrentRound = (groupId: string) =>
	Effect.gen(function* () {
		const roundOption = yield* Repository.findLast(groupId)
		if (Option.isNone(roundOption)) {
			const round = yield* newRound(groupId, [])
			return round.round
		}
		return roundOption.value
	})

export const removePersonFromRound = (
	personId: number,
	roundId: number,
	groupId: string,
) =>
	Effect.gen(function* () {
		const personInRound = yield* Repository.findPersonInRound(personId, roundId)
		if (Option.isSome(personInRound)) {
			yield* Repository.removePersonFromRound(personInRound.value.id)
		}
		const personsInRound = yield* Repository.getPersonsInRound(roundId)
		yield* Pairing.Repository.deleteByRoundId(roundId)
		const pairings = yield* Pairing.pairPersons(
			groupId,
			personsInRound.map((p) => p.person),
		)
		yield* Pairing.Repository.insert(roundId, pairings)
		return pairings
	})
