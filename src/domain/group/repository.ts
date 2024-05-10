import { Db } from '@/adapter/db'
import { Groups } from '@/adapter/db/schema'
import { Effect, Layer } from 'effect'

const make = Effect.gen(function* () {
	const db = yield* Db

	return {
		getAll: db((client) => client.query.Groups.findMany()),
		getById: (id: string) =>
			db((client) =>
				client.query.Groups.findFirst({ where: (_, { eq }) => eq(_.id, id) }),
			),
		insert: (props: { id: string; name: string }) =>
			db((client) =>
				client.insert(Groups).values({ id: props.id, name: props.name }),
			),
	}
})

export class Repository extends Effect.Tag('@domain/group/repository')<
	Repository,
	Effect.Effect.Success<typeof make>
>() {
	static Live = Layer.effect(this, make)
}
