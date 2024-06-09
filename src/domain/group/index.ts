import { NameRequired } from '@/app/group/[id]/errors'
import { Schema } from '@effect/schema'
import { Brand, Effect } from 'effect'
import { nanoid } from 'nanoid'
import { Repository } from './repository'

export * from './repository'

export type GroupId = Brand.Branded<string, 'GroupId'>
export const GroupId = Brand.nominal<GroupId>()

export const Group = Schema.Struct({
	id: Schema.String.pipe(Schema.fromBrand(GroupId)),
	name: Schema.String.pipe(Schema.nonEmpty()),
})

export const newGroup = Effect.gen(function* () {
	const id = GroupId(nanoid(8))
	const name = 'New Group'
	yield* Repository.insert({ id, name })
	return Group.make({ id, name })
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
