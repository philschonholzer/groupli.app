import { Db } from '@/adapter/db'
import { Pairings } from '@/adapter/db/schema'
import { eq } from 'drizzle-orm'
import { Effect, Layer } from 'effect'
import type { PersonId } from '../person'

const make = Effect.gen(function* () {
	const db = yield* Db

	return {
		getAll: db((client) => client.query.Pairings.findMany()),
		insert: (
			roundId: number,
			pairs: (readonly [person1: PersonId, person2: PersonId])[],
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
		deleteByRoundId: (roundId: number) =>
			db((client) => client.delete(Pairings).where(eq(Pairings.round, roundId))),
		updatePairsByRoundId: (
			roundId: number,
			pairs: (readonly [PersonId, PersonId])[],
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
	static Live = Layer.effect(this, make)
}
