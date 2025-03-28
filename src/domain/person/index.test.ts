import assert from 'node:assert'
import { runWithInMemoryDb } from '@/adapter/effect/run-with-in-memory-db'
import { NameRequired } from '@/app/group/[id]/errors'
import { Effect } from 'effect'
import { nanoid } from 'nanoid'
import { describe, it } from 'vitest'
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
		}).pipe(runWithInMemoryDb))
	it('should allow to add 14 persons to a group', () =>
		Effect.gen(function* () {
			const group = yield* Group.newGroup
			yield* Person.add(nanoid(), group.id).pipe(Effect.repeatN(13))
			const persons = yield* Person.Repository.getByGroupId(group.id)
			assert.equal(persons.length, 14)
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
