import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { Effect, Layer } from 'effect'
import { Db, DbError } from '.'
import * as schema from './schema'

const make = Effect.gen(function* () {
	const db = createClient({ url: ':memory:' })
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

// @ts-ignore
export const DbTest = Layer.effect(Db, make)
