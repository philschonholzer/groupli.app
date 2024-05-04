import { getRequestContext } from '@cloudflare/next-on-pages'
import { drizzle } from 'drizzle-orm/d1'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
	// const db = getRequestContext().env.DB

	// const { results } = await db
	// 	.prepare('SELECT * FROM Persons WHERE Name LIKE ?')
	// 	.bind(request.nextUrl.searchParams.get('name') || '%')
	// 	.all()
	const db = drizzle(getRequestContext().env.DB)
	const results = await db.select().from(persons).all()

	return Response.json(results)
}

const persons = sqliteTable('Persons', {
	id: integer('Id').primaryKey(),
	name: text('Name'),
	color: text('Color'),
})
// In the edge runtime you can use Bindings that are available in your application
// (for more details see:
//    - https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site/#use-bindings-in-your-nextjs-application
//    - https://developers.cloudflare.com/pages/functions/bindings/
// )
