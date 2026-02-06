import { Effect } from 'effect'
import { Uuid } from '@/adapter/uuid'
import { NameRequired } from '@/app/group/[id]/errors'
import { Repository } from './repository'
import { Group, GroupId } from './schema'

export * from './schema'
export { Repository }

export const newGroup = Effect.gen(function* () {
	const id = yield* Uuid.id(8)
	const groupId = GroupId(id)
	const name = 'New Group'
	yield* Repository.insert({ id: groupId, name })
	return Group.make({ id: groupId, name })
})

export const rename = (id: GroupId, newName: string | null) =>
	Effect.gen(function* () {
		if (!newName) {
			return yield* new NameRequired({
				message: 'The group name can not be empty... 😅',
			})
		}

		yield* Repository.updateName(id, newName)
	})
