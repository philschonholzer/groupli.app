'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { pipe } from 'effect'
import { valueTags } from 'effect/Match'
import { useActionState, useRef } from 'react'
import { addPerson } from './action'

export default function AddPerson(props: {
	groupId: string
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
					<div>
						{pipe(
							state.cause.error,
							valueTags({
								NameRequiredError: (error) => (
									<p className="text-red-600 pt-1">{error.message}</p>
								),
								DbError: (error) => (
									<p className="text-red-600 pt-1">
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
