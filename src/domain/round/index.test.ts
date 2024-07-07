import assert from 'node:assert'
import { describe, it } from 'node:test'
import { runWithTestDb } from '@/adapter/effect/test-runner'
import { Clock, Console, Effect } from 'effect'
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
					at: '2024-06-21T11:36:30.332Z',
					group: 'test-uuid',
					id: 1,
				},
			})
		}).pipe(
			Effect.catchAll((e) => Console.log('Error', e, e.cause)),
			runWithTestDb,
		))
	it('should not allow a new round with less then 2 persons', () =>
		Effect.gen(function* () {
			const group = yield* Group.newGroup
			const person = yield* Person.add('Jenny', group.id)
			const error = yield* Round.newRound(group.id, [person.id]).pipe(Effect.flip)

			assert.equal(error instanceof NotEnoughPersonsForRound, true)
		}).pipe(
			Effect.catchAll((e) => Console.log('Error', e)),
			runWithTestDb,
		))

	describe('shufflePairings', () => {})
	describe('removePersonFromRound', () => {
		it('should remove a person from a round', () =>
			Effect.gen(function* () {
				const group = yield* Group.newGroup
				const jenny = yield* Person.add('Jenny', group.id)
				const carl = yield* Person.add('Carl', group.id)
				const petra = yield* Person.add('Petra', group.id)

				assertRemovedCorrectPerson(group.id, jenny.id, [
					jenny.id,
					carl.id,
					petra.id,
				]).pipe(Effect.repeatN(6))
			}).pipe(
				Effect.catchAll((e) => Console.log('Error', e)),
				runWithTestDb,
			))
	})
})

const assertRemovedCorrectPerson = (
	groupId: Group.GroupId,
	jennyId: Person.PersonId,
	personIds: Person.PersonId[],
) =>
	Effect.gen(function* () {
		yield* Clock.sleep(1000)
		const round = yield* Round.newRound(groupId, personIds)
		yield* Round.removePersonFromRound(jennyId, round.round.id, groupId)

		const rounds = yield* Round.Repository.getSixByGroupId(groupId)

		assert.equal(
			rounds[0].pairings
				.flatMap((s) => [s.person1.id, s.person2.id])
				.includes(jennyId),
			false,
		)
	})
