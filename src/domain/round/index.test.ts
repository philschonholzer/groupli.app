import assert from 'node:assert'
import { describe, it } from 'node:test'
import { runWithTestDb } from '@/adapter/effect/test-runner'
import { Clock, Console, Duration, Effect } from 'effect'
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

	it('should shuffle a round', () =>
		Effect.gen(function* () {
			const group = yield* Group.newGroup
			const jenny = yield* Person.add('Jenny', group.id)
			const carl = yield* Person.add('Carl', group.id)
			const lisa = yield* Person.add('Lisa', group.id)
			const karen = yield* Person.add('Karen', group.id)
			const members = [jenny.id, carl.id, lisa.id, karen.id]

			const firstRound = yield* Round.newRound(group.id, members)

			yield* Clock.sleep(Duration.seconds(5))

			yield* Round.newRound(group.id, members)

			yield* Round.shufflePairings(group.id).pipe(
				Effect.tap((_) => assert.notDeepEqual(firstRound.pairings, _.pairings)),
				Effect.repeatN(6),
			)
		}).pipe(
			Effect.catchAll((e) => Console.log('Error', e, e.cause)),
			runWithTestDb,
		))
})
