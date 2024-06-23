import assert from 'node:assert'
import { defineConfig } from 'drizzle-kit'

const accountId = process.env.DRIZZLE_CF_ACCOUNT_ID
const databaseId = process.env.DRIZZEL_PRODUCTION_DATABASE_ID
const token = process.env.DRIZZLE_D1_TOKEN

assert(accountId, 'Missing DRIZZLE_CF_ACCOUNT_ID')
assert(databaseId, 'Missing DRIZZEL_PRODUCTION_DATABASE_ID')
assert(token, 'Missing DRIZZLE_D1_TOKEN')

export default defineConfig({
	schema: './src/adapter/db/schema.ts',
	driver: 'd1-http',
	verbose: true,
	strict: true,
	out: './drizzle',
	dialect: 'sqlite',
	// https://orm.drizzle.team/kit-docs/config-reference#dbcredentials
	dbCredentials: {
		accountId,
		databaseId,
		token,
	},
})
