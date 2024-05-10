import { Effect } from 'effect'
import { nanoid } from 'nanoid'
import { Repository } from './repository'

export * from './repository'

export const newGroup = Effect.gen(function* () {
	const repository = yield* Repository
	const id = nanoid(8)
	const name = 'New Group'
	yield* repository.insert({ id, name })
	return { id, name }
})
