import Database from 'better-sqlite3'
import { type BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { Context, Layer } from 'effect'
import * as schema from './schema'

const makeOrmClient = (url: string) => {
	console.log('db url: %s', url)
	const sqlite = new Database(url)
	const ormClient = drizzle(sqlite, {
		schema,
		casing: 'snake_case',
	})
	migrate(ormClient, { migrationsFolder: 'drizzle' })
	process.on('exit', () => sqlite.close())
	process.on('SIGHUP', () => process.exit(128 + 1))
	process.on('SIGINT', () => process.exit(128 + 2))
	process.on('SIGTERM', () => process.exit(128 + 15))
	return ormClient
}

export class OrmClient extends Context.Tag('@adapter/db/orm-client')<
	OrmClient,
	BetterSQLite3Database<typeof schema>
>() {
	static Live = Layer.succeed(this, makeOrmClient(process.env.DB_URL ?? ''))
	static InMemory = Layer.succeed(this, makeOrmClient(''))
}
