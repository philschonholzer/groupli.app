import { Schema } from '@effect/schema'
import { drizzle } from 'drizzle-orm/d1'
import { Context, Effect, Layer } from 'effect'
import * as schema from './schema'

const make = (db: D1Database) => {
	const dBclient = drizzle(db, { schema: schema })

	const query = <A>(body: (client: typeof dBclient) => Promise<A>) => {
		const sqlStatement = (
			body(dBclient) as unknown as { toSQL: () => { sql: string } }
		).toSQL().sql

		return Effect.tryPromise<A, DbError>({
			try: () => body(dBclient),
			catch: (cause) => {
				console.error('DbError', cause)
				return new DbError({ cause: cause })
			},
		}).pipe(Effect.withSpan('Db.query', { attributes: { sql: sqlStatement } }))
	}

	return query
}

type _Db = ReturnType<typeof make>

export class Db extends Context.Tag('@adapter/db')<Db, _Db>() {
	static Live = (db: D1Database) => Layer.succeed(this, make(db))
	// Would be needed with Effect.Tag
	// static readonly query = <A>(
	// 	body: (client: DrizzleD1Database<Record<string, never>>) => Promise<A>,
	// ) => this.use((_) => _.query(body))
}

export class DbError extends Schema.TaggedError<DbError>()('DbError', {
	cause: Schema.Unknown,
}) {}
