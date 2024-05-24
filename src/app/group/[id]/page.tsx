import { run } from '@/adapter/effect'
import { Group, Person, Round } from '@/domain'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { Effect } from 'effect'
import {
	addPerson,
	newRound,
	removePersonFromRound,
	updateName,
} from './action'

export const runtime = 'edge'

export default async function GroupPage(props: { params: { id: string } }) {
	return Effect.gen(function* () {
		const persons = yield* Person.Repository.getByGroupId(props.params.id)
		const personIds = persons.map((person) => person.id)
		const group = yield* Group.Repository.getById(props.params.id)
		const rounds = yield* Round.Repository.getByGroupId(props.params.id)

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
						<li key={person.id}>
							{person.id} {person.name}
						</li>
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
				<h2>Rounds</h2>
				<form
					action={async (formData: FormData) => {
						'use server'
						await newRound(props.params.id, personIds)
					}}
				>
					<button type="submit">New Round</button>
				</form>
				<ul className="space-y-4">
					{rounds.map((round) => (
						<li key={round.id} className="border rounded">
							<h3>
								{round.id} {round.at}
							</h3>
							<ul>
								{round.pairings.map((pair) => (
									<li key={pair.id} className="flex gap-2">
										<form
											action={async (formData) => {
												'use server'
												await removePersonFromRound(
													pair.person1.id,
													round.id,
													props.params.id,
												)
											}}
										>
											{pair.person1.name}
											<button type="submit">✕</button>
										</form>
										<p>-</p>
										<form
											action={async (formData) => {
												'use server'
												await removePersonFromRound(
													pair.person2.id,
													round.id,
													props.params.id,
												)
											}}
										>
											{pair.person2.name}
											<button type="submit">✕</button>
										</form>
									</li>
								))}
							</ul>
						</li>
					))}
				</ul>
			</>
		)
	}).pipe(
		Effect.catchAll((e) =>
			Effect.succeed(<div>Error {JSON.stringify(e)}</div>),
		),
		run(getRequestContext().env.DB),
	)
}
