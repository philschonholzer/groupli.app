import { Db } from '@/adapter/db'
import { PersonsInRounds, Rounds } from '@/adapter/db/schema'
import { Schema } from '@effect/schema'
import { desc, eq } from 'drizzle-orm'
import {
	Array as A,
	Clock,
	Effect,
	Layer,
	Option,
	Order,
	String as S,
	pipe,
} from 'effect'
import { type Group, Pairing, Person, Round } from '..'

const make = Effect.gen(function* () {
	const db = yield* Db

	const decodePerson = Schema.decodeSync(Person.Person)
	const decodePair = Schema.decodeSync(Pairing.PairEntity)
	const decodeExtended = Schema.decodeSync(Round.RoundExtended)

	return {
		getAll: db((client) => client.query.Rounds.findMany()),
		getSixByGroupId: (groupId: Group.GroupId) =>
			db((client) =>
				client.query.Rounds.findMany({
					where: (_, { eq }) => eq(_.group, groupId),
					with: {
						personsInRounds: { with: { person: true } },
						pairings: { with: { person1: true, person2: true } },
					},
					orderBy: desc(Rounds.at),
					limit: 6,
				}),
			).pipe(
				Effect.map(
					A.map((a) =>
						decodeExtended({
							id: a.id,
							at: a.at,
							group: a.group,
							pairings: a.pairings.map((c) => decodePair(c)),
							persons: a.personsInRounds.map((c) => decodePerson(c.person)),
						}),
					),
				),
			),
		get10LastByGroupIdWithPairings: (groupId: Group.GroupId) => {
			const byDate = pipe(
				S.Order,
				Order.mapInput((p: { readonly at: string }) => p.at),
			)

			return db((client) =>
				client.query.Rounds.findMany({
					where: eq(Rounds.group, groupId),
					limit: 10,
					orderBy: desc(Rounds.at),
					with: { pairings: true },
				}),
			).pipe(Effect.map(A.sortBy(byDate)), Effect.map(A.dropRight(1)))
		},
		findLast: (groupId: Group.GroupId) =>
			db((client) =>
				client.query.Rounds.findFirst({
					where: eq(Rounds.group, groupId),
					orderBy: desc(Rounds.at),
				}),
			).pipe(Effect.map(Option.fromNullable)),
		newRound: (groupId: Group.GroupId, persons: Person.PersonId[]) =>
			Effect.gen(function* () {
				const now = yield* Clock.currentTimeMillis
				const round = yield* db((client) =>
					client
						.insert(Rounds)
						.values({ group: groupId, at: new Date(now).toISOString() })
						.returning(),
				).pipe(Effect.map(A.head), Effect.map(Option.getOrThrow))
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
		addPersonToRound: (personId: Person.PersonId, roundId: Round.RoundId) =>
			db((client) =>
				client
					.insert(PersonsInRounds)
					.values({ person: personId, round: roundId })
					.returning(),
			),
		removePersonFromRound: (personInRoundId: number) =>
			db((client) =>
				client
					.delete(PersonsInRounds)
					.where(eq(PersonsInRounds.id, personInRoundId)),
			),
		findPersonInRound: (personId: Person.PersonId, roundId: Round.RoundId) =>
			db((client) =>
				client.query.PersonsInRounds.findFirst({
					where: (p, { and, eq }) =>
						and(eq(p.person, personId), eq(p.round, roundId)),
				}),
			).pipe(Effect.map(Option.fromNullable)),
		getPersonsInRound: (roundId: Round.RoundId) =>
			db((client) =>
				client.query.PersonsInRounds.findMany({
					where: eq(PersonsInRounds.round, roundId),
				}),
			),
	}
})

export class Repository extends Effect.Tag('@domain/round/repository')<
	Repository,
	Effect.Effect.Success<typeof make>
>() {
	static Live = Layer.effect(this, make)
}
