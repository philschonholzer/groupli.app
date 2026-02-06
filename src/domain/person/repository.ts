import { eq } from 'drizzle-orm'
import { Array as A, Effect, Layer, Option, Schema } from 'effect'
import { Db } from '@/adapter/db'
import { Persons } from '@/adapter/db/schema'
import type * as Group from '../group'
import { Person, type PersonId } from './schema'

const make = Effect.gen(function* () {
	const db = yield* Db
	const decode = Schema.decodeSync(Person)

	return {
		insert: (name: string, groupId: Group.GroupId) =>
			db((client) =>
				client.insert(Persons).values({ name, group: groupId }).returning(),
			).pipe(
				Effect.map(A.head),
				Effect.map(Option.getOrThrow),
				Effect.map(decode),
			),
		getByGroupId: (groupId: Group.GroupId) =>
			db((client) =>
				client.query.Persons.findMany({
					where: (_, { eq, and }) =>
						and(eq(_.group, groupId), eq(_.status, 'active')),
				}),
			).pipe(Effect.map(A.map((person) => decode(person)))),
		updateName: (id: PersonId, name: string) =>
			db((client) =>
				client.update(Persons).set({ name }).where(eq(Persons.id, id)),
			),
		setInactive: (id: PersonId) =>
			db((client) =>
				client
					.update(Persons)
					.set({ status: 'inactive' })
					.where(eq(Persons.id, id)),
			),
		getById: (id: PersonId) =>
			db((client) =>
				client.query.Persons.findFirst({ where: eq(Persons.id, id) }),
			).pipe(Effect.map(Option.fromNullable), Effect.map(Option.map(decode))),
	}
})

export class Repository extends Effect.Tag('@domain/person/repository')<
	Repository,
	Effect.Effect.Success<typeof make>
>() {
	static Layer = Layer.effect(this, make)
}
