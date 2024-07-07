import { Schema } from '@effect/schema'
import { Effect, Option } from 'effect'
import { type Group, Pairing, Person } from '..'
import { Repository } from './repository'

export * from './repository'

export const Round = Schema.Struct({
	id: Schema.Number,
	group: Schema.String,
	at: Schema.String,
	persons: Schema.Array(Person.Person),
	pairings: Schema.Array(Pairing.PairEntity),
})
export type Round = typeof Round.Type

export const newRound = (
	groupId: Group.GroupId,
	personIds: Person.PersonId[],
) =>
	Effect.gen(function* () {
		if (personIds.length < 2) {
			return yield* new NotEnoughPersonsForRound()
		}

		const { round } = yield* Repository.newRound(groupId, personIds)

		const pairings = yield* Pairing.pairPersons(groupId, personIds)

		if (Option.isSome(pairings)) {
			yield* Pairing.Repository.insert(round.id, pairings.value)
		}

		return { round, pairings }
	})

export const shufflePairings = (groupId: Group.GroupId) =>
	Effect.gen(function* () {
		const round = yield* Repository.findLast(groupId)
		if (Option.isNone(round)) {
			return yield* new NoRoundFound()
		}
		const personsInRound = yield* Repository.getPersonsInRound(round.value.id)
		const pairings = yield* Pairing.pairPersons(
			groupId,
			personsInRound.map((p) => p.person),
		)

		if (Option.isSome(pairings)) {
			yield* Pairing.Repository.updatePairsByRoundId(
				round.value.id,
				pairings.value,
			)
		}

		return { round: round.value, pairings }
	})

export const removePersonFromRound = (
	personId: Person.PersonId,
	roundId: number,
	groupId: Group.GroupId,
) =>
	Effect.gen(function* () {
		const personsInRound = yield* Repository.getPersonsInRound(roundId)
		if (personsInRound.length < 3) {
			return yield* new NotEnoughPersonsForRound()
		}
		const personInRound = yield* Repository.findPersonInRound(personId, roundId)
		if (Option.isSome(personInRound)) {
			yield* Repository.removePersonFromRound(personInRound.value.id)
		}

		const personsLeftInRound = yield* Repository.getPersonsInRound(roundId)
		const pairings = yield* Pairing.pairPersons(
			groupId,
			personsLeftInRound.map((p) => p.person),
		)
		if (Option.isSome(pairings)) {
			yield* Pairing.Repository.updatePairsByRoundId(roundId, pairings.value)
		}
		return pairings
	})

export class NoRoundFound extends Schema.TaggedError<NoRoundFound>()(
	'NoRoundFound',
	{},
) {}

export class NotEnoughPersonsForRound extends Schema.TaggedError<NotEnoughPersonsForRound>()(
	'NotEnoughPersonsForRound',
	{},
) {}
