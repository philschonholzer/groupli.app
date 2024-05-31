import { run } from '@/adapter/effect'
import { Button } from '@/components/ui/button'
import { H2, H3 } from '@/components/ui/typography'
import { Group, Person, Round } from '@/domain'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { Effect } from 'effect'
import type { Metadata } from 'next'
import { newRound } from './action'
import AddPerson from './add-person'
import GroupNameForm from './group-name-form'
import PersonCard from './person-card'
import PersonPill from './person-pill'
import { SkipRoundButton } from './skip-round-button'

export const runtime = 'edge'

export const metadata: Metadata = {
	robots: {
		index: false,
		follow: false,
	},
}
export default async function GroupPage(props: { params: { id: string } }) {
	return Effect.gen(function* () {
		const persons = yield* Person.Repository.getByGroupId(props.params.id)
		const personIds = persons.map((person) => person.id)
		const group = yield* Group.Repository.getById(props.params.id)
		if (!group) {
			return <div>Not found</div>
		}
		const rounds = yield* Round.Repository.getSixByGroupId(props.params.id)

		const newRoundAction = newRound.bind(null, props.params.id, personIds)

		return (
			<div className="py-16 space-y-12">
				<header>
					<GroupNameForm group={group} />
				</header>
				<section className="space-y-4">
					<H2>Members</H2>
					<ul className="flex flex-wrap gap-2">
						{persons.map((person) => (
							<PersonPill
								key={person.id}
								person={person}
								groupId={props.params.id}
							/>
						))}
					</ul>
					<AddPerson groupId={props.params.id} />
				</section>

				<section className="space-y-4">
					<header className="flex justify-between">
						<H2>Rounds</H2>
						<form action={newRoundAction}>
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
