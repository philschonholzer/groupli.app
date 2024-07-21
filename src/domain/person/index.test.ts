import assert from 'node:assert'
import { describe, it } from 'node:test'
import { runWithInMemoryDb } from '@/adapter/effect/test-runner'
import { NameRequired } from '@/app/group/[id]/errors'
import { Console, Effect } from 'effect'
import { nanoid } from 'nanoid'
import { Group, Person } from '..'

describe('Person', () => {
	it('should add a person', () =>
		Effect.gen(function* () {
			const group = yield* Group.newGroup
			const person = yield* Person.add('foo', group.id)
			const [result] = yield* Person.Repository.getByGroupId(group.id)

			assert.deepStrictEqual(person, result)
			assert.equal(result.name, 'foo')
			assert.equal(result.status, 'active')
		}).pipe(
			Effect.catchAll((e) => Console.log('Error', e, e.cause)),
			runWithInMemoryDb,
		))
	it('should allow to add 14 persons to a group', () =>
		Effect.gen(function* () {
			const group = yield* Group.newGroup
			const person = yield* Person.add(nanoid(), group.id).pipe(Effect.repeatN(13))
			assert.equal(person.id, 14)
		}).pipe(runWithInMemoryDb))
	it('should not allow to add more than 14 persons to a group', () =>
		Effect.gen(function* () {
			const group = yield* Group.newGroup
			const error = yield* Person.add(nanoid(), group.id).pipe(
				Effect.repeatN(15),
				Effect.flip,
			)

			assert.equal(error instanceof Person.TooManyPersonsInGroup, true)
			assert.equal(error._tag, 'TooManyPersonsInGroup')
		}).pipe(runWithInMemoryDb))
	it('should rename a person', () =>
		Effect.gen(function* () {
			const group = yield* Group.newGroup
			const person = yield* Person.add('foo', group.id)
			yield* Person.rename(person.id, 'bar')
			const [result] = yield* Person.Repository.getByGroupId(group.id)

			assert.equal(result.name, 'bar')
		}).pipe(runWithInMemoryDb))
	it('should not rename a person with an empty name', () =>
		Effect.gen(function* () {
			const group = yield* Group.newGroup
			const person = yield* Person.add('foo', group.id)
			const error = yield* Person.rename(person.id, '').pipe(Effect.flip)

			assert.equal(error instanceof NameRequired, true)
		}).pipe(runWithInMemoryDb))
	it('should remove a person', () =>
		Effect.gen(function* () {
			const group = yield* Group.newGroup
			const person = yield* Person.add('foo', group.id)
			yield* Person.removePerson(person.id)
			const result = yield* Person.Repository.getById(person.id).pipe(
				Effect.flatten,
			)

			assert.equal(result.status, 'inactive')
		}).pipe(runWithInMemoryDb))
})
