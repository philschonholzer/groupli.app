import { run } from '@/adapter/effect'
import { Person } from '@/domain'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { Effect } from 'effect'

export const runtime = 'edge'

export default async function Group(props: { params: { id: string } }) {
	return Effect.gen(function* () {
		const persons = yield* Person.Repository.getByGroupId(
			Number(props.params.id),
		)
		return (
			<ul>
				{persons.map((person) => (
					<li key={person.id}>{person.name}</li>
				))}
			</ul>
		)
	}).pipe(
		Effect.catchAll((e) =>
			Effect.succeed(<div>Error {JSON.stringify(e)}</div>),
		),
		run(getRequestContext().env.DB),
	)
}
