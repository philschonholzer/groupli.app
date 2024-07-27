import { type Client, createClient } from '@libsql/client'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import { drizzle as libSqlDrizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { Layer } from 'effect'
import { DatabaseClient } from './db-client'
import { OrmClient } from './orm-client'
import * as schema from './schema'

const makeDbClient = () => {
	const db = createClient({ url: ':memory:' })
	return db as unknown as D1Database
}
const makeOrmClient = (db: D1Database): DrizzleD1Database<typeof schema> => {
	const ormClient = libSqlDrizzle(db as unknown as Client, {
		schema,
	})
	migrate(ormClient, { migrationsFolder: 'drizzle' })
	return ormClient as unknown as DrizzleD1Database<typeof schema>
}
export const LibSqlClients = () => {
	const LibSqlDbLive = Layer.succeed(DatabaseClient, makeDbClient())
	const LibSqlDrizzleLive = Layer.succeed(OrmClient, makeOrmClient)
	const LibSqlLayer = Layer.merge(LibSqlDbLive, LibSqlDrizzleLive)
	return LibSqlLayer
}
