'use client'

import { PopoverAnchor } from '@radix-ui/react-popover'
import { pipe } from 'effect'
import { valueTags } from 'effect/Match'
import { useActionState, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent } from '@/components/ui/popover'
import type { Group, Person } from '@/domain'
import { newRound } from './action'

const NotEnoughPersonsMessage = () => (
	<div className="space-y-2">
		<p className="font-semibold">Not enough people</p>
		<p className="opacity-90">
			There are not enough people to start a pairing round. Add some more
			members.
		</p>
	</div>
)

const DbErrorMessage = ({ message }: { message: unknown }) => (
	<p>
		The Database is not available. Try again later. {JSON.stringify(message)}
	</p>
)

type NewRoundError =
	| { _tag: 'NotEnoughPersonsForRound' }
	| { _tag: 'DbError'; message: unknown }

const renderError = (error: NewRoundError) =>
	pipe(
		error,
		valueTags({
			NotEnoughPersonsForRound: () => <NotEnoughPersonsMessage />,
			DbError: (err) => <DbErrorMessage message={err.message} />,
		}),
	)

export default function StartNextRound(props: {
	groupId: Group.GroupId
	personIds: Person.PersonId[]
	roundsCount: number
}) {
	const newRoundAction = newRound.bind(null, props.groupId, props.personIds)
	const [key, setKey] = useState(0)

	return (
		<Form
			key={key} // Reset the form when the popover closes
			roundsCount={props.roundsCount}
			serverAction={newRoundAction}
			reset={(open: boolean) => !open && setKey((prev) => prev + 1)}
		/>
	)
}
function Form(props: {
	roundsCount: number
	serverAction: () => ReturnType<typeof newRound>
	reset: (p1: boolean) => void
}) {
	const [state, action, _isPending] = useActionState(props.serverAction, {
		_tag: 'Idle',
	})

	return (
		<form action={action}>
			<Popover open={state._tag === 'Failure'} onOpenChange={props.reset}>
				<PopoverAnchor>
					<Button type="submit">
						{props.roundsCount === 0 ? 'Start First Round' : 'Start Next Round'}
					</Button>
				</PopoverAnchor>
				<PopoverContent align="end" className="bg-red-500 p-6">
					{state._tag === 'Failure' && (
						<div className="text-sm text-white">
							{state.cause._tag === 'Fail' ? (
								renderError(state.cause.error as NewRoundError)
							) : (
								<>
									Upps, something went wrong. Please try again later.{' '}
									{JSON.stringify(state.cause)}
								</>
							)}
						</div>
					)}
				</PopoverContent>
			</Popover>
		</form>
	)
}
