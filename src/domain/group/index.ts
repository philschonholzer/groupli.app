import { Effect } from 'effect'
import { nanoid } from 'nanoid'
import { Repository } from './repository'
import { Round } from '..'

export * from './repository'

export const newGroup = Effect.gen(function* () {
	const repository = yield* Repository
	const id = nanoid(8)
	const name = 'New Group'
	yield* repository.insert({ id, name })
	yield* Round.newRound(id, [])
	return { id, name }
})
