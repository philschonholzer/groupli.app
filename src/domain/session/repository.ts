import { Db } from '@/adapter/db'
import { Effect, Layer } from 'effect'

const make = Effect.gen(function* () {
	const db = yield* Db

	return {
		getAll: db((client) => client.query.Sessions.findMany()),
	}
})

export class Repository extends Effect.Tag('@domain/session/repository')<
	Repository,
	Effect.Effect.Success<typeof make>
>() {
	static Live = Layer.effect(this, make)
}
