import { run } from '@/adapter/effect'
import { Group } from '@/domain'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { Effect } from 'effect'
import Link from 'next/link'
import { newGroup } from './action'

export const runtime = 'edge'

export default async function Home() {
	return Effect.gen(function* () {
		const groups = yield* Group.Repository.getAll

		return (
			<div>
				<h1>Groupli</h1>
				<h2>New Group</h2>
				<form
					action={async () => {
						'use server'
						await newGroup()
					}}
				>
					<button type="submit">Create New Group</button>
				</form>

				<h2>Existing groups</h2>
				{groups.map((group) => (
					<div key={group.id}>
						<Link href={`/group/${group.id}`}>
							<h1>{group.name}</h1>
						</Link>
					</div>
				))}
			</div>
		)
	}).pipe(
		Effect.catchAll((e) =>
			Effect.succeed(<div>Error {JSON.stringify(e.cause)}</div>),
		),
		run(getRequestContext().env.DB),
	)
}
