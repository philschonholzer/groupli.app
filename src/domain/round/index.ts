import { Effect, Option } from 'effect'
import { Pairing } from '..'
import { Repository } from './repository'

export * from './repository'

export const newRound = (groupId: string, personIds: number[]) =>
	Effect.gen(function* () {
		const { round } = yield* Repository.newRound(groupId, personIds)
		const pairings = yield* Pairing.pairPersons(groupId, round.id, personIds)
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
