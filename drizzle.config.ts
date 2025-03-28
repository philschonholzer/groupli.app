import { defineConfig } from 'drizzle-kit'
export default defineConfig({
	dialect: 'sqlite',
	schema: './src/adapter/db/schema.ts',
	verbose: true,
	strict: true,
	out: './drizzle',
	dbCredentials: {
		url: './data.sqlite',
	},
	// https://orm.drizzle.team/kit-docs/config-reference#dbcredentials
})
