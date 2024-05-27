'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRef } from 'react'
import { useFormState } from 'react-dom'
import type { AddPersonState } from './action'

export default function AddPerson(props: {
	groupId: string
	action: (
		prevState: AddPersonState,
		formData: FormData,
	) => Promise<AddPersonState>
}) {
	const [state, action] = useFormState(props.action, { kind: 'idle' })
	const ref = useRef<HTMLFormElement>(null)

	if (state.kind === 'success' && ref.current) {
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
			{state.kind === 'error' && (
				<p className="text-red-600 pt-1">{state.error}</p>
			)}
		</form>
	)
}
