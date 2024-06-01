import { defineConfig } from 'drizzle-kit'
export default defineConfig({
	schema: './src/adapter/db/schema.ts',
	driver: 'd1-http',
	verbose: true,
	strict: true,
	out: './drizzle',
	dialect: 'sqlite',
	// https://orm.drizzle.team/kit-docs/config-reference#dbcredentials
	dbCredentials: {
		accountId: process.env.DRIZZLE_CF_ACCOUNT_ID,
		databaseId: process.env.DRIZZEL_DATABASE_ID,
		token: process.env.DRIZZLE_D1_TOKEN,
	},
})
