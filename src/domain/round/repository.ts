import { Db } from '@/adapter/db'
import { PersonsInRounds, Rounds } from '@/adapter/db/schema'
import { desc } from 'drizzle-orm'
import { Array as A, Effect, Layer, Option } from 'effect'

const make = Effect.gen(function* () {
	const db = yield* Db

	return {
		getAll: db((client) => client.query.Rounds.findMany()),
		getByGroupId: (groupId: string) =>
			db((client) =>
				client.query.Rounds.findMany({
					where: (_, { eq }) => eq(_.group, groupId),
					with: { personsInRounds: { with: { person: true } } },
					orderBy: desc(Rounds.at),
				}),
			).pipe(
				Effect.map(
					A.map((a) => ({
						...a,
						persons: a.personsInRounds.map((c) => c.person),
					})),
				),
			),
		findLast: (groupId: string) =>
			db((client) =>
				client.query.Rounds.findFirst({ orderBy: desc(Rounds.at) }),
			).pipe(Effect.map(Option.fromNullable)),
		newRound: (groupId: string, persons: number[]) =>
			Effect.gen(function* () {
				const [round] = yield* db((client) =>
					client
						.insert(Rounds)
						.values({ group: groupId, at: new Date().toISOString() })
						.returning(),
				)
				if (persons.length === 0) {
					return { round, personsInRound: [] }
				}

				const personsInRound = yield* db((client) =>
					client
						.insert(PersonsInRounds)
						.values(persons.map((person) => ({ person, round: round.id })))
						.returning(),
				)
				return { round, personsInRound }
			}),
		addPersonToRound: (personId: number, roundId: number) =>
			db((client) =>
				client
					.insert(PersonsInRounds)
					.values({ person: personId, round: roundId })
					.returning()
					.get(),
			),
	}
})

export class Repository extends Effect.Tag('@domain/round/repository')<
	Repository,
	Effect.Effect.Success<typeof make>
>() {
	static Live = Layer.effect(this, make)
}
