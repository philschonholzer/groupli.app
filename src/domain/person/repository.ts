import { Db } from '@/adapter/db'
import { Persons } from '@/adapter/db/schema'
import { Effect, Layer } from 'effect'

const make = Effect.gen(function* () {
	const db = yield* Db

	return {
		getAll: db((client) => client.query.Persons.findMany()),
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
					where: (_, { eq }) => eq(_.group, groupId),
				}),
			),
	}
})

export class Repository extends Effect.Tag('@domain/person/repository')<
	Repository,
	Effect.Effect.Success<typeof make>
>() {
	static Live = Layer.effect(this, make)
}
