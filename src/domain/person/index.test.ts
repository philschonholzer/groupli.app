import assert from 'node:assert'
import { describe, it } from 'node:test'
import { Db, DbError } from '@/adapter/db'
import { RepositoryLive } from '@/adapter/effect/repository-layer'
import { NameRequired } from '@/app/group/[id]/errors'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { Console, Effect, Layer } from 'effect'
import { nanoid } from 'nanoid'
import { Group, type Pairing, Person, type Round } from '..'
import * as schema from '../../adapter/db/schema'

const make = Effect.gen(function* () {
	const db = new Database(':memory:')
	db.pragma('journal_mode = WAL')
	const dBclient = drizzle(db, { schema: schema })

	migrate(dBclient, { migrationsFolder: 'drizzle' })

	const query = <A>(body: (client: typeof dBclient) => Promise<A>) =>
		Effect.tryPromise<A, DbError>({
			try: () => body(dBclient),
			catch: (cause) => {
				console.error('DbError', cause)
				return new DbError({ cause: cause })
			},
		}).pipe(Effect.withSpan('query'))

	return query
})

function runTest<A, I>(
	effect: Effect.Effect<
		A,
		I,
		Round.Repository | Pairing.Repository | Person.Repository | Group.Repository
	>,
) {
	// @ts-ignore
	const DbTest = Layer.effect(Db, make)
	const MainTest = Layer.provide(RepositoryLive, DbTest)
	return effect.pipe(Effect.provide(MainTest), (a) => a, Effect.runPromise)
}

describe('Person', () => {
	it('should add a person', () =>
		Effect.gen(function* () {
			const group = yield* Group.newGroup
			const [{ group: groupId, ...person }] = yield* Person.add('foo', group.id)
			const [result] = yield* Person.Repository.getByGroupId(group.id)

			assert.deepStrictEqual(person, result)
			assert.equal(result.name, 'foo')
			assert.equal(result.status, 'active')
		}).pipe(
			Effect.catchAll((e) => Console.log('Error', e, e.cause)),
			runTest,
		))
	it('should allow to add 14 persons to a group', () =>
		Effect.gen(function* () {
			const group = yield* Group.newGroup
			const [person] = yield* Person.add(nanoid(), group.id).pipe(
				Effect.repeatN(13),
			)
			assert.equal(person.id, 14)
		}).pipe(runTest))
	it('should not allow to add more than 14 persons to a group', () =>
		Effect.gen(function* () {
			const group = yield* Group.newGroup
			const error = yield* Person.add(nanoid(), group.id).pipe(
				Effect.repeatN(15),
				Effect.flip,
			)

			assert.equal(error instanceof Person.TooManyPersonsInGroup, true)
			assert.equal(error._tag, 'TooManyPersonsInGroup')
		}).pipe(runTest))
	it('should rename a person', () =>
		Effect.gen(function* () {
			const group = yield* Group.newGroup
			const [person] = yield* Person.add('foo', group.id)
			yield* Person.rename(person.id, 'bar')
			const [result] = yield* Person.Repository.getByGroupId(group.id)

			assert.equal(result.name, 'bar')
		}).pipe(runTest))
	it('should not rename a person with an empty name', () =>
		Effect.gen(function* () {
			const group = yield* Group.newGroup
			const [person] = yield* Person.add('foo', group.id)
			const error = yield* Person.rename(person.id, '').pipe(Effect.flip)

			assert.equal(error instanceof NameRequired, true)
		}).pipe(runTest))
	it('should remove a person', () =>
		Effect.gen(function* () {
			const group = yield* Group.newGroup
			const [person] = yield* Person.add('foo', group.id)
			yield* Person.removePerson(person.id)
			const result = yield* Person.Repository.getById(person.id).pipe(
				Effect.flatten,
			)

			assert.equal(result.status, 'inactive')
		}).pipe(runTest))
})
