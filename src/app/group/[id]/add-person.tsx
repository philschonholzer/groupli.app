'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { pipe } from 'effect'
import { valueTags } from 'effect/Match'
import { useActionState, useRef } from 'react'
import { addPerson } from './action'
import type { GroupId } from '@/domain/group'

export default function AddPerson(props: {
	groupId: GroupId
}) {
	const addPersonAction = addPerson.bind(null, props.groupId)
	const [state, action] = useActionState(addPersonAction, { _tag: 'Idle' })
	const ref = useRef<HTMLFormElement>(null)

	if (state._tag === 'Success' && ref.current) {
		ref.current.reset()
	}

	return (
		<form action={action} ref={ref}>
			<Label htmlFor="add-person">Name</Label>
			<div className="flex gap-4">
				<Input
					id="add-person"
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
					<div className="text-red-600 pt-1">
						{pipe(
							state.cause.error,
							valueTags({
								NameRequiredError: (error) => <p>{error.message}</p>,
								TooManyPersonsInGroup: () => (
									<p>There are already 14 persons in the group. You can't add more.</p>
								),
								DbError: (error) => (
									<p>
										The Database is not available. Try again later.{' '}
										{JSON.stringify(error.cause)}
									</p>
								),
							}),
						)}
					</div>
				) : (
					<p className="text-red-600 pt-1">
						Upps, something went wrong. Please try again later.{' '}
						{JSON.stringify(state.cause)}
					</p>
				))}
		</form>
	)
}
