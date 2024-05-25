import { run } from '@/adapter/effect'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { H1, H2, H3 } from '@/components/ui/typography'
import { Group, Person, Round } from '@/domain'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { Effect } from 'effect'
import { addPerson, newRound, updateName } from './action'
import PersonCard from './person-card'
import { SkipRoundButton } from './skip-round-button'

export const runtime = 'edge'

export default async function GroupPage(props: { params: { id: string } }) {
	return Effect.gen(function* () {
		const persons = yield* Person.Repository.getByGroupId(props.params.id)
		const personIds = persons.map((person) => person.id)
		const group = yield* Group.Repository.getById(props.params.id)
		const rounds = yield* Round.Repository.getByGroupId(props.params.id)

		return (
			<div className="py-16 space-y-12">
				<header>
					<form
						action={async (formData: FormData) => {
							'use server'
							await updateName(formData.get('name') as string, props.params.id)
						}}
					>
						<H1>
							<label className="flex items-center gap-4">
								Group
								<Input
									className="text-4xl lg:text-5xl h-20"
									type="text"
									name="name"
									id=""
									defaultValue={group?.name}
								/>
							</label>
						</H1>
					</form>
				</header>
				<section className="space-y-4">
					<H2>Members</H2>
					<ul className="flex flex-wrap gap-2">
						{persons.map((person) => (
							<li key={person.id} className="py-2 px-4 border rounded-full">
								<p className="overflow-ellipsis overflow-hidden">
									{person.name}{' '}
									<span className="opacity-20 text-xs">#{person.id}</span>
								</p>
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
						<Label htmlFor="add-person">Name</Label>
						<div className="flex gap-4">
							<Input
								id="add-person"
								className=""
								type="text"
								name="name"
								placeholder='e.g. "Greta"'
								defaultValue={''}
							/>
							<Button variant="secondary" type="submit">
								Add Person
							</Button>
						</div>
					</form>
				</section>

				<section className="space-y-4">
					<header className="flex justify-between">
						<H2>Rounds</H2>
						<form
							action={async () => {
								'use server'
								await newRound(props.params.id, personIds)
							}}
						>
							<Button type="submit">New Round</Button>
						</form>
					</header>
					<ul className="space-y-4">
						{rounds.map((round, roundIndex) => (
							<li
								key={round.id}
								className="border rounded p-4 space-y-4 shadow-sm"
							>
								<H3>
									{new Date(round.at).toLocaleString('sv-SE')}{' '}
									<span className="text-sm text-foreground/20">
										#{round.id}
									</span>
								</H3>
								<ul className="flex flex-wrap gap-x-2 gap-y-6 justify-center pb-4">
									{round.pairings.map((pair, pairIndex) => (
										<li key={pair.id} className="">
											<ul
												className={`flex gap-2 ${
													pairIndex % 3
														? 'rotate-6'
														: pairIndex % 2
															? '-rotate-3'
															: 'rotate-3'
												}`}
											>
												<PersonCard
													person={pair.person1}
													className="-rotate-12 translate-x-3 z-10"
												>
													{roundIndex === 0 && (
														<SkipRoundButton
															groupId={props.params.id}
															roundId={round.id}
															personId={pair.person1.id}
														/>
													)}
												</PersonCard>
												<PersonCard
													person={pair.person2}
													className="rotate-6 -translate-x-3"
												>
													{roundIndex === 0 && (
														<SkipRoundButton
															groupId={props.params.id}
															roundId={round.id}
															personId={pair.person2.id}
														/>
													)}
												</PersonCard>
											</ul>
										</li>
									))}
								</ul>
							</li>
						))}
					</ul>
				</section>
			</div>
		)
	}).pipe(
		Effect.catchAll((e) =>
			Effect.succeed(<div>Error {JSON.stringify(e)}</div>),
		),
		run(getRequestContext().env.DB),
	)
}
