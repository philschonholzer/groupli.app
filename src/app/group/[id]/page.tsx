import { run } from '@/adapter/effect'
import { Button } from '@/components/ui/button'
import { H2, H3 } from '@/components/ui/typography'
import { Group, Person, Round } from '@/domain'
import { Effect, Option } from 'effect'
import type { Metadata } from 'next'
import { shufflePairingsInRound } from './action'
import AddPerson from './add-person'
import CopyToClipboard from './copy-to-clipboard'
import GroupNameForm from './group-name-form'
import PersonCard from './person-card'
import PersonPill from './person-pill'
import { SkipRoundButton } from './skip-round-button'
import StartNextRound from './start-next-round'

export const runtime = 'edge'

export const metadata: Metadata = {
	robots: {
		index: false,
		follow: false,
	},
}
export default async function GroupPage(props: {
	params: { id: Group.GroupId }
}) {
	return Effect.gen(function* () {
		const personsEff = Person.Repository.getByGroupId(props.params.id)
		const groupEff = Group.Repository.getById(props.params.id)
		const roundsEff = Round.Repository.getSixByGroupId(props.params.id)
		const [persons, group, rounds] = yield* Effect.all(
			[personsEff, groupEff, roundsEff],
			{ concurrency: 'unbounded' },
		)

		if (Option.isNone(group)) {
			return <div>Not found</div>
		}

		const personIds = persons.map((person) => person.id)
		const redo = shufflePairingsInRound.bind(null, props.params.id)

		return (
			<div className="py-16 space-y-12">
				<header>
					<GroupNameForm group={group.value} />
				</header>
				<section className="space-y-4">
					<H2>Members</H2>
					<ul className="flex flex-wrap gap-2">
						{persons.map((person) => (
							<PersonPill key={person.id} person={person} groupId={props.params.id} />
						))}
					</ul>
					<AddPerson groupId={props.params.id} />
				</section>

				<section className="space-y-4">
					<header className="flex justify-between">
						<H2>Rounds</H2>

						<StartNextRound
							groupId={props.params.id}
							personIds={personIds}
							roundsCount={rounds.length}
						/>
					</header>
					<ul className="space-y-4">
						{rounds.map((round, roundIndex) => (
							<li key={round.id} className="border rounded p-4 space-y-4 shadow-sm">
								<header className="flex justify-between">
									<H3>
										{new Date(round.at).toLocaleDateString('sv-SE')}{' '}
										<span className="text-sm text-foreground/20">#{round.id}</span>
									</H3>
									{roundIndex === 0 && (
										<div className="flex gap-2">
											<CopyToClipboard round={round} />
											<form action={redo}>
												<Button type="submit" variant={'secondary'}>
													Shuffle
												</Button>
											</form>
										</div>
									)}
								</header>
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
		Effect.catchAll((e) => Effect.succeed(<div>Error {JSON.stringify(e)}</div>)),
		run,
	)
}
