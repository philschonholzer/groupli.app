import { Schema } from '@effect/schema'
import { drizzle } from 'drizzle-orm/d1'
import { Context, Effect, Layer } from 'effect'
import * as schema from './schema'
import { getRequestContext } from '@cloudflare/next-on-pages'

const make = (db: D1Database) => {
	const dBclient = drizzle(db, { schema: schema })

	const query = <A>(body: (client: typeof dBclient) => Promise<A>) =>
		Effect.tryPromise<A, DbError>({
			try: () => body(dBclient),
			catch: (cause) => {
				console.error('DbError', cause)
				return new DbError({ cause: JSON.stringify(cause) })
			},
		}).pipe(Effect.withSpan('query'))

	return query
}

export class Db extends Context.Tag('@adapter/db')<
	Db,
	ReturnType<typeof make>
>() {
	static Live = (db: D1Database) => Layer.succeed(this, make(db))
	// Would be needed with Effect.Tag
	// static readonly query = <A>(
	// 	body: (client: DrizzleD1Database<Record<string, never>>) => Promise<A>,
	// ) => this.use((_) => _.query(body))
}

export class DbError extends Schema.TaggedError<DbError>()('DbError', {
	cause: Schema.Unknown,
}) {}
