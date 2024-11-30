import { Db } from '@/adapter/db'
import { Pairings } from '@/adapter/db/schema'
import { eq } from 'drizzle-orm'
import { Effect, Layer } from 'effect'
import type { Person, Round } from '..'

const make = Effect.gen(function* () {
	const db = yield* Db

	return {
		getAll: db((client) => client.query.Pairings.findMany()),
		insert: (
			roundId: Round.RoundId,
			pairs: (readonly [person1: Person.PersonId, person2: Person.PersonId])[],
		) =>
			db((client) =>
				client.insert(Pairings).values(
					pairs.map(([person1, person2]) => ({
						round: roundId,
						person1,
						person2,
					})),
				),
			),
		deleteByRoundId: (roundId: Round.RoundId) =>
			db((client) =>
				client.delete(Pairings).where(eq(Pairings.round, roundId)),
			),
		updatePairsByRoundId: (
			roundId: Round.RoundId,
			pairs: (readonly [Person.PersonId, Person.PersonId])[],
		) =>
			db((client) =>
				client.batch([
					client.delete(Pairings).where(eq(Pairings.round, roundId)),
					client.insert(Pairings).values(
						pairs.map(([person1, person2]) => ({
							round: roundId,
							person1,
							person2,
						})),
					),
				]),
			),
	}
})

export class Repository extends Effect.Tag('@domain/pairing/repository')<
	Repository,
	Effect.Effect.Success<typeof make>
>() {
	static Layer = Layer.effect(this, make)
}
