import { eq } from 'drizzle-orm'
import { Context, Effect, Layer } from 'effect'
import { Db } from '@/adapter/db'
import { Pairings } from '@/adapter/db/schema'
import type * as Person from '../person'
import type * as RoundSchema from '../round/schema'

const make = Effect.gen(function* () {
	const db = yield* Db

	return {
		getAll: db((client) => client.query.Pairings.findMany()),
		insert: (
			roundId: RoundSchema.RoundId,
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
		deleteByRoundId: (roundId: RoundSchema.RoundId) =>
			db((client) =>
				client.delete(Pairings).where(eq(Pairings.round, roundId)),
			),
		updatePairsByRoundId: (
			roundId: RoundSchema.RoundId,
			pairs: (readonly [Person.PersonId, Person.PersonId])[],
		) => {
			//this was once using batch of libsql, but better-sqlite3 does not support it
			//I tryed transaction but it was executed twice
			return db((client) =>
				client.delete(Pairings).where(eq(Pairings.round, roundId)),
			).pipe(
				Effect.flatMap(() =>
					db((client) =>
						client.insert(Pairings).values(
							pairs.map(([person1, person2]) => ({
								round: roundId,
								person1,
								person2,
							})),
						),
					),
				),
			)
		},
	}
})

export class Repository extends Context.Service<
	Repository,
	Effect.Success<typeof make>
>()('@domain/pairing/repository') {
	static Layer = Layer.effect(this, make)
	static insert = (
		roundId: RoundSchema.RoundId,
		pairs: (readonly [person1: Person.PersonId, person2: Person.PersonId])[],
	) => this.use((repo) => repo.insert(roundId, pairs))
	static updatePairsByRoundId = (
		roundId: RoundSchema.RoundId,
		pairs: (readonly [Person.PersonId, Person.PersonId])[],
	) => this.use((repo) => repo.updatePairsByRoundId(roundId, pairs))
}
