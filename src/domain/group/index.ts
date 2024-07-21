import { Uuid } from '@/adapter/uuid'
import { NameRequired } from '@/app/group/[id]/errors'
import { Schema } from '@effect/schema'
import { Brand, Effect } from 'effect'
import { Repository } from './repository'

export * from './repository'

export type GroupId = Brand.Branded<string, 'GroupId'>
export const GroupId = Brand.nominal<GroupId>()

export const Group = Schema.Struct({
	id: Schema.String.pipe(Schema.fromBrand(GroupId)),
	name: Schema.String.pipe(Schema.nonEmpty()),
})

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
