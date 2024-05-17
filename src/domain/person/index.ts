import { Effect } from 'effect'
import { Round } from '..'
import { Repository } from './repository'

export * from './repository'

export const addPerson = (name: string, groupId: string) =>
	Effect.gen(function* () {
		const person = yield* Repository.insert(name, groupId)
		const round = yield* Round.getCurrentRound(groupId)
		return yield* Round.Repository.addPersonToRound(person.id, round.id)
	})

export const skipRound = (personId: number) => {
	throw new Error('Not implemented')
}
