import { run } from '@/adapter/effect'
import { Group, Person } from '@/domain'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { Effect } from 'effect'
import { addPerson, updateName } from './action'

export const runtime = 'edge'

export default async function GroupPage(props: { params: { id: string } }) {
	return Effect.gen(function* () {
		const persons = yield* Person.Repository.getByGroupId(props.params.id)
		const group = yield* Group.Repository.getById(props.params.id)

		return (
			<>
				<form
					action={async (formData: FormData) => {
						'use server'
						await updateName(formData.get('name') as string, props.params.id)
					}}
				>
					<h1>
						<label>
							Group{' '}
							<input
								className="bg-slate-900 ring-1 ring-slate-500 rounded-sm"
								type="text"
								name="name"
								id=""
								defaultValue={group?.name}
							/>
						</label>
					</h1>
				</form>
				<ul>
					{persons.map((person) => (
						<li key={person.id}>{person.name}</li>
					))}
				</ul>
				<form
					action={async (formData: FormData) => {
						'use server'
						await addPerson(
							(formData.get('name') as string) ?? 'empty',
							props.params.id,
						)
					}}
				>
					<label>
						Name
						<input
							className="bg-slate-900 ring-1 ring-slate-500 rounded-sm"
							type="text"
							name="name"
							defaultValue={''}
						/>
					</label>
					<button type="submit">Add Person</button>
				</form>
			</>
		)
	}).pipe(
		Effect.catchAll((e) =>
			Effect.succeed(<div>Error {JSON.stringify(e)}</div>),
		),
		run(getRequestContext().env.DB),
	)
}
