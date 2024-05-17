import { Db } from '@/adapter/db'
import { Pairings } from '@/adapter/db/schema'
import { Effect, Layer } from 'effect'

const make = Effect.gen(function* () {
	const db = yield* Db

	return {
		getAll: db((client) => client.query.Pairings.findMany()),
		insert: (roundId: number, pairs: [person1: number, person2: number][]) =>
			db((client) =>
				client
					.insert(Pairings)
					.values(
						pairs.map(([person1, person2]) => ({
							round: roundId,
							person1,
							person2,
						})),
					)
					.returning(),
			),
	}
})

export class Repository extends Effect.Tag('@domain/pairing/repository')<
	Repository,
	Effect.Effect.Success<typeof make>
>() {
	static Live = Layer.effect(this, make)
}
