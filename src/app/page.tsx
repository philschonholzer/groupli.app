import { run } from '@/adapter/effect'
import { Group } from '@/domain'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { Effect } from 'effect'
import Link from 'next/link'

export const runtime = 'edge'

export default async function Home() {
	return Effect.gen(function* () {
		const groups = yield* Group.Repository.getAll

		return (
			<div>
				{groups.map((group) => (
					<div key={group.id}>
						<Link href={`/group/${group.id}`}>
							<h1>{group.name}</h1>
						</Link>
						<p>{group.sessionId}</p>
					</div>
				))}
			</div>
		)
	}).pipe(
		Effect.catchAll((e) =>
			Effect.succeed(<div>Error {JSON.stringify(e)}</div>),
		),
		run(getRequestContext().env.DB),
	)
}
