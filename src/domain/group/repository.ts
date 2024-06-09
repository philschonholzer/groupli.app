import { Db } from '@/adapter/db'
import { Groups } from '@/adapter/db/schema'
import { eq } from 'drizzle-orm'
import { Array as A, Effect, Layer, Option } from 'effect'
import { Schema } from '@effect/schema'
import { Group } from '..'

const make = Effect.gen(function* () {
	const db = yield* Db

	const decode = Schema.decodeUnknownSync(Group.Group)

	return {
		getAll: db((client) => client.query.Groups.findMany()).pipe(
			Effect.map(A.map((_) => decode(_))),
		),
		getById: (id: Group.GroupId) =>
			db((client) =>
				client.query.Groups.findFirst({ where: (_, { eq }) => eq(_.id, id) }),
			).pipe(Effect.map(Option.fromNullable), Effect.map(Option.map(decode))),
		insert: (props: { id: Group.GroupId; name: string }) =>
			db((client) =>
				client.insert(Groups).values({ id: props.id, name: props.name }),
			),
		updateName: (id: Group.GroupId, name: string) =>
			db((client) =>
				client.update(Groups).set({ name }).where(eq(Groups.id, id)),
			),
	}
})

export class Repository extends Effect.Tag('@domain/group/repository')<
	Repository,
	Effect.Effect.Success<typeof make>
>() {
	static Live = Layer.effect(this, make)
}
