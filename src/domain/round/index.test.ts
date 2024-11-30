import assert from 'node:assert'
import { runWithInMemoryDb } from '@/adapter/effect/run-with-in-memory-db'
import { Console, Effect, TestClock } from 'effect'
import { describe, it } from 'vitest'
import { NotEnoughPersonsForRound } from '.'
import { Group, Person, Round } from '..'

describe('Round domain', () => {
	it('should start a new round', () =>
		Effect.gen(function* () {
			const group = yield* Group.newGroup
			const jenny = yield* Person.add('Jenny', group.id)
			const carl = yield* Person.add('Carl', group.id)
			const round = yield* Round.newRound(group.id, [jenny.id, carl.id])

			assert.deepEqual(round, {
				pairings: {
					value: [[1, 2]],
				},
				round: {
					at: '1970-01-01T00:00:00.000Z',
					group: 'test-uuid-0',
					id: 1,
				},
			})
		}).pipe(
			Effect.catchAll((e) => Console.log('Error', e, e.cause)),
			runWithInMemoryDb,
		))
	it('should not allow a new round with less then 2 persons', () =>
		Effect.gen(function* () {
			const group = yield* Group.newGroup
			const person = yield* Person.add('Jenny', group.id)
			const error = yield* Round.newRound(group.id, [person.id]).pipe(
				Effect.flip,
			)

			assert.equal(error instanceof NotEnoughPersonsForRound, true)
		}).pipe(
			Effect.catchAll((e) => Console.log('Error', e)),
			runWithInMemoryDb,
		))

	it('should shuffle a round', () =>
		Effect.gen(function* () {
			const group = yield* Group.newGroup
			const jenny = yield* Person.add('Jenny', group.id)
			const carl = yield* Person.add('Carl', group.id)
			const lisa = yield* Person.add('Lisa', group.id)
			const karen = yield* Person.add('Karen', group.id)
			const members = [jenny.id, carl.id, lisa.id, karen.id]

			const firstRound = yield* Round.newRound(group.id, members)

			yield* TestClock.adjust('1 minute')

			yield* Round.newRound(group.id, members)

			yield* Round.shufflePairings(group.id).pipe(
				Effect.tap((_) => assert.notDeepEqual(firstRound.pairings, _.pairings)),
				Effect.repeatN(6),
			)
		}).pipe(
			Effect.catchAll((e) => Console.log('Error', e, e.cause)),
			runWithInMemoryDb,
		))

	it('should shuffle the correct round', () =>
		Effect.gen(function* () {
			const group = yield* Group.newGroup
			const jenny = yield* Person.add('Jenny', group.id)
			const carl = yield* Person.add('Carl', group.id)
			const lisa = yield* Person.add('Lisa', group.id)
			const karen = yield* Person.add('Karen', group.id)
			const members = [jenny.id, carl.id, lisa.id, karen.id]

			const firstRound = yield* Round.newRound(group.id, members)

			yield* TestClock.adjust('5 seconds')

			yield* createSecondGroup

			yield* Round.shufflePairings(group.id).pipe(
				Effect.tap((_) => assert.equal(firstRound.round.group, _.round.group)),
				Effect.repeatN(6),
			)
		}).pipe(
			Effect.catchAll((e) => Console.log('Error', e, e.cause)),
			runWithInMemoryDb,
		))

	describe('removePersonFromRound', () => {
		it('should remove a person from a round', () =>
			Effect.gen(function* () {
				const group = yield* Group.newGroup
				const jenny = yield* Person.add('Jenny', group.id)
				const carl = yield* Person.add('Carl', group.id)
				const petra = yield* Person.add('Petra', group.id)

				yield* assertRemovedCorrectPerson(group.id, jenny.id, [
					jenny.id,
					carl.id,
					petra.id,
				]).pipe(Effect.repeatN(6))
			}).pipe(
				Effect.catchAll((e) => Console.log('Error', e)),
				runWithInMemoryDb,
			))
	})
})

const assertRemovedCorrectPerson = (
	groupId: Group.GroupId,
	personToRemoveId: Person.PersonId,
	personIds: Person.PersonId[],
) =>
	Effect.gen(function* () {
		yield* TestClock.adjust('1 second')
		const round = yield* Round.newRound(groupId, personIds)
		yield* Round.removePersonFromRound(
			personToRemoveId,
			round.round.id,
			groupId,
		)

		const rounds = yield* Round.Repository.getSixByGroupId(groupId)

		assert.equal(
			rounds[0].pairings
				.flatMap((s) => [s.person1.id, s.person2.id])
				.includes(personToRemoveId),
			false,
		)
	})

const createSecondGroup = Effect.gen(function* () {
	const group2 = yield* Group.newGroup
	const peter = yield* Person.add('Peter', group2.id)
	const mona = yield* Person.add('Mona', group2.id)
	const jester = yield* Person.add('Jester', group2.id)
	const members2 = [peter.id, mona.id, jester.id]

	yield* Round.newRound(group2.id, members2)
})
