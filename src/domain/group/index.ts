import { NameRequired } from '@/app/group/[id]/errors'
import { Effect } from 'effect'
import { nanoid } from 'nanoid'
import { Round } from '..'
import type { PersonId } from '../person'
import { Repository } from './repository'

export * from './repository'

export const newGroup = Effect.gen(function* () {
	const id = nanoid(8)
	const name = 'New Group'
	yield* Repository.insert({ id, name })
	yield* Round.newRound(id, [])
	return { id, name }
})

export const rename = (id: string, newName: string | null) =>
	Effect.gen(function* () {
		if (!newName) {
			return yield* new NameRequired({
				message: 'The group name can not be empty... 😅',
			})
		}

		yield* Repository.updateName(id, newName)
	})

export const removePerson = (person: PersonId, groupId: string) =>
	Effect.gen(function* () {})
