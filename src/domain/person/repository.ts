import { Db } from '@/adapter/db'
import { Persons } from '@/adapter/db/schema'
import { Schema } from '@effect/schema'
import { eq } from 'drizzle-orm'
import { Array as A, Effect, Layer } from 'effect'
import type { PersonId } from '.'
import { Person } from '..'

const make = Effect.gen(function* () {
	const db = yield* Db
	const decode = Schema.decodeSync(Person.Person)

	return {
		insert: (name: string, groupId: string) =>
			db((client) =>
				client
					.insert(Persons)
					.values({ name, group: groupId })
					.returning()
					.get(),
			),
		getByGroupId: (groupId: string) =>
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
	}
})

export class Repository extends Effect.Tag('@domain/person/repository')<
	Repository,
	Effect.Effect.Success<typeof make>
>() {
	static Live = Layer.effect(this, make)
}
