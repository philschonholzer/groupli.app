import { Context, Effect, Layer, Schema } from 'effect'
import { OrmClient } from './orm-client'

const make = Effect.gen(function* () {
	const ormClient = yield* OrmClient

	const db = ormClient

	const query = <A>(body: (client: typeof db) => Promise<A>) => {
		const sqlStatement = (
			body(db) as unknown as { toSQL?: () => { sql: string } }
		).toSQL?.().sql

		return Effect.tryPromise<A, DbError>({
			try: () => body(db),
			catch: (message) => {
				console.error('DbError', message)
				return new DbError({ message: message })
			},
		}).pipe(Effect.withSpan('Db.query', { attributes: { sql: sqlStatement } }))
	}

	return query
})

type _Db = Effect.Effect.Success<typeof make>

export class Db extends Context.Tag('@adapter/db')<Db, _Db>() {
	// Would be needed with Effect.Tag
	// static readonly query = <A>(
	// 	body: (client: DrizzleD1Database<Record<string, never>>) => Promise<A>,
	// ) => this.use((_) => _.query(body))
	static Live = Layer.effect(this, make).pipe(Layer.provide(OrmClient.Live))
	static Layer = Layer.effect(this, make)
}

export class DbError extends Schema.TaggedError<DbError>()('DbError', {
	message: Schema.Unknown,
}) {}
