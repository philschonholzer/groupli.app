import { Effect, Option } from 'effect'
import { Repository } from './repository'

export * from './repository'

export const newRound = (groupId: string, personIds: number[]) =>
	Effect.gen(function* () {
		const round = yield* Repository.newRound(groupId, personIds)
		return round
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
