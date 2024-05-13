import { Effect } from 'effect'
import { nanoid } from 'nanoid'
import { Round } from '..'
import { Repository } from './repository'

export * from './repository'

export const newGroup = Effect.gen(function* () {
	const id = nanoid(8)
	const name = 'New Group'
	yield* Repository.insert({ id, name })
	yield* Round.newRound(id, [])
	return { id, name }
})
