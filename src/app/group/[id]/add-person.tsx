'use client'

import { pipe } from 'effect'
import { valueTags } from 'effect/Match'
import { useActionState, useId, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { GroupId } from '@/domain/group'
import { addPerson } from './action'

const NameRequiredErrorMessage = ({ message }: { message: string }) => (
	<p>{message}</p>
)

const TooManyPersonsInGroupMessage = () => (
	<p>There are already 14 persons in the group. You can't add more.</p>
)

const DbErrorMessage = ({ message }: { message: unknown }) => (
	<p>
		The Database is not available. Try again later. {JSON.stringify(message)}
	</p>
)

type AddPersonError =
	| { _tag: 'NameRequiredError'; message: string }
	| { _tag: 'TooManyPersonsInGroup' }
	| { _tag: 'DbError'; message: unknown }

const renderError = (error: AddPersonError) =>
	pipe(
		error,
		valueTags({
			NameRequiredError: (err) => (
				<NameRequiredErrorMessage message={err.message} />
			),
			TooManyPersonsInGroup: () => <TooManyPersonsInGroupMessage />,
			DbError: (err) => <DbErrorMessage message={err.message} />,
		}),
	)

export default function AddPerson(props: { groupId: GroupId }) {
	const addPersonAction = addPerson.bind(null, props.groupId)
	const [state, action] = useActionState(addPersonAction, { _tag: 'Idle' })
	const ref = useRef<HTMLFormElement>(null)
	const inputId = useId()

	if (state._tag === 'Success' && ref.current) {
		ref.current.reset()
	}

	return (
		<form action={action} ref={ref}>
			<Label htmlFor={inputId}>Name</Label>
			<div className="flex gap-4">
				<Input
					id={inputId}
					className=""
					type="text"
					name="name"
					placeholder='e.g. "Alice"'
				/>
				<Button variant="secondary" type="submit">
					Add Person
				</Button>
			</div>
			{state._tag === 'Failure' &&
				(state.cause._tag === 'Fail' ? (
					<div className="pt-1 text-red-600">
						{renderError(state.cause.error as AddPersonError)}
					</div>
				) : (
					<p className="pt-1 text-red-600">
						Upps, something went wrong. Please try again later.{' '}
						{JSON.stringify(state.cause)}
					</p>
				))}
		</form>
	)
}
