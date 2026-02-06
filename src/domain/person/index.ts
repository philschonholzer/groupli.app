import { Effect, Schema } from 'effect'
import { NameRequired } from '@/app/group/[id]/errors'
import type { GroupId } from '../group'
import { Repository } from './repository'
import type { PersonId } from './schema'

export * from './schema'
export { Repository }

export const add = (name: string, groupId: GroupId) =>
	Effect.gen(function* () {
		const personsInGroup = yield* Repository.getByGroupId(groupId)
		if (personsInGroup.length >= 14) {
			return yield* new TooManyPersonsInGroup()
		}
		return yield* Repository.insert(name, groupId)
	})

export const rename = (personId: PersonId, newName: string | null) =>
	Effect.gen(function* () {
		if (!newName) {
			return yield* new NameRequired({
				message: 'The name can not be empty... 😅',
			})
		}
		yield* Repository.updateName(personId, newName)
	})

export const removePerson = (personId: PersonId) =>
	Effect.gen(function* () {
		yield* Repository.setInactive(personId)
	})

export const skipRound = (_personId: number) => {
	throw new Error('Not implemented')
}

export class TooManyPersonsInGroup extends Schema.TaggedError<TooManyPersonsInGroup>()(
	'TooManyPersonsInGroup',
	{},
) {}
